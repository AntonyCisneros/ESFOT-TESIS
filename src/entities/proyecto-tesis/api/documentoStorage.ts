import { supabase } from "@shared/api/supabase";
import * as FileSystem from "expo-file-system";
import type { ProyectoDocumento } from "../model/types";

const BUCKET_NAME = "proyectos-documentos";
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB (validación opcional)

/**
 * Convierte base64 a Uint8Array (compatible con React Native)
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Valida que el archivo sea un PDF válido
 */
export function validarDocumento(documento: ProyectoDocumento): string | null {
  if (!documento.nombre || !documento.uri) {
    return "Documento no válido";
  }

  if (!documento.tipo.includes("pdf") && !documento.nombre.endsWith(".pdf")) {
    return "Solo se permiten archivos PDF";
  }

  return null;
}

/**
 * Sube un documento PDF a Supabase Storage
 * @param documento Objeto con nombre, uri y tipo del archivo
 * @returns URL pública del documento subido
 */
export async function subirDocumento(
  documento: ProyectoDocumento,
): Promise<string> {
  // Validar el documento
  const error = validarDocumento(documento);
  if (error) {
    throw new Error(error);
  }

  let archivoTemporal: string | null = null;

  try {
    let base64: string;

    console.log("[subirDocumento] URI:", documento.uri);
    console.log(
      "[subirDocumento] Es content://:",
      documento.uri.startsWith("content://"),
    );

    // Para URIs content:// (Android con copyToCacheDirectory), copiar a archivo temporal
    if (documento.uri.startsWith("content://")) {
      console.log(
        "[subirDocumento] Copiando content:// a directorio temporal...",
      );

      // Crear ruta temporal
      const tempDir = `${FileSystem.documentDirectory}temp/`;
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

      archivoTemporal = `${tempDir}${Date.now()}_${documento.nombre}`;

      // Copiar a archivo temporal
      await FileSystem.copyAsync({
        from: documento.uri,
        to: archivoTemporal,
      });

      // Leer el archivo temporal
      base64 = await FileSystem.readAsStringAsync(archivoTemporal, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } else {
      // Para file:// (iOS o archivos locales)
      console.log("[subirDocumento] Leyendo archivo file:// directamente...");
      base64 = await FileSystem.readAsStringAsync(documento.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Subir el archivo
    const urlPublica = await uploadarConBase64(base64, documento.nombre);
    return urlPublica;
  } catch (err) {
    console.error("[subirDocumento] Error completo:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Error desconocido al subir documento",
    );
  } finally {
    // Limpiar archivo temporal si fue creado
    if (archivoTemporal) {
      try {
        console.log("[subirDocumento] Limpiando archivo temporal...");
        await FileSystem.deleteAsync(archivoTemporal, { idempotent: true });
      } catch (cleanupError) {
        console.error("[subirDocumento] Error limpiando:", cleanupError);
      }
    }
  }
}

/**
 * Función auxiliar para subir base64 a Supabase Storage
 */
async function uploadarConBase64(
  base64: string,
  nombreOriginal: string,
): Promise<string> {
  // Convertir base64 a Uint8Array (compatible con React Native)
  const bytes = base64ToUint8Array(base64);

  // Crear un nombre único para el archivo
  const timestamp = Date.now();
  const nombreArchivo = `${timestamp}_${nombreOriginal}`;

  // Subir a Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(nombreArchivo, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadarConBase64]", uploadError.message);
    throw new Error(`Error al subir documento: ${uploadError.message}`);
  }

  // Obtener la URL pública del documento
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(nombreArchivo);

  return publicUrlData.publicUrl;
}

/**
 * Elimina un documento de Supabase Storage
 * @param documentoUrl URL pública del documento
 */
export async function eliminarDocumento(documentoUrl: string): Promise<void> {
  try {
    // Extraer el nombre del archivo de la URL
    const nombreArchivo = documentoUrl.split("/").pop();
    if (!nombreArchivo) {
      throw new Error("No se pudo extraer el nombre del archivo");
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([nombreArchivo]);

    if (error) {
      console.error("[eliminarDocumento]", error.message);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  } catch (err) {
    console.error("[eliminarDocumento]", err);
    throw new Error(
      err instanceof Error ? err.message : "Error al eliminar documento",
    );
  }
}

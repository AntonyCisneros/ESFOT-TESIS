import {
    eliminarDocumento,
    subirDocumento
} from "@entities/proyecto-tesis/api/documentoStorage";
import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type {
    CreateProyectoDto,
    ProyectoDocumento,
    UpdateProyectoDto,
} from "@entities/proyecto-tesis/model/types";

export interface ValidationError {
  field: keyof CreateProyectoDto;
  message: string;
}

/** Valida el formulario antes de enviar a Supabase */
export function validateProyecto(
  dto: Partial<CreateProyectoDto>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!dto.titulo?.trim())
    errors.push({ field: "titulo", message: "El título es obligatorio" });

  if (!dto.autores?.trim())
    errors.push({ field: "autores", message: "Ingresa al menos un autor" });

  if (!dto.tutor_docente?.trim())
    errors.push({
      field: "tutor_docente",
      message: "El tutor docente es obligatorio",
    });

  if (!dto.tecnologias_utilizadas?.trim())
    errors.push({
      field: "tecnologias_utilizadas",
      message: "Especifica las tecnologías",
    });

  if (!dto.fecha_inicio?.trim())
    errors.push({
      field: "fecha_inicio",
      message: "La fecha de inicio es obligatoria",
    });

  if (dto.fecha_inicio && !/^\d{4}-\d{2}-\d{2}$/.test(dto.fecha_inicio))
    errors.push({ field: "fecha_inicio", message: "Formato: AAAA-MM-DD" });

  if (dto.repositorio_github && !/^https?:\/\/.+/.test(dto.repositorio_github))
    errors.push({
      field: "repositorio_github",
      message: "Debe ser una URL válida",
    });

  return errors;
}

/** Crea el proyecto tras validar (con soporte para documento) */
export async function createProyecto(
  dto: CreateProyectoDto,
  documento?: ProyectoDocumento,
) {
  let documentoUrl: string | undefined;

  try {
    // Si hay documento, subirlo primero
    if (documento) {
      documentoUrl = await subirDocumento(documento);
    }

    // Crear el proyecto con la URL del documento
    const proyectoDto: CreateProyectoDto = {
      ...dto,
      documento_url: documentoUrl,
    };

    return await proyectoApi.create(proyectoDto);
  } catch (error) {
    // Si hubo error, eliminar el documento subido
    if (documentoUrl) {
      try {
        await eliminarDocumento(documentoUrl);
      } catch (deleteError) {
        console.error(
          "[createProyecto] Error al eliminar documento:",
          deleteError,
        );
      }
    }
    throw error;
  }
}

/** Actualiza el proyecto tras validar (con soporte para documento) */
export async function updateProyecto(
  id: string,
  dto: UpdateProyectoDto,
  documento?: ProyectoDocumento,
) {
  let documentoUrl: string | undefined;
  let documentoAnterior: string | undefined;

  try {
    // Obtener el proyecto anterior para saber si hay documento anterior
    const proyectoAnterior = await proyectoApi.getById(id);
    documentoAnterior = proyectoAnterior.documento_url;

    // Si hay nuevo documento, subirlo
    if (documento) {
      documentoUrl = await subirDocumento(documento);
    }

    // Actualizar el proyecto
    const updateDto: UpdateProyectoDto = {
      ...dto,
      ...(documento && { documento_url: documentoUrl }),
    };

    const resultado = await proyectoApi.update(id, updateDto);

    // Si se subió nuevo documento y había uno anterior, eliminar el antiguo
    if (documentoUrl && documentoAnterior) {
      try {
        await eliminarDocumento(documentoAnterior);
      } catch (deleteError) {
        console.error(
          "[updateProyecto] Error al eliminar documento anterior:",
          deleteError,
        );
      }
    }

    return resultado;
  } catch (error) {
    // Si hubo error, eliminar el nuevo documento subido
    if (documentoUrl) {
      try {
        await eliminarDocumento(documentoUrl);
      } catch (deleteError) {
        console.error(
          "[updateProyecto] Error al eliminar documento:",
          deleteError,
        );
      }
    }
    throw error;
  }
}

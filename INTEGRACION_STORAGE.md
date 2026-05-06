# Guía de Integración: Supabase Storage para Documentos PDF

## Descripción General

Se ha integrado Supabase Storage para permitir la carga y almacenamiento de documentos PDF en los proyectos de tesis. Los cambios incluyen:

## Cambios Realizados

### 1. **Modelo de Datos** (`src/entities/proyecto-tesis/model/types.ts`)

- Agregado campo `documento_url?: string` a la interfaz `ProyectoTesis`
- Agregado tipo `ProyectoDocumento` para manejar los archivos antes de subir

### 2. **Servicio de Almacenamiento** (`src/entities/proyecto-tesis/api/documentoStorage.ts`)

Funciones principales:

- `subirDocumento()`: Sube un PDF a Supabase Storage
- `eliminarDocumento()`: Elimina un PDF del almacenamiento
- `validarDocumento()`: Valida que sea un PDF válido

**Especificaciones:**

- Bucket: `proyectos-documentos`
- Tamaño máximo: 10 MB
- Tipos permitidos: `application/pdf`
- Nombres de archivos: `{timestamp}_{nombre_original}`

### 3. **API de Proyectos** (`src/features/registro-proyecto/api/createProyecto.ts`)

Funciones actualizadas:

- `createProyecto(dto, documento?)`: Crea proyecto con soporte para documento
- `updateProyecto(id, dto, documento?)`: Actualiza proyecto con soporte para documento

**Lógica de manejo:**

- Si hay documento, se sube primero a Storage
- Si la carga del documento falla, se elimina el PDF subido
- Al actualizar, si hay nuevo documento, se elimina el anterior automáticamente

### 4. **Formulario de Registro** (`src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`)

Cambios:

- Importado `DocumentPicker` de Expo
- Agregado estado `documentoSeleccionado` para rastrear el PDF
- Función `seleccionarDocumento()` para abrir el selector de archivos
- Función `eliminarDocumento()` para limpiar la selección
- Campo visual con botón dashed para seleccionar PDF
- Indicador visual cuando un documento está seleccionado
- Opción para cambiar el documento

## Configuración Necesaria en Supabase

### Paso 1: Crear el Bucket

1. Ve a Supabase Dashboard > Storage
2. Crea un nuevo bucket llamado `proyectos-documentos`
3. Configura las políticas de acceso:

```sql
-- Política de lectura pública
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'proyectos-documentos');

-- Política de escritura autenticada
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated');

-- Política de eliminación autenticada
CREATE POLICY "Authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated');
```

### Paso 2: Actualizar tabla proyectos_tesis

Asegúrate de que la tabla tenga el campo `documento_url`:

```sql
ALTER TABLE proyectos_tesis
ADD COLUMN documento_url TEXT;
```

## Instalación de Dependencias

La dependencia `expo-document-picker` ya debería estar disponible en proyectos Expo modernos. Si no, instálala:

```bash
expo install expo-document-picker
```

## Uso en el Formulario

1. **Seleccionar Documento:**
   - Usuario toca el botón "📄 Seleccionar PDF"
   - Se abre el selector de archivos
   - El usuario elige un PDF

2. **Visualización:**
   - El nombre del archivo aparece con un ✓ verde
   - Botón "Cambiar" para reemplazar el documento

3. **Guardar:**
   - Al enviar el formulario, el documento se sube primero a Storage
   - Se guarda la URL pública en la base de datos
   - Si hay error, se revierte el cambio

## Manejo de Errores

- **Archivo no es PDF:** Se muestra error y se rechaza
- **Archivo muy grande (>10 MB):** Se rechaza
- **Error en la carga:** Se elimina el archivo subido y se notifica al usuario
- **Error en la actualización:** Se elimina el nuevo documento y se mantiene el anterior

## Consideraciones de Seguridad

- Los PDFs son públicos (lectura), pero solo usuarios autenticados pueden subirlos
- Los nombres de archivos incluyen timestamp para evitar colisiones
- Se valida el tipo MIME en la carga
- Los documentos antiguos se eliminan automáticamente al actualizar

## Testing

Puedes probar la funcionalidad:

1. Abre el formulario de registro de proyecto
2. Completa los campos requeridos
3. Toca el botón "📄 Seleccionar PDF"
4. Elige un archivo PDF de tu dispositivo
5. Toca "Registrar Proyecto"
6. El PDF debería aparecer en el bucket `proyectos-documentos` de Supabase Storage

## URLs Resultantes

Después de subir un documento, la URL pública tendrá este formato:

```
https://[tu-proyecto].supabase.co/storage/v1/object/public/proyectos-documentos/1234567890_nombre_archivo.pdf
```

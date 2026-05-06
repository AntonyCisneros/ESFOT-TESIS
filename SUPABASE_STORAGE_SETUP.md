# Configuración Supabase Storage - Paso a Paso

## 1. Crear el Bucket en Supabase

### A través del Dashboard:

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Storage** en el menú izquierdo
3. Haz clic en **Create a new bucket**
4. Nombre del bucket: `proyectos-documentos`
5. Desactiva "Make it private" (deja público para lectura)
6. Haz clic en **Create bucket**

## 2. Configurar Políticas de Seguridad

### A través de SQL Editor:

1. Ve a **SQL Editor** en Supabase
2. Crea una nueva consulta
3. Ejecuta el siguiente SQL:

```sql
-- Política de lectura pública (cualquiera puede descargar los PDFs)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'proyectos-documentos');

-- Política de inserción para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proyectos-documentos'
  AND auth.role() = 'authenticated'
);

-- Política de eliminación para usuarios autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'proyectos-documentos'
  AND auth.role() = 'authenticated'
);

-- Política de actualización para usuarios autenticados
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'proyectos-documentos'
  AND auth.role() = 'authenticated'
)
USING (
  bucket_id = 'proyectos-documentos'
  AND auth.role() = 'authenticated'
);
```

## 3. Actualizar la tabla de Proyectos

En el SQL Editor, ejecuta:

```sql
-- Agregar columna para almacenar la URL del documento
ALTER TABLE proyectos_tesis
ADD COLUMN documento_url TEXT;

-- Agregar comentario descriptivo (opcional)
COMMENT ON COLUMN proyectos_tesis.documento_url IS 'URL pública del documento PDF almacenado en Storage';
```

## 4. Verificar la Configuración

### En el Dashboard de Supabase:

1. Ve a **Storage** > **proyectos-documentos**
2. Haz clic en **Policies** (arriba a la derecha)
3. Deberías ver las 4 políticas creadas:
   - Public read access
   - Authenticated users can upload
   - Authenticated users can delete
   - Authenticated users can update

### En Table Editor:

1. Ve a **Table Editor**
2. Selecciona tabla `proyectos_tesis`
3. Verifica que existe la columna `documento_url`

## 5. Probar la Configuración

### Desde la App:

1. Inicia sesión en la aplicación
2. Ve a "Nuevo Proyecto de Tesis"
3. Completa los campos requeridos
4. Toca "📄 Seleccionar PDF"
5. Elige un archivo PDF
6. Guarda el proyecto
7. Deberías ver en Supabase Storage > proyectos-documentos que el archivo se subió

### En Supabase Storage:

1. Ve a **Storage** > **proyectos-documentos**
2. Deberías ver archivos con nombres como:
   - `1234567890_miDocumento.pdf` (timestamp + nombre original)

### En Table Editor:

1. Abre tabla `proyectos_tesis`
2. En la columna `documento_url` deberías ver URLs como:
   - `https://[proyecto].supabase.co/storage/v1/object/public/proyectos-documentos/1234567890_miDocumento.pdf`

## 6. Troubleshooting

### Error: "Bucket not found"

- Verifica que el bucket se llama exactamente `proyectos-documentos`
- Revisa que esté visible en Storage > Buckets

### Error: "Permission denied"

- Verifica que las políticas estén creadas correctamente
- Asegúrate de que estás autenticado en la app
- Recarga la página/app después de crear las políticas

### Error: "Column not found"

- Ejecuta el ALTER TABLE para agregar la columna `documento_url`
- Reinicia la app después de actualizar la tabla

### Los archivos no aparecen en Storage

- Verifica la consola del navegador/app para mensajes de error
- Comprueba que el archivo es PDF válido
- Verifica que es menor de 10 MB

## 7. Información Adicional

### URLs Públicas:

Los documentos se pueden acceder públicamente en:

```
https://[PROJECT-ID].supabase.co/storage/v1/object/public/proyectos-documentos/[FILENAME]
```

### Convención de Nombres:

Los archivos se guardan como `{timestamp}_{nombre_original}` para evitar conflictos:

- `1714838400123_propuesta_tesis.pdf`
- `1714838500456_documento_final.pdf`

### Capacidad:

- Límite por archivo: 10 MB (configurable en código)
- Límite total: Depende de tu plan Supabase

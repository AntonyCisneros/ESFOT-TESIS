# Resumen de Integración: Supabase Storage para Documentos PDF

## 📋 Estado: ✅ COMPLETADO

La integración de Supabase Storage para carga de documentos PDF en el formulario de registro de proyectos ha sido completada exitosamente.

---

## 📦 Cambios Realizados

### 1. **Archivos Creados**

#### `src/entities/proyecto-tesis/api/documentoStorage.ts` (NUEVO)

- **Función `subirDocumento()`**: Carga PDFs a Supabase Storage
- **Función `eliminarDocumento()`**: Elimina PDFs de Storage
- **Función `validarDocumento()`**: Valida formato y tamaño (máx 10 MB)
- **Función `base64ToUint8Array()`**: Convierte base64 a bytes (compatible React Native)

### 2. **Archivos Actualizados**

#### `src/entities/proyecto-tesis/model/types.ts`

```typescript
// Agregado:
documento_url?: string;  // URL pública del PDF en Storage

// Nuevo tipo:
interface ProyectoDocumento {
  nombre: string;
  uri: string;
  tipo: string;
}
```

#### `src/features/registro-proyecto/api/createProyecto.ts`

- `createProyecto(dto, documento?)` - soporta documento opcional
- `updateProyecto(id, dto, documento?)` - soporta documento opcional
- Manejo automático: elimina PDF anterior si se sube uno nuevo
- Rollback: si falla el registro, elimina el PDF subido

#### `src/features/registro-proyecto/ui/RegistroProyectoForm.tsx`

- Importado `DocumentPicker` de Expo
- Importado `ProyectoDocumento` del modelo
- Agregado estado: `documentoSeleccionado`
- Función: `seleccionarDocumento()` - abre selector de archivos
- Función: `eliminarDocumento()` - limpia selección
- Campo visual: Botón dashed "📄 Seleccionar PDF"
- Indicador: Muestra nombre del archivo seleccionado con ✓
- Estilos nuevos para el campo de documento

#### `package.json`

```json
{
  "expo-document-picker": "~12.0.2",
  "expo-file-system": "~16.0.9"
}
```

---

## 🔧 Configuración Requerida en Supabase

### Crear Bucket

```bash
Nombre: proyectos-documentos
Privado: NO (permitir lectura pública)
```

### Crear Políticas SQL

```sql
-- Lectura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'proyectos-documentos');

-- Inserción autenticada
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated');

-- Eliminación autenticada
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated');

-- Actualización autenticada
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated')
USING (bucket_id = 'proyectos-documentos' AND auth.role() = 'authenticated');
```

### Agregar Columna a Tabla

```sql
ALTER TABLE proyectos_tesis
ADD COLUMN documento_url TEXT;
```

---

## 🚀 Cómo Usar

### En la App:

1. **Crear Proyecto**: Abre formulario "Nuevo Proyecto de Tesis"
2. **Seleccionar PDF**: Toca "📄 Seleccionar PDF"
3. **Elegir Archivo**: Selecciona un PDF de tu dispositivo
4. **Guardar**: Toca "Registrar Proyecto"
   - El PDF se sube a Storage automáticamente
   - Se guarda la URL en la base de datos

### Editar Proyecto:

1. Abre proyecto existente
2. Puedes cambiar o eliminar el documento
3. Los cambios se guardan automáticamente

---

## 🔒 Características de Seguridad

✅ **Validación de tipo**: Solo PDF permitidos
✅ **Límite de tamaño**: Máximo 10 MB
✅ **Nombres únicos**: Usa timestamp para evitar colisiones
✅ **Autenticación**: Solo usuarios autenticados pueden subir/eliminar
✅ **URLs públicas**: Los PDFs son legibles públicamente pero protegidos en la BD
✅ **Rollback automático**: Si falla el registro, se elimina el PDF subido
✅ **Limpieza de antiguos**: Al actualizar, se elimina el documento anterior

---

## 📁 Estructura de URLs

Después de subir un documento:

```
https://[proyecto-id].supabase.co/storage/v1/object/public/proyectos-documentos/1714838400123_documento_tesis.pdf
```

Los archivos se guardan como: `{timestamp}_{nombre_original}`

---

## 🐛 Troubleshooting

| Problema            | Solución                                       |
| ------------------- | ---------------------------------------------- |
| "Bucket not found"  | Verifica que exista en Supabase Storage        |
| "Permission denied" | Recarga la app después de crear políticas      |
| "Column not found"  | Ejecuta ALTER TABLE para agregar documento_url |
| Archivo no aparece  | Verifica consola, revisa que sea PDF válido    |

---

## 📚 Documentación Adicional

- [INTEGRACION_STORAGE.md](./INTEGRACION_STORAGE.md) - Guía técnica detallada
- [SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md) - Pasos de configuración en Supabase

---

## ✨ Ejemplo de Flujo Completo

```
Usuario abre formulario
    ↓
Completa campos de proyecto
    ↓
Toca "📄 Seleccionar PDF"
    ↓
DocumentPicker abre selector de archivos
    ↓
Usuario elige archivo PDF
    ↓
Se valida: ¿es PDF? ¿<10MB? ✓
    ↓
Se muestra nombre: "✓ documento_tesis.pdf"
    ↓
Usuario toca "Registrar Proyecto"
    ↓
Se sube PDF a Supabase Storage
    ↓
Se guarda registro con documento_url en BD
    ↓
✅ Éxito: "Proyecto registrado correctamente"
```

---

## 🎯 Próximos Pasos (Opcionales)

Si deseas extender la funcionalidad:

- [ ] Agregar vista previa del PDF antes de subir
- [ ] Mostrar barra de progreso durante carga
- [ ] Permitir descargar PDF desde la vista de proyecto
- [ ] Agregar compresión de PDFs antes de subir
- [ ] Implementar escaneo de virus en Supabase Edge Functions

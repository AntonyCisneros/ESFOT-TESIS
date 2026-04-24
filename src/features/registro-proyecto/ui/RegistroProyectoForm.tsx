import type { CreateProyectoDto, EstadoProyecto } from '@entities/proyecto-tesis/model/types';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { createProyecto, updateProyecto } from '../api/createProyecto';
 
// Valor inicial del formulario
const FORM_INICIAL: CreateProyectoDto = {
  titulo: '',
  descripcion: '',
  autores: '',
  tutor_docente: '',
  tecnologias_utilizadas: '',
  fecha_inicio: '',
  fecha_fin: '',
  repositorio_github: '',
  estado: 'En Progreso',
};
 
const ESTADOS: EstadoProyecto[] = ['En Progreso', 'Completado', 'Suspendido'];
 
interface Props {
  onSuccess?: () => void;
  initialValues?: Partial<CreateProyectoDto>;
  mode?: 'create' | 'edit';
  proyectoId?: string;
}
 
function buildForm(initialValues?: Partial<CreateProyectoDto>): CreateProyectoDto {
  return {
    ...FORM_INICIAL,
    ...initialValues,
  };
}

function getRules(campo: keyof CreateProyectoDto) {
  switch (campo) {
    case 'titulo':
      return { required: 'El título es obligatorio' };
    case 'autores':
      return { required: 'Ingresa al menos un autor' };
    case 'tutor_docente':
      return { required: 'El tutor docente es obligatorio' };
    case 'tecnologias_utilizadas':
      return { required: 'Especifica las tecnologías' };
    case 'fecha_inicio':
      return {
        required: 'La fecha de inicio es obligatoria',
        pattern: {
          value: /^\d{4}-\d{2}-\d{2}$/,
          message: 'Formato: AAAA-MM-DD',
        },
      };
    case 'repositorio_github':
      return {
        validate: (value?: string) => {
          if (!value?.trim()) return true;
          return /^https?:\/\/.+/.test(value) || 'Debe ser una URL válida';
        },
      };
    default:
      return undefined;
  }
}

export function RegistroProyectoForm({
  onSuccess,
  initialValues,
  mode = 'create',
  proyectoId,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProyectoDto>({
    defaultValues: buildForm(initialValues),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const estadoSeleccionado = watch('estado');

  useEffect(() => {
    reset(buildForm(initialValues));
  }, [initialValues, reset]);
 
  const actualizar = (campo: keyof CreateProyectoDto, valor: string) => {
    setValue(campo, valor, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
 
  const handleGuardar = handleSubmit(async (form) => {
    try {
      setCargando(true);
      if (mode === 'edit') {
        if (!proyectoId) throw new Error('No se encontró el ID del proyecto.');
        await updateProyecto(proyectoId, form);
      } else {
        await createProyecto(form);
      }

      Alert.alert(
        '¡Éxito!',
        mode === 'edit'
          ? 'Proyecto de tesis actualizado correctamente.'
          : 'Proyecto de tesis registrado correctamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (mode === 'create') reset(FORM_INICIAL);
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el proyecto. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  }, () => {
    Alert.alert('Formulario incompleto', 'Revisa los campos marcados en rojo.');
  });
 
  const renderCampo = ({
    label, campo, placeholder, multiline = false, keyboardType = 'default'
  }: {
    label: string;
    campo: keyof CreateProyectoDto;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'url';
  }) => (
    <View style={styles.campoContenedor}>
      <Text style={styles.etiqueta}>{label}</Text>
      <Controller
        control={control}
        name={campo}
        rules={getRules(campo)}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              errors[campo] ? styles.inputError : null,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={(value as string) ?? ''}
            onBlur={onBlur}
            onChangeText={onChange}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType}
            autoCapitalize={campo === 'repositorio_github' ? 'none' : 'sentences'}
          />
        )}
      />
      {errors[campo] ? (
        <Text style={styles.textoError}>{String(errors[campo]?.message ?? '')}</Text>
      ) : null}
    </View>
  );
 
  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        {mode === 'edit' ? 'Editar Proyecto de Tesis' : 'Nuevo Proyecto de Tesis'}
      </Text>
      <Text style={styles.subtitulo}>ESFOT — Tecnología Superior en Desarrollo de Software</Text>
 
      {renderCampo({
        label: 'Título del Proyecto *',
        campo: 'titulo',
        placeholder: 'Ej: Sistema de gestión de inventarios para PYMES',
      })}
      {renderCampo({
        label: 'Descripción',
        campo: 'descripcion',
        placeholder: 'Describe brevemente el objetivo del proyecto...',
        multiline: true,
      })}
      {renderCampo({
        label: 'Autores * (separa con comas)',
        campo: 'autores',
        placeholder: 'Ej: Ana Torres, Luis Pérez',
      })}
      {renderCampo({
        label: 'Tutor Docente *',
        campo: 'tutor_docente',
        placeholder: 'Ej: Ing. Juan Carlos Gonzalez Msc.',
      })}
      {renderCampo({
        label: 'Tecnologías Utilizadas * (separa con comas)',
        campo: 'tecnologias_utilizadas',
        placeholder: 'Ej: React Native, Node.js, PostgreSQL, AWS',
      })}
      {renderCampo({
        label: 'Fecha de Inicio * (AAAA-MM-DD)',
        campo: 'fecha_inicio',
        placeholder: 'Ej: 2025-03-01',
      })}
      {renderCampo({
        label: 'Fecha de Fin (AAAA-MM-DD)',
        campo: 'fecha_fin',
        placeholder: 'Ej: 2025-12-31 (dejar vacío si está en progreso)',
      })}
      {renderCampo({
        label: 'Repositorio GitHub',
        campo: 'repositorio_github',
        placeholder: 'https://github.com/usuario/repositorio',
        keyboardType: 'url',
      })}
 
      {/* Selector de Estado */}
      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Estado del Proyecto</Text>
        <View style={styles.estadoContenedor}>
          {ESTADOS.map(est => (
            <TouchableOpacity
              key={est}
              style={[
                styles.estadoBoton,
                estadoSeleccionado === est && styles.estadoBotonActivo,
              ]}
              onPress={() => actualizar('estado', est)}
            >
              <Text style={[
                styles.estadoTexto,
                estadoSeleccionado === est && styles.estadoTextoActivo,
              ]}>{est}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
 
      <TouchableOpacity
        style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
        onPress={handleGuardar}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>
            {mode === 'edit' ? 'Actualizar Proyecto' : 'Registrar Proyecto'}
          </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}
 
// ── ESTILOS ──────────────────────────────────────────────────
const AZUL = '#1A3A5C';
const AZUL_CLARO = '#2E6DA4';
 
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: AZUL, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 24 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDE2E8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  inputError: { borderColor: '#E74C3C', borderWidth: 1.5 },
  textoError: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  estadoContenedor: { flexDirection: 'row', gap: 10 },
  estadoBoton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE2E8',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  estadoBotonActivo: { backgroundColor: AZUL_CLARO, borderColor: AZUL_CLARO },
  estadoTexto: { fontSize: 13, color: '#555' },
  estadoTextoActivo: { color: '#fff', fontWeight: '700' },
  botonGuardar: {
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
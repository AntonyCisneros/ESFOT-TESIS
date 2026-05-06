import type {
  CreateProyectoDto,
  EstadoProyecto,
  ProyectoDocumento,
} from "@entities/proyecto-tesis/model/types";
import { usePulseAnimation } from "@shared/hooks/useAnimations";
import { AnimatedTextInput } from "@shared/ui/AnimatedTextInput";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { createProyecto, updateProyecto } from "../api/createProyecto";

const FORM_INICIAL: CreateProyectoDto = {
  titulo: "",
  descripcion: "",
  autores: "",
  tutor_docente: "",
  tecnologias_utilizadas: "",
  fecha_inicio: "",
  fecha_fin: "",
  repositorio_github: "",
  estado: "En Progreso",
};

const ESTADOS: EstadoProyecto[] = ["En Progreso", "Completado", "Suspendido"];

const ESTADO_COLORS: Record<
  EstadoProyecto,
  { bg: string; border: string; text: string; dot: string }
> = {
  "En Progreso": {
    bg: "#EBF5FB",
    border: "#BEE3F8",
    text: "#2B6CB0",
    dot: "#3498DB",
  },
  Completado: {
    bg: "#F0FFF4",
    border: "#C6F6D5",
    text: "#276749",
    dot: "#27AE60",
  },
  Suspendido: {
    bg: "#FFF5F5",
    border: "#FED7D7",
    text: "#C53030",
    dot: "#E74C3C",
  },
};

interface Props {
  onSuccess?: () => void;
  initialValues?: Partial<CreateProyectoDto>;
  mode?: "create" | "edit";
  proyectoId?: string;
}

function buildForm(
  initialValues?: Partial<CreateProyectoDto>,
): CreateProyectoDto {
  return {
    ...FORM_INICIAL,
    ...initialValues,
  };
}

function getRules(campo: keyof CreateProyectoDto) {
  switch (campo) {
    case "titulo":
      return { required: "El t\u00edtulo es obligatorio" };
    case "autores":
      return { required: "Ingresa al menos un autor" };
    case "tutor_docente":
      return { required: "El tutor docente es obligatorio" };
    case "tecnologias_utilizadas":
      return { required: "Especifica las tecnolog\u00edas" };
    case "fecha_inicio":
      return {
        required: "La fecha de inicio es obligatoria",
        pattern: {
          value: /^\d{4}-\d{2}-\d{2}$/,
          message: "Formato: AAAA-MM-DD",
        },
      };
    case "repositorio_github":
      return {
        validate: (value?: string) => {
          if (!value?.trim()) return true;
          return /^https?:\/\/.+/.test(value) || "Debe ser una URL v\u00e1lida";
        },
      };
    default:
      return undefined;
  }
}

export function RegistroProyectoForm({
  onSuccess,
  initialValues,
  mode = "create",
  proyectoId,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<
    ProyectoDocumento | undefined
  >(undefined);
  const pulseAnimation = usePulseAnimation(!cargando);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProyectoDto>({
    defaultValues: buildForm(initialValues),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const estadoSeleccionado = watch("estado");

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

  const seleccionarDocumento = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        const archivo = resultado.assets[0];
        setDocumentoSeleccionado({
          nombre: archivo.name,
          uri: archivo.uri,
          tipo: archivo.mimeType || "application/pdf",
        });
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el documento");
      console.error("[seleccionarDocumento]", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eliminarDocumento = () => {
    setDocumentoSeleccionado(undefined);
  };

  const handleGuardar = handleSubmit(
    async (form) => {
      try {
        setCargando(true);
        if (mode === "edit") {
          if (!proyectoId)
            throw new Error("No se encontr\u00f3 el ID del proyecto.");
          await updateProyecto(proyectoId, form, documentoSeleccionado);
        } else {
          await createProyecto(form, documentoSeleccionado);
        }

        Alert.alert(
          "\u00a1\u00c9xito!",
          mode === "edit"
            ? "Proyecto de tesis actualizado correctamente."
            : "Proyecto de tesis registrado correctamente.",
          [
            {
              text: "OK",
              onPress: () => {
                if (mode === "create") {
                  reset(FORM_INICIAL);
                  setDocumentoSeleccionado(undefined);
                }
                onSuccess?.();
              },
            },
          ],
        );
      } catch (error) {
        console.error("[handleGuardar]", error);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudo guardar el proyecto. Verifica tu conexi\u00f3n.",
        );
      } finally {
        setCargando(false);
      }
    },
    () => {
      Alert.alert(
        "Formulario incompleto",
        "Revisa los campos marcados en rojo.",
      );
    },
  );

  const renderCampo = ({
    label,
    campo,
    placeholder,
    multiline = false,
    keyboardType = "default",
    icon,
  }: {
    label: string;
    campo: keyof CreateProyectoDto;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: "default" | "url";
    icon?: string;
  }) => (
    <Controller
      control={control}
      name={campo}
      rules={getRules(campo)}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.campoContenedor}>
          {icon && <Text style={styles.campoIcon}>{icon}</Text>}
          <View style={styles.campoInputWrapper}>
            <AnimatedTextInput
              label={label}
              placeholder={placeholder}
              value={(value as string) ?? ""}
              onChangeText={onChange}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              keyboardType={keyboardType as any}
            />
          </View>
          {errors[campo] ? (
            <Text style={styles.textoError}>
              {String(errors[campo]?.message ?? "")}
            </Text>
          ) : null}
        </View>
      )}
    />
  );

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formHeader}>
        <Text style={styles.iconHeader}>
          {mode === "edit" ? "\u270F\uFE0F" : "\u2728"}
        </Text>
        <Text style={styles.titulo}>
          {mode === "edit" ? "Editar Proyecto" : "Nuevo Proyecto de Tesis"}
        </Text>
        <Text style={styles.subtitulo}>
          ESFOT - Tecnología Superior en Desarrollo de Software
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Información principal</Text>
      {renderCampo({
        label: "T\u00edtulo del proyecto",
        campo: "titulo",
        placeholder: "Ej: Sistema de gesti\u00f3n de inventarios para PYMES",
        icon: "\uD83D\uDCCB",
      })}
      {renderCampo({
        label: "Descripci\u00f3n",
        campo: "descripcion",
        placeholder: "Describe brevemente el objetivo del proyecto...",
        multiline: true,
        icon: "\uD83D\uDCDD",
      })}
      {renderCampo({
        label: "Autores",
        campo: "autores",
        placeholder: "Ej: Ana Torres, Luis P\u00e9rez",
        icon: "\uD83D\uDC65",
      })}
      {renderCampo({
        label: "Tutor docente",
        campo: "tutor_docente",
        placeholder: "Ej: Ing. Juan Carlos Gonzalez Msc.",
        icon: "\uD83C\uDF93",
      })}

      <Text style={styles.sectionTitle}>Detalles técnicos</Text>
      {renderCampo({
        label: "Tecnolog\u00edas utilizadas",
        campo: "tecnologias_utilizadas",
        placeholder: "Ej: React Native, Node.js, PostgreSQL",
        icon: "\u2699\uFE0F",
      })}
      <View style={styles.rowFechas}>
        <View style={styles.colFecha}>
          {renderCampo({
            label: "Fecha inicio",
            campo: "fecha_inicio",
            placeholder: "AAAA-MM-DD",
          })}
        </View>
        <View style={styles.colFecha}>
          {renderCampo({
            label: "Fecha fin",
            campo: "fecha_fin",
            placeholder: "Opcional",
          })}
        </View>
      </View>
      {renderCampo({
        label: "Repositorio GitHub",
        campo: "repositorio_github",
        placeholder: "https://github.com/usuario/repositorio",
        keyboardType: "url",
        icon: "\uD83D\uDCBB",
      })}

      <Text style={styles.sectionTitle}>Documento adjunto</Text>
      <View style={styles.campoContenedor}>
        {documentoSeleccionado ? (
          <View style={styles.documentoSeleccionado}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>📄</Text>
              <View>
                <Text style={styles.documentoNombre}>
                  {documentoSeleccionado.nombre}
                </Text>
                <Text style={styles.docTipo}>PDF seleccionado</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.botonCambiarDoc}
              onPress={seleccionarDocumento}
              activeOpacity={0.7}
            >
              <Text style={styles.botonCambiarDocTexto}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botonSeleccionarDoc}
            onPress={seleccionarDocumento}
            activeOpacity={0.7}
          >
            <Text style={styles.botonSeleccionarDocIcon}>📄</Text>
            <Text style={styles.botonSeleccionarDocTexto}>
              Seleccionar documento PDF
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.textoAyuda}>
          Máximo 10 MB. El documento es opcional.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Estado del proyecto</Text>
      <View style={styles.campoContenedor}>
        <View style={styles.estadoContenedor}>
          {ESTADOS.map((est) => {
            const colors = ESTADO_COLORS[est];
            const isActive = estadoSeleccionado === est;
            return (
              <TouchableOpacity
                key={est}
                style={[
                  styles.estadoBoton,
                  isActive && {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => actualizar("estado", est)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.estadoDot,
                    { backgroundColor: isActive ? colors.dot : "#CBD5E0" },
                  ]}
                />
                <Text
                  style={[
                    styles.estadoTexto,
                    isActive && { color: colors.text, fontWeight: "700" },
                  ]}
                >
                  {est}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Animated.View
        style={[styles.botonGuardarContenedor, !cargando && pulseAnimation]}
      >
        <TouchableOpacity
          style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
          onPress={handleGuardar}
          disabled={cargando}
          activeOpacity={0.85}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>
              {mode === "edit" ? "Actualizar proyecto" : "Registrar proyecto"}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const PRIMARY = "#1A3A5C";
const PRIMARY_LIGHT = "#2E6DA4";

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 20, paddingBottom: 40 },
  formHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconHeader: {
    fontSize: 36,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  campoContenedor: {
    marginBottom: 12,
  },
  campoIcon: {
    fontSize: 16,
    marginBottom: 4,
    marginLeft: 4,
  },
  campoInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  textoError: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  textoAyuda: {
    color: "#A0AEC0",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  rowFechas: {
    flexDirection: "row",
    gap: 12,
  },
  colFecha: {
    flex: 1,
  },
  botonSeleccionarDoc: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
  },
  botonSeleccionarDocIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  botonSeleccionarDocTexto: {
    color: PRIMARY_LIGHT,
    fontSize: 14,
    fontWeight: "600",
  },
  documentoSeleccionado: {
    backgroundColor: "#F0FFF4",
    borderWidth: 1,
    borderColor: "#C6F6D5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  docIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentoNombre: {
    color: "#276749",
    fontSize: 14,
    fontWeight: "600",
  },
  docTipo: {
    color: "#68D391",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  botonCambiarDoc: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C6F6D5",
  },
  botonCambiarDocTexto: {
    color: "#276749",
    fontSize: 12,
    fontWeight: "600",
  },
  estadoContenedor: {
    flexDirection: "row",
    gap: 8,
  },
  estadoBoton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: 12,
    color: "#718096",
  },
  botonGuardarContenedor: { marginTop: 24 },
  botonGuardar: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

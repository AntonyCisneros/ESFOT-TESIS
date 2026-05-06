import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { FlipCard } from "@shared/ui/FlipCard";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ESTADO_COLORS: Record<string, { bg: string; text: string; dot: string }> =
  {
    "En Progreso": { bg: "#EBF5FB", text: "#2B6CB0", dot: "#3498DB" },
    Completado: { bg: "#F0FFF4", text: "#276749", dot: "#27AE60" },
    Suspendido: { bg: "#FFF5F5", text: "#C53030", dot: "#E74C3C" },
  };

export default function ProyectoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id) {
        setError("ID de proyecto no v\u00e1lido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);
        const data = await proyectoApi.getById(id);
        setProyecto(data);
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : "Error desconocido";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Detalle",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#1A3A5C",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />

      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#1A3A5C" />
          <Text style={styles.cargandoTexto}>Cargando proyecto...</Text>
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={styles.errorIcon}>\u26a0\uFE0F</Text>
          <Text style={styles.error}>
            No se pudo cargar el detalle: {error}
          </Text>
        </View>
      ) : !proyecto ? (
        <View style={styles.centro}>
          <Text style={styles.errorIcon}>?</Text>
          <Text style={styles.error}>Proyecto no encontrado.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contenedor}>
          <View style={styles.headerCard}>
            <View style={styles.estadoBadge}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      ESTADO_COLORS[proyecto.estado]?.dot || "#3498DB",
                  },
                ]}
              />
              <Text
                style={[
                  styles.estadoTexto,
                  { color: ESTADO_COLORS[proyecto.estado]?.text || "#2B6CB0" },
                ]}
              >
                {proyecto.estado}
              </Text>
            </View>
            <Text style={styles.titulo}>{proyecto.titulo}</Text>
            {proyecto.descripcion && (
              <Text style={styles.descripcion}>{proyecto.descripcion}</Text>
            )}
          </View>

          <FlipCard
            title="Resumen"
            frontContent={
              <View style={styles.flipCardContent}>
                <Text style={styles.flipIcon}>👥</Text>
                <Text style={styles.flipCardTitle}>Equipo</Text>
                <Text style={styles.flipCardText}>{proyecto.autores}</Text>
                <Text style={styles.flipCardSubtitle}>
                  Tutor: {proyecto.tutor_docente}
                </Text>
              </View>
            }
            backContent={
              <View style={styles.flipCardContent}>
                <Text style={styles.flipIcon}>📅</Text>
                <Text style={styles.flipCardTitle}>Fechas</Text>
                <Text style={styles.flipCardText}>{proyecto.fecha_inicio}</Text>
                <Text style={styles.flipCardSubtitle}>
                  {proyecto.fecha_fin
                    ? `Hasta: ${proyecto.fecha_fin}`
                    : "En progreso"}
                </Text>
              </View>
            }
          />

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tecnologías Usadas</Text>
            <View style={styles.tagsContainer}>
              {proyecto.tecnologias_utilizadas
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tech, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tech}</Text>
                  </View>
                ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Autores</Text>
                <Text style={styles.detailValue}>{proyecto.autores}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🎓</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tutor docente</Text>
                <Text style={styles.detailValue}>{proyecto.tutor_docente}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Fecha de inicio</Text>
                <Text style={styles.detailValue}>{proyecto.fecha_inicio}</Text>
              </View>
            </View>
            {proyecto.fecha_fin && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Fecha de fin</Text>
                    <Text style={styles.detailValue}>{proyecto.fecha_fin}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.accionesContainer}>
            {proyecto.repositorio_github && (
              <TouchableOpacity
                style={[styles.actionCard, styles.repoAction]}
                onPress={() =>
                  Linking.openURL(proyecto.repositorio_github as string)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>💻</Text>
                <Text style={styles.actionTitle}>Repositorio</Text>
                <Text style={styles.actionSubtitle}>Abrir en GitHub</Text>
              </TouchableOpacity>
            )}

            {proyecto.documento_url && (
              <TouchableOpacity
                style={[styles.actionCard, styles.docAction]}
                onPress={() => {
                  WebBrowser.openBrowserAsync(
                    proyecto.documento_url as string,
                  ).catch((err) => {
                    console.error("[Detalle] Error abriendo PDF:", err);
                    Alert.alert("Error", "No se pudo abrir el documento PDF");
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>📄</Text>
                <Text style={styles.actionTitle}>Documento</Text>
                <Text style={styles.actionSubtitle}>Ver PDF</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.editarBoton}
            onPress={() => router.push(`/proyecto/editar/${proyecto.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.editarTexto}>Editar proyecto</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </>
  );
}

const PRIMARY = "#1A3A5C";
const BG = "#F8FAFC";

const styles = StyleSheet.create({
  contenedor: {
    padding: 16,
    backgroundColor: BG,
    gap: 16,
    paddingBottom: 40,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },
  cargandoTexto: {
    marginTop: 12,
    color: "#718096",
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  error: {
    color: "#E53E3E",
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titulo: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 8,
  },
  descripcion: {
    color: "#4A5568",
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#A0AEC0",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    color: "#2D3748",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 10,
  },
  accionesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  repoAction: {
    borderColor: "#BEE3F8",
    borderWidth: 1,
  },
  docAction: {
    borderColor: "#C6F6D5",
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#718096",
  },
  editarBoton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editarTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  flipCardContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  flipIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  flipCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 8,
  },
  flipCardText: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
    textAlign: "center",
  },
  flipCardSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginTop: 6,
  },
});

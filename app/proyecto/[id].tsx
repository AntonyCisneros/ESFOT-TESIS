import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BADGE_COLOR: Record<string, string> = {
  "En Progreso": "#3498DB",
  Completado: "#27AE60",
  Suspendido: "#E74C3C",
};

export default function ProyectoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!id) {
        setError("ID de proyecto no valido.");
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
      <Stack.Screen options={{ title: "Detalle del proyecto" }} />

      {cargando ? (
        <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />
      ) : error ? (
        <Text style={styles.error}>No se pudo cargar el detalle: {error}</Text>
      ) : !proyecto ? (
        <Text style={styles.error}>Proyecto no encontrado.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.contenedor}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>{proyecto.titulo}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: BADGE_COLOR[proyecto.estado] ?? "#607D8B" },
              ]}
            >
              <Text style={styles.badgeTexto}>{proyecto.estado}</Text>
            </View>
          </View>

          <Campo label="Descripcion" value={proyecto.descripcion || "Sin descripcion"} />
          <Campo label="Autores" value={proyecto.autores} />
          <Campo label="Tutor docente" value={proyecto.tutor_docente} />
          <Campo label="Tecnologias" value={proyecto.tecnologias_utilizadas} />
          <Campo label="Fecha de inicio" value={proyecto.fecha_inicio} />
          <Campo label="Fecha de fin" value={proyecto.fecha_fin || "En progreso"} />

          {proyecto.repositorio_github ? (
            <TouchableOpacity
              style={styles.repoBoton}
              onPress={() => Linking.openURL(proyecto.repositorio_github as string)}
            >
              <Text style={styles.repoTexto}>Abrir repositorio en GitHub</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.editarBoton}
            onPress={() => router.push(`/proyecto/editar/${proyecto.id}`)}
          >
            <Text style={styles.editarTexto}>Editar proyecto</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </>
  );
}

function Campo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{label}</Text>
      <Text style={styles.valor}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 16,
    backgroundColor: "#F5F7FA",
    gap: 10,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
  },
  error: {
    color: "#E74C3C",
    textAlign: "center",
    padding: 20,
  },
  encabezado: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  titulo: {
    color: "#1A3A5C",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  campo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
  },
  etiqueta: {
    color: "#778192",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  valor: {
    color: "#1F2A36",
    fontSize: 15,
    lineHeight: 21,
  },
  repoBoton: {
    backgroundColor: "#EBF5FB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 2,
  },
  repoTexto: {
    color: "#2E6DA4",
    fontWeight: "700",
    fontSize: 14,
  },
  editarBoton: {
    backgroundColor: "#1A3A5C",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 10,
  },
  editarTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

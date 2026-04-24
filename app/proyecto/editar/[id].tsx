import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { CreateProyectoDto, ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { RegistroProyectoForm } from "@features/registro-proyecto/ui/RegistroProyectoForm";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function EditarProyectoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProyecto = async () => {
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

    cargarProyecto();
  }, [id]);

  const initialValues: Partial<CreateProyectoDto> | undefined = proyecto
    ? {
        titulo: proyecto.titulo,
        descripcion: proyecto.descripcion,
        autores: proyecto.autores,
        tutor_docente: proyecto.tutor_docente,
        tecnologias_utilizadas: proyecto.tecnologias_utilizadas,
        fecha_inicio: proyecto.fecha_inicio,
        fecha_fin: proyecto.fecha_fin ?? "",
        repositorio_github: proyecto.repositorio_github ?? "",
        estado: proyecto.estado,
      }
    : undefined;

  return (
    <>
      <Stack.Screen options={{ title: "Editar proyecto" }} />

      {cargando ? (
        <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />
      ) : error ? (
        <View style={styles.contenedorError}>
          <Text style={styles.error}>No se pudo cargar el proyecto: {error}</Text>
        </View>
      ) : proyecto ? (
        <RegistroProyectoForm
          mode="edit"
          proyectoId={proyecto.id}
          initialValues={initialValues}
          onSuccess={() => router.replace(`/proyecto/${proyecto.id}`)}
        />
      ) : (
        <Text style={styles.error}>Proyecto no encontrado.</Text>
      )}
    </>
  );
}

const styles = {
  centro: {
    flex: 1,
    justifyContent: "center" as const,
  },
  contenedorError: {
    flex: 1,
    justifyContent: "center" as const,
    backgroundColor: "#F5F7FA",
  },
  error: {
    color: "#E74C3C",
    textAlign: "center" as const,
    padding: 20,
  },
};

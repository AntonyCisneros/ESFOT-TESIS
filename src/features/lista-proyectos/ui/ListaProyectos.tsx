import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
// eslint-disable-next-line no-restricted-imports
import { AnimatedProyectoCard } from "@widgets/proyecto-card/AnimatedProyectoCard";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
} from "react-native";

interface Props {
  searchQuery?: string;
}

export function ListaProyectos({ searchQuery = "" }: Props) {
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeraEntrada = useRef(true);

  const cargarProyectos = useCallback(
    async (silent = false) => {
      if (!silent) setCargando(true);
      setError(null);

      try {
        const query = searchQuery.trim();
        const data = query
          ? await proyectoApi.search(query)
          : await proyectoApi.getAll();
        const filtrados = query
          ? data.filter((p) =>
              p.titulo.toLowerCase().includes(query.toLowerCase()),
            )
          : data;
        setProyectos(filtrados);
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : "Error desconocido";
        setError(mensaje);
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [searchQuery],
  );

  const eliminarProyecto = useCallback(
    async (id: string, titulo: string) => {
      try {
        await proyectoApi.delete(id);
        await cargarProyectos(true);
        Alert.alert(
          "Proyecto eliminado",
          `Se eliminó \"${titulo}\" correctamente.`,
        );
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : "Error desconocido";
        Alert.alert("Error", `No se pudo eliminar el proyecto: ${mensaje}`);
      }
    },
    [cargarProyectos],
  );

  useEffect(() => {
    cargarProyectos();
  }, [cargarProyectos]);

  useFocusEffect(
    useCallback(() => {
      if (primeraEntrada.current) {
        primeraEntrada.current = false;
        return;
      }

      cargarProyectos(true);
    }, [cargarProyectos]),
  );

  if (cargando)
    return (
      <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />
    );

  if (error)
    return <Text style={styles.error}>Error al cargar proyectos: {error}</Text>;

  if (proyectos.length === 0)
    return (
      <Text style={styles.vacio}>
        {searchQuery.trim()
          ? "No se encontraron proyectos con ese título."
          : "No hay proyectos registrados aún."}
      </Text>
    );

  return (
    <FlatList
      data={proyectos}
      keyExtractor={(p) => p.id}
      renderItem={({ item, index }) => (
        <AnimatedProyectoCard
          proyecto={item}
          onPress={() => router.push(`/proyecto/${item.id}`)}
          onDelete={() => eliminarProyecto(item.id, item.titulo)}
          delay={index * 100}
        />
      )}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16 },
  centro: { flex: 1, justifyContent: "center" },
  error: { color: "#E74C3C", textAlign: "center", padding: 20 },
  vacio: { color: "#888", textAlign: "center", padding: 40 },
});

import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import {
  useCardEnterAnimation,
} from "@shared/hooks/useAnimations";
import React, { useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const BADGE_CONFIG: Record<string, { bg: string; text: string }> = {
  "En Progreso": { bg: "#EBF5FB", text: "#2B6CB0" },
  Completado: { bg: "#F0FFF4", text: "#276749" },
  Suspendido: { bg: "#FFF5F5", text: "#C53030" },
};

const STATUS_DOT: Record<string, string> = {
  "En Progreso": "#3498DB",
  Completado: "#27AE60",
  Suspendido: "#E74C3C",
};

interface Props {
  proyecto: ProyectoTesis;
  onPress?: () => void;
  onDelete?: () => void | Promise<void>;
  delay?: number;
}

export function AnimatedProyectoCard({
  proyecto,
  onPress,
  onDelete,
  delay = 0,
}: Props) {
  const [expandido, setExpandido] = useState(false);
  const enterAnimation = useCardEnterAnimation(delay);
  const layoutRef = useRef({ width: 300, height: 100 });

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const alturaExpandida = useSharedValue(0);

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const expandirStyle = useAnimatedStyle(() => ({
    height: alturaExpandida.value,
    opacity: alturaExpandida.value > 10 ? 1 : 0,
  }));

  const handlePressIn = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = layoutRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const rotateYValue = ((locationX - centerX) / centerX) * 5;
    const rotateXValue = -((locationY - centerY) / centerY) * 5;

    rotateX.value = withSpring(rotateXValue, { damping: 15, stiffness: 150 });
    rotateY.value = withSpring(rotateYValue, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    rotateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const toggleExpandir = () => {
    const nuevoEstado = !expandido;
    setExpandido(nuevoEstado);
    alturaExpandida.value = withTiming(nuevoEstado ? 200 : 0, { duration: 350 });
  };

  const abrirRepo = () => {
    if (proyecto.repositorio_github) {
      Linking.openURL(proyecto.repositorio_github);
    }
  };

  const confirmarEliminacion = () => {
    if (!onDelete) return;

    Alert.alert(
      "Eliminar proyecto",
      `\u00bfSeguro que deseas eliminar "${proyecto.titulo}"? Esta acci\u00f3n no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(),
        },
      ],
    );
  };

  const badge = BADGE_CONFIG[proyecto.estado] || BADGE_CONFIG["En Progreso"];
  const dotColor = STATUS_DOT[proyecto.estado] || "#3498DB";
  const tecnologias = proyecto.tecnologias_utilizadas
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Animated.View style={[styles.tarjeta]} entering={enterAnimation}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.contenido}
        onLayout={(e) => {
          layoutRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
      >
        <Animated.View style={[styles.cardInner, tiltStyle]}>
          <View style={styles.encabezado}>
            <View style={styles.estadoBadge}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={[styles.estadoTexto, { color: badge.text }]}>
                {proyecto.estado}
              </Text>
            </View>
          </View>

          <Text style={styles.titulo} numberOfLines={2}>
            {proyecto.titulo}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Autores</Text>
            <Text style={styles.infoValue}>{proyecto.autores}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tutor</Text>
            <Text style={styles.infoValue}>{proyecto.tutor_docente}</Text>
          </View>

          <Animated.View style={[styles.seccionExpandible, expandirStyle]}>
            <View style={styles.divider} />

            <Text style={styles.infoLabel}>Tecnolog\u00edas</Text>
            <View style={styles.tagsContainer}>
              {tecnologias.map((tech, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tech}</Text>
                </View>
              ))}
            </View>

            <View style={styles.filaFechas}>
              <View style={styles.fechaItem}>
                <Text style={styles.fechaLabel}>Inicio</Text>
                <Text style={styles.fechaValor}>{proyecto.fecha_inicio}</Text>
              </View>
              {proyecto.fecha_fin && (
                <View style={styles.fechaItem}>
                  <Text style={styles.fechaLabel}>Fin</Text>
                  <Text style={styles.fechaValor}>{proyecto.fecha_fin}</Text>
                </View>
              )}
            </View>

            <View style={styles.accionesRow}>
              {proyecto.repositorio_github && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={abrirRepo}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnText}>GitHub \u2192</Text>
                </TouchableOpacity>
              )}
              {proyecto.documento_url && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.docBtn]}
                  onPress={() => {}}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionBtnText, styles.docBtnText]}>
                    PDF
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>

      <TouchableOpacity
        style={styles.toggleBoton}
        onPress={toggleExpandir}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleTexto}>
          {expandido ? "Mostrar menos" : "Ver detalles"}
        </Text>
        <Text style={styles.toggleArrow}>{expandido ? "\u2191" : "\u2193"}</Text>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={styles.eliminarBoton}
          onPress={confirmarEliminacion}
          activeOpacity={0.7}
        >
          <Text style={styles.eliminarTexto}>Eliminar</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const PRIMARY = "#1A3A5C";
const TEXT_PRIMARY = "#2D3748";
const TEXT_SECONDARY = "#718096";
const BG_TAG = "#EDF2F7";

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  contenido: { gap: 0 },
  cardInner: { overflow: "hidden" },
  encabezado: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "800",
    color: PRIMARY,
    lineHeight: 22,
    marginBottom: 14,
  },
  infoRow: { marginBottom: 10 },
  infoLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "500",
    lineHeight: 20,
  },
  seccionExpandible: {
    overflow: "hidden",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: BG_TAG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "600",
  },
  filaFechas: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  fechaItem: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 10,
  },
  fechaLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fechaValor: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  accionesRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    backgroundColor: "#EBF5FB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#2B6CB0",
    fontSize: 13,
    fontWeight: "700",
  },
  docBtn: { backgroundColor: "#F0FFF4" },
  docBtnText: { color: "#276749" },
  toggleBoton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 8,
  },
  toggleTexto: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
  },
  toggleArrow: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: "700",
  },
  eliminarBoton: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  eliminarTexto: {
    color: "#E53E3E",
    fontSize: 13,
    fontWeight: "600",
  },
});

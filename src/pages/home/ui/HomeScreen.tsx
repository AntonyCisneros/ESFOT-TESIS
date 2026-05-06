import { ListaProyectos } from "@features/lista-proyectos/ui/ListaProyectos";
import { useAuth } from "@shared/hooks/useAuth";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function HomeScreen() {
  const [busqueda, setBusqueda] = useState("");
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesi\u00f3n",
      "\u00bfEst\u00e1s seguro de que deseas cerrar sesi\u00f3n?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesi\u00f3n",
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert("Error", "No se pudo cerrar la sesi\u00f3n");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos d\u00edas";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerNombre = () => {
    if (!user?.email) return "";
    return user.email.split("@")[0];
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greeting}>
            <Text style={styles.saludo}>{obtenerSaludo()},</Text>
            <Text style={styles.nombre}>{obtenerNombre()}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandRow}>
          <Image
            source={require("../../../../assets/images/logo_esfot_buho.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Proyectos de Tesis</Text>
            <Text style={styles.brandSubtitle}>ESFOT</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>&#128269;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título..."
            placeholderTextColor="#A0AEC0"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="sentences"
            returnKeyType="search"
          />
        </View>
      </View>

      <ListaProyectos searchQuery={busqueda} />
    </SafeAreaView>
  );
}

const PRIMARY = "#1A3A5C";
const BG = "#F5F7FA";

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF1",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: {
    flex: 1,
  },
  saludo: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#718096",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#2E6DA4",
    fontWeight: "600",
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: "#A0AEC0",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2D3748",
  },
});

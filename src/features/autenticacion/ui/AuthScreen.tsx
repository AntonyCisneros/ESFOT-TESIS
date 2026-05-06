import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";

type AuthScreenProps = {
  initialTab?: "login" | "signup";
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const indicatorPos = useSharedValue(initialTab === "login" ? 0 : 1);
  const [tabWidth, setTabWidth] = useState(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPos.value * tabWidth }],
  }));

  const switchTab = (tab: "login" | "signup") => {
    setActiveTab(tab);
    indicatorPos.value = withTiming(tab === "login" ? 0 : 1, { duration: 300 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Image
              source={require("../../../../assets/images/logo_esfot_buho.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>ESFOT-TESIS</Text>
            <Text style={styles.headerSubtitle}>
              Gestiona tu proyecto de investigación
            </Text>
          </View>

          <View
            style={styles.tabContainer}
            onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 2)}
          >
            <View style={styles.tabBackground}>
              <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
            </View>
            <View style={styles.tabButtons}>
              <TouchableOpacity
                onPress={() => switchTab("login")}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "login" && styles.tabTextActive,
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchTab("signup")}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "signup" && styles.tabTextActive,
                  ]}
                >
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formContainer}>
            {activeTab === "login" ? (
              <LoginForm onSignUpPress={() => switchTab("signup")} />
            ) : (
              <SignUpForm onLoginPress={() => switchTab("login")} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const PRIMARY = "#1A3A5C";
const BG = "#F8FAFC";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: PRIMARY,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  tabContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8ECF1",
    borderRadius: 14,
  },
  tabIndicator: {
    width: "50%",
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 14,
  },
  tabButtons: {
    flex: 1,
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7A90",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  formContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
});

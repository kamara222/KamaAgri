import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useLogin } from "../services";
import { getRoleServices } from "../api";

// Services par défaut pour ADMIN (solution temporaire)
const defaultAdminServices = [
  "poulets",
  "poissons",
  "stocks",
  "ventes",
  "parametres",
  "sauvegarde",
  "tableau_de_bord",
  "planificateur",
  "galerie",
  "rapports",
];

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const { mutate: login } = useLogin();

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Toast.show({
        type: "errorToast",
        props: { message: "Veuillez remplir tous les champs" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(
        { identifiant, password },
        {
          onSuccess: async (data) => {
            console.log("Réponse de l'API:", data);
            if (data.accessToken) {
              await AsyncStorage.setItem("authToken", data.accessToken);
              console.log("Token stocké:", data.accessToken);
            }
            if (data.user) {
              // Récupérer les services si non inclus dans la réponse
              let services: string[] = data.user.services || [];
              if (!services.length) {
                try {
                  const roleServicesData = await getRoleServices(data.user.role.code);
                  services = roleServicesData.roleServices;
                  console.log("Services récupérés:", services);
                } catch (error) {
                  console.error("Erreur lors de la récupération des services:", error);
                  // Solution temporaire pour ADMIN
                  if (data.user.role.code === "ADMIN") {
                    services = defaultAdminServices;
                  }
                }
              }
              const userInfo = {
                prenom: data.user.prenom,
                nom: data.user.nom,
                email: data.user.email,
                numeroTelephone: data.user.numeroTelephone,
                role: data.user.role,
                services,
              };
              await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
              console.log("Informations utilisateur stockées:", userInfo);
            }

            Toast.show({
              type: "successToast",
              props: { message: data.message || "Connexion réussie !" },
            });
            setIsSubmitting(false);
            navigation.replace("Home");
          },
          onError: (error: any) => {
            setIsSubmitting(false);
            console.error("Erreur de connexion:", error.response?.data);
            Toast.show({
              type: "errorToast",
              props: {
                message: error.response?.data?.message || "Échec de la connexion",
              },
            });
          },
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error("Erreur lors de la gestion de la connexion:", error);
      Toast.show({
        type: "errorToast",
        props: { message: "Une erreur inattendue est survenue" },
      });
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={["#00c45cff", "#709887ff", "#00c45cff"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#00c45cff" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header avec logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="water" size={48} color="#fff" />
                <Ionicons
                  name="leaf"
                  size={36}
                  color="#fff"
                  style={styles.leafIcon}
                />
              </View>
              <Text style={styles.welcomeText}>Bienvenue</Text>
              <Text style={styles.appName}>AquaFerme Pro</Text>
            </View>

            {/* Formulaire de connexion */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color="#555"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Identifiant"
                  placeholderTextColor="#888"
                  value={identifiant}
                  onChangeText={setIdentifiant}
                  autoCapitalize="none"
                  autoComplete="off"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#555"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={() => {
                  animateButton();
                  handleLogin();
                }}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#65cf96ff", "#00c45cff"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginButtonText}>
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Décoration de fond */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
  },
  leafIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "400",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circle1: {
    width: 220,
    height: 220,
    top: -120,
    right: -110,
  },
  circle2: {
    width: 180,
    height: 180,
    bottom: -90,
    left: -90,
  },
  circle3: {
    width: 120,
    height: 120,
    top: height * 0.25,
    left: -60,
  },
});

export default LoginScreen;
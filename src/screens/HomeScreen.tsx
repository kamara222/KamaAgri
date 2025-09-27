import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, SIZES, FONTS } from "../styles/GlobalStyles";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useLogout, useLots, useBassins } from "../services";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";

// Interface pour les informations utilisateur
interface UserInfo {
  prenom: string;
  nom: string;
}

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string | null;
  race: string | { code: string; nom: string } | null;
  date: string;
  nombre: number;
  poids_moyen: number;
}

// Interface pour un bassin
interface Basin {
  id: string;
  nom_bassin: string;
  espece: string | { code: string; nom: string } | null;
  date?: string;
  nombre?: number;
}

// Données mock pour les cartes (sauf Total Poulets et Total Poissons, qui seront dynamiques)
const summaryDataTemplate = [
  { title: "Total Poulets", value: "0", unit: "têtes", icon: "egg" },
  { title: "Total Poissons", value: "0", unit: "têtes", icon: "waves" },
  { title: "Stocks Critiques", value: "3", unit: "articles", icon: "warning" },
  {
    title: "Ventes Mois",
    value: "150,000",
    unit: "XAF",
    icon: "shopping-cart",
  },
];

// Données mock pour le graphique des ventes (7 jours)
const salesChartData = {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  datasets: [
    {
      data: [50000, 75000, 60000, 90000, 120000, 80000, 95000],
      color: () => COLORS.accent,
      strokeWidth: 2,
    },
  ],
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { mutate: logout } = useLogout();
  const [userInitials, setUserInitials] = useState<string>("");
  const {
    data: lots,
    isLoading: isLotsLoading,
    isError: isLotsError,
  } = useLots();
  const {
    data: basins,
    isLoading: isBasinsLoading,
    isError: isBasinsError,
  } = useBassins();

  // Calculer le total des poulets
  const totalChickens = lots
    ? lots.reduce((sum, lot) => sum + (lot.nombre || 0), 0)
    : 0;

  // Calculer le total des poissons
  const totalFish = basins
    ? basins.reduce((sum, basin) => sum + (basin.nombre || 0), 0)
    : 0;

  // Formatter les nombres avec des séparateurs de milliers
  const formattedTotalChickens = totalChickens.toLocaleString("fr-FR");
  const formattedTotalFish = totalFish.toLocaleString("fr-FR");

  // Mettre à jour les données de la carte avec les totaux dynamiques
  const summaryData = summaryDataTemplate.map((item) => {
    if (item.title === "Total Poulets") {
      return {
        ...item,
        value: isLotsLoading
          ? "Chargement..."
          : isLotsError
          ? "Erreur"
          : formattedTotalChickens,
      };
    }
    if (item.title === "Total Poissons") {
      return {
        ...item,
        value: isBasinsLoading
          ? "Chargement..."
          : isBasinsError
          ? "Erreur"
          : formattedTotalFish,
      };
    }
    return item;
  });

  // Récupérer les informations utilisateur depuis AsyncStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem("userInfo");
        console.log("Données AsyncStorage userInfo:", userData);
        if (userData) {
          const user: UserInfo = JSON.parse(userData);
          console.log("Utilisateur parsé:", user);
          const initials = `${user.prenom.charAt(0)}${user.nom.charAt(
            0
          )}`.toUpperCase();
          setUserInitials(initials);
          console.log("Initiales calculées:", initials);
        } else {
          console.warn("Aucune donnée userInfo trouvée dans AsyncStorage");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des infos utilisateur:",
          error
        );
      }
    };
    fetchUserInfo();
  }, []);

  // Gérer la déconnexion avec modale de confirmation
  const handleLogout = () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vous déconnecter ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui",
          style: "destructive",
          onPress: () => {
            logout(
              {},
              {
                onSuccess: () => {
                  Toast.show({
                    type: "successToast",
                    props: {
                      title: "Succès",
                      message: " Déconnexion réussie",
                    },
                  });
                  navigation.replace("LoginScreen");
                },

                onError: (error: any) => {
                  Toast.show({
                    type: "errorToast",
                    props: {
                      title: "Erreur",
                      message: "Échec de la déconnexion",
                    },
                  });
                  console.error("Erreur de déconnexion:", error);
                },
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Vérification des données
  const isDataValid =
    summaryData.length > 0 && salesChartData.labels.length > 0;

  // Configuration de l'en-tête
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerInitialsContainer}
          onPress={() => navigation.navigate("ProfileScreen")}
          accessibilityLabel="Voir le profil"
          accessibilityHint="Navigue vers la page de profil"
        >
          <Text style={styles.headerInitials}>{userInitials || "??"}</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={handleLogout}
          accessibilityLabel="Se déconnecter"
          accessibilityHint="Ouvre une modale pour confirmer la déconnexion"
        >
          <Icon name="logout" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userInitials]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Section des cartes de résumé */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Résumé Général</Text>
          {isDataValid ? (
            <View style={styles.cardsContainer}>
              {summaryData.map((item, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInUp"
                  delay={index * 100}
                  style={styles.card}
                >
                  <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => {
                      if (item.title === "Stocks Critiques") {
                        navigation.navigate("StockManagement");
                      } else if (item.title === "Total Poulets") {
                        navigation.navigate("ChickenManagement");
                      } else if (item.title === "Total Poissons") {
                        navigation.navigate("FishManagement");
                      } else if (item.title === "Ventes Mois") {
                        navigation.navigate("SalesTrackingGeneral");
                      }
                    }}
                    accessibilityLabel={`Voir détails ${item.title}`}
                    accessibilityHint={`Navigue vers la gestion des ${item.title.toLowerCase()}`}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      color={COLORS.accent}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardValue}>{item.value}</Text>
                    <Text style={styles.cardUnit}>{item.unit}</Text>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          ) : (
            <Text style={styles.errorText}>
              Erreur : Données non disponibles
            </Text>
          )}
        </View>

        {/* Section des graphiques */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Ventes (7 jours, XAF)</Text>
          {isDataValid ? (
            <Animatable.View animation="bounceIn" duration={1000}>
              <LineChart
                data={salesChartData}
                width={Dimensions.get("window").width - SIZES.padding * 2}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  decimalPlaces: 0,
                  color: () => COLORS.textLight,
                  labelColor: () => COLORS.text,
                  style: {
                    borderRadius: SIZES.radius,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: COLORS.accent,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Animatable.View>
          ) : (
            <Text style={styles.errorText}>
              Erreur : Données du graphique non disponibles
            </Text>
          )}
        </View>

        {/* Section de navigation rapide */}
        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>Accès Rapide</Text>
          <View style={styles.navButtonsContainer}>
            {[
              {
                name: "Poulets",
                icon: "egg",
                screen: "ChickenManagement",
                hint: "Navigue vers la gestion des poulets",
                code: "poulets",
              },
              {
                name: "Poissons",
                icon: "waves",
                screen: "FishManagement",
                hint: "Navigue vers la gestion des poissons",
                code: "poissons",
              },
              {
                name: "Stocks",
                icon: "inventory",
                screen: "StockManagement",
                hint: "Navigue vers la gestion des stocks",
                code: "stocks",
              },
              {
                name: "Rapports",
                icon: "assessment",
                screen: "Reports",
                hint: "Navigue vers les rapports",
                code: "rapports",
              },
              {
                name: "Ventes",
                icon: "shopping-cart",
                screen: "SalesTrackingGeneral",
                hint: "Navigue vers le suivi des ventes",
                code: "ventes",
              },
              {
                name: "Paramètres",
                icon: "settings",
                screen: "Settings",
                hint: "Navigue vers les paramètres",
                code: "parametres",
              },
              {
                name: "Sauvegarde",
                icon: "archive",
                screen: "Backup",
                hint: "Navigue vers la gestion des sauvegardes",
                code: "sauvegarde",
              },
              {
                name: "Tableau Avancé",
                icon: "dashboard",
                screen: "AdvancedDashboard",
                hint: "Navigue vers le tableau de bord avancé",
                code: "tableau_de_bord",
              },
              {
                name: "Planificateur",
                icon: "event",
                screen: "Planner",
                hint: "Navigue vers le planificateur d’événements",
                code: "planificateur",
              },
              {
                name: "Galerie",
                icon: "photo-camera",
                screen: "PhotoGallery",
                hint: "Navigue vers la galerie photo",
                code: "galerie",
              },
            ].map((button, index) => (
              <Animatable.View
                key={button.name}
                animation="bounceIn"
                duration={1000}
                delay={index * 200}
              >
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigation.navigate(button.screen)}
                  accessibilityLabel={`Aller à ${button.name}`}
                  accessibilityHint={button.hint}
                  activeOpacity={0.8}
                >
                  <Icon name={button.icon} size={32} color={COLORS.white} />
                  <Text style={styles.navButtonText}>{button.name}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryContainer: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (Dimensions.get("window").width - SIZES.padding * 3) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  cardContent: {
    padding: SIZES.padding,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  cardValue: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginVertical: 4,
  },
  cardUnit: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  chartContainer: {
    padding: SIZES.padding,
  },
  chart: {
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  navigationContainer: {
    padding: SIZES.padding,
  },
  navButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  navButton: {
    width: (Dimensions.get("window").width - SIZES.padding * 3) / 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    alignItems: "center",
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  navButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: SIZES.margin / 2,
    textAlign: "center",
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: "center",
    marginTop: SIZES.margin,
  },
  headerInitialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SIZES.padding,
  },
  headerInitials: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerIconContainer: {
    marginRight: SIZES.padding,
  },
});

export default memo(HomeScreen);

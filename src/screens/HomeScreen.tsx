import React, { memo, useEffect, useState, useMemo } from "react";
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
import { useLogout, useRoleServices, useStats, useChickenSales, useFishSales } from "../services";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";
import CustomSelect from "../components/CustomSelect";

// Interface pour les informations utilisateur
interface UserInfo {
  prenom: string;
  nom: string;
  role: {
    code: string;
    nom: string;
  };
}

// Interface pour les statistiques
interface Stats {
  totalPouletRestant: number;
  totalPoissonRestant: number;
  nbrePouletVendu: number;
  nbrePouletMort: number;
  nbrePoissonVendu: number;
  nbrePoissonMort: number;
  prixVentePouletMois: number;
  prixVentePoissonMois: number;
  totalVentesMois: number;
  periode: {
    debut: string;
    finExclusive: string;
  };
}

// Interface pour une vente
interface Sale {
  id: string;
  type_de_vente: string;
  prix_total: number;
  date: string;
  batiment?: string;
  bassin?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { mutate: logout } = useLogout();
  const [userInitials, setUserInitials] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useStats();
  const {
    data: chickenSales,
    isLoading: isChickenSalesLoading,
    isError: isChickenSalesError,
  } = useChickenSales();
  const {
    data: fishSales,
    isLoading: isFishSalesLoading,
    isError: isFishSalesError,
  } = useFishSales();
  const {
    data: userServices,
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useRoleServices(userRole, !!userRole);

  // Options pour le filtre de type
  const typeOptions = [
    { label: "Tous", value: "" },
    { label: "Poulets", value: "Poulets" },
    { label: "Poissons", value: "Poissons" },
  ];

  // Formatter les nombres avec des séparateurs de milliers
  const formattedTotalChickens = stats?.totalPouletRestant.toLocaleString("fr-FR") ?? "0";
  const formattedTotalFish = stats?.totalPoissonRestant.toLocaleString("fr-FR") ?? "0";
  const formattedTotalSales = stats?.totalVentesMois.toLocaleString("fr-FR") ?? "0";

  // Données des cartes
  const summaryDataTemplate = [
    { title: "Total Poulets", value: "0", unit: "têtes", icon: "egg", code: "poulets" },
    { title: "Total Poissons", value: "0", unit: "têtes", icon: "waves", code: "poissons" },
    { title: "Stocks Critiques", value: "0", unit: "articles", icon: "warning", code: "stocks" },
    { title: "Ventes Mois", value: "0", unit: "XOF", icon: "shopping-cart", code: "ventes" },
  ];

  // Utiliser roleServices s'il existe, sinon utiliser tous les services disponibles comme secours
  const effectiveServices = useMemo(() => {
    if (userServices?.roleServices?.length > 0) {
      console.log("Services attribués:", userServices.roleServices);
      return userServices.roleServices;
    }
    if (userServices?.services?.length > 0) {
      const allServices = userServices.services.map((service) => service.code);
      console.log("Services disponibles (secours):", allServices);
      return allServices;
    }
    console.log("Aucun service disponible");
    return [];
  }, [userServices]);

  // Afficher un message si aucun service n'est attribué
  useEffect(() => {
    if (userServices && userServices.roleServices.length === 0 && !isServicesLoading) {
      Toast.show({
        type: "infoToast",
        props: {
          message: "Aucun service attribué. Contactez l'administrateur pour configurer vos accès.",
        },
      });
    }
  }, [userServices, isServicesLoading]);

  // Mettre à jour les données de la carte avec les totaux dynamiques
  const summaryData = useMemo(
    () =>
      summaryDataTemplate
        .filter((item) => effectiveServices.includes(item.code))
        .map((item) => {
          if (item.title === "Total Poulets") {
            return {
              ...item,
              value: isStatsLoading
                ? "Chargement..."
                : isStatsError
                ? "Erreur"
                : formattedTotalChickens,
            };
          }
          if (item.title === "Total Poissons") {
            return {
              ...item,
              value: isStatsLoading
                ? "Chargement..."
                : isStatsError
                ? "Erreur"
                : formattedTotalFish,
            };
          }
          if (item.title === "Ventes Mois") {
            return {
              ...item,
              value: isStatsLoading
                ? "Chargement..."
                : isStatsError
                ? "Erreur"
                : formattedTotalSales,
            };
          }
          return item;
        }),
    [effectiveServices, isStatsLoading, isStatsError, formattedTotalChickens, formattedTotalFish, formattedTotalSales]
  );

  // Calculer les 7 derniers jours pour les labels du graphique
  const getLast7Days = () => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }));
    }
    return days;
  };

  // Données du graphique des ventes (7 jours)
  const salesChartData = useMemo(() => {
    if (isChickenSalesLoading || isFishSalesLoading || !chickenSales || !fishSales) {
      return {
        labels: getLast7Days(),
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], color: () => COLORS.accent, strokeWidth: 2 }],
      };
    }

    const labels = getLast7Days();
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Combiner les ventes de poulets et de poissons
    const allSales: Sale[] = [
      ...chickenSales.map((sale) => ({ ...sale, type_de_vente: "Poulets" })),
      ...fishSales.map((sale) => ({ ...sale, type_de_vente: "Poissons" })),
    ];

    // Filtrer les ventes des 7 derniers jours
    const filteredSales = allSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= sevenDaysAgo && saleDate <= today;
    });

    // Agréger les montants par jour
    const dailyTotals: { [key: string]: number } = {};
    labels.forEach((label) => {
      dailyTotals[label] = 0;
    });

    filteredSales.forEach((sale) => {
      const saleDate = new Date(sale.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      if (labels.includes(saleDate) && (!filterType || sale.type_de_vente === filterType)) {
        dailyTotals[saleDate] += sale.prix_total;
      }
    });

    const data = labels.map((label) => dailyTotals[label] || 0);

    return {
      labels,
      datasets: [{ data, color: () => COLORS.accent, strokeWidth: 2 }],
    };
  }, [chickenSales, fishSales, isChickenSalesLoading, isFishSalesLoading, filterType]);

  // Liste des boutons de navigation rapide
  const navButtons = useMemo(
    () =>
      [
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
        {
          name: "Sauvegarde",
          icon: "archive",
          screen: "Backup",
          hint: "Navigue vers la gestion des sauvegardes",
          code: "sauvegarde",
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
          name: "Tableau Avancé",
          icon: "dashboard",
          screen: "AdvancedDashboard",
          hint: "Navigue vers le tableau de bord avancé",
          code: "tableau_de_bord",
        },
      ].filter((button) => effectiveServices.includes(button.code)),
    [effectiveServices]
  );

  // Récupérer les informations utilisateur depuis AsyncStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem("userInfo");
        if (userData) {
          const user: UserInfo = JSON.parse(userData);
          const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
          setUserInitials(initials);
          setUserRole(user.role.code);
        } else {
          console.warn("Aucune donnée userInfo trouvée dans AsyncStorage");
          Toast.show({
            type: "errorToast",
            props: { message: "Aucune information utilisateur trouvée" },
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des infos utilisateur:", error);
        Toast.show({
          type: "errorToast",
          props: { message: "Erreur lors du chargement des informations utilisateur" },
        });
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
        { text: "Non", style: "cancel" },
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
                    props: { message: "Déconnexion réussie" },
                  });
                  navigation.replace("LoginScreen");
                },
                onError: (error: any) => {
                  Toast.show({
                    type: "errorToast",
                    props: { message: "Échec de la déconnexion" },
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
  const isDataValid = summaryData.length > 0 && salesChartData.labels.length > 0;

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
      {isServicesLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      ) : isServicesError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erreur lors du chargement des services. Veuillez réessayer.
          </Text>
        </View>
      ) : (
        <ScrollView>
          {/* Section des cartes de résumé */}
          <View style={styles.summaryContainer}>
            {summaryData.length > 0 && (
              <Text style={styles.sectionTitle}>Résumé Général</Text>
            )}
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
              // <Text style={styles.errorText}>
              //   Aucun service disponible pour cet utilisateur
              // </Text>
              <></>
            )}
          </View>

          {/* Section des graphiques */}
          {effectiveServices.includes("ventes") && (
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Ventes (7 jours, XOF)</Text>
                <CustomSelect
                  options={typeOptions}
                  value={filterType}
                  onChange={setFilterType}
                  placeholder="Type"
                  style={styles.filterSelect}
                />
              </View>
              {isChickenSalesLoading || isFishSalesLoading ? (
                <Text style={styles.loadingText}>Chargement des données...</Text>
              ) : isChickenSalesError || isFishSalesError ? (
                <Text style={styles.errorText}>Erreur lors du chargement des données des ventes.</Text>
              ) : isDataValid ? (
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
                      style: { borderRadius: SIZES.radius },
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
          )}

          {/* Section de navigation rapide */}
          <View style={styles.navigationContainer}>
            <Text style={styles.sectionTitle}>Accès Rapide</Text>
            {navButtons.length > 0 ? (
              <View style={styles.navButtonsContainer}>
                {navButtons.map((button, index) => (
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
            ) : (
              // <Text style={styles.errorText}>
              //   Aucun accès rapide disponible. Veuillez attribuer des services dans les paramètres.
              // </Text>
              <></>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Styles
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
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin,
  },
  filterSelect: {
    width: 120,
    padding: SIZES.padding / 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(HomeScreen);
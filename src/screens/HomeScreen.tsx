import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useNavigation } from '@react-navigation/native';

// Données mock pour les cartes et graphiques (à remplacer par données du backend)
const summaryData = [
  { title: 'Total Poulets', value: '12,450', unit: 'têtes', icon: 'egg' },
  { title: 'Total Poissons', value: '8,200', unit: 'têtes', icon: 'waves' },
  { title: 'Stocks Critiques', value: '3', unit: 'articles', icon: 'warning' },
  { title: 'Ventes Mois', value: '150,000', unit: 'XAF', icon: 'shopping-cart' },
];

// Données mock pour le graphique des mortalités (7 jours)
const mortalityChartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      data: [20, 45, 28, '80', 99, 43, 50],
      color: () => COLORS.secondary,
      strokeWidth: 2,
    },
  ],
};

// Données mock pour le graphique des ventes (7 jours)
const salesChartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      data: [50000, 75000, 60000, 90000, 120000, 80000, 95000],
      color: () => COLORS.accent,
      strokeWidth: 2,
    },
  ],
};

// Données mock pour le graphique des stocks critiques (7 jours)
const stockChartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      data: [5, 4, 3, 2, 3, 4, 3],
      color: () => COLORS.error,
      strokeWidth: 2,
    },
  ],
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  // Vérification des données
  const isDataValid =
    summaryData.length > 0 &&
    mortalityChartData.labels.length > 0 &&
    salesChartData.labels.length > 0 &&
    stockChartData.labels.length > 0;

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
                      if (item.title === 'Stocks Critiques') {
                        navigation.navigate('StockManagement');
                      } else if (item.title === 'Total Poulets') {
                        navigation.navigate('ChickenManagement');
                      } else if (item.title === 'Total Poissons') {
                        navigation.navigate('FishManagement');
                      } else if (item.title === 'Ventes Mois') {
                        navigation.navigate('SalesTrackingGeneral');
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
            <Text style={styles.errorText}>Erreur : Données non disponibles</Text>
          )}
        </View>

        {/* Section des graphiques */}
        {/* <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Mortalités (7 jours)</Text>
          {isDataValid ? (
            <Animatable.View animation="bounceIn" duration={1000}>
              <LineChart
                data={mortalityChartData}
                width={Dimensions.get('window').width - SIZES.padding * 2}
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
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Animatable.View>
          ) : (
            <Text style={styles.errorText}>Erreur : Données du graphique non disponibles</Text>
          )}
        </View> */}

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Ventes (7 jours, XAF)</Text>
          {isDataValid ? (
            <Animatable.View animation="bounceIn" duration={1000}>
              <LineChart
                data={salesChartData}
                width={Dimensions.get('window').width - SIZES.padding * 2}
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
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.accent,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Animatable.View>
          ) : (
            <Text style={styles.errorText}>Erreur : Données du graphique non disponibles</Text>
          )}
        </View>

        {/* <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Stocks Critiques (7 jours)</Text>
          {isDataValid ? (
            <Animatable.View animation="bounceIn" duration={1000}>
              <LineChart
                data={stockChartData}
                width={Dimensions.get('window').width - SIZES.padding * 2}
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
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.error,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </Animatable.View>
          ) : (
            <Text style={styles.errorText}>Erreur : Données du graphique non disponibles</Text>
          )}
        </View> */}

        {/* Section de navigation rapide */}
        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>Accès Rapide</Text>
          <View style={styles.navButtonsContainer}>
            {[
              {
                name: 'Poulets',
                icon: 'egg',
                screen: 'ChickenManagement',
                hint: 'Navigue vers la gestion des poulets',
                code:'poulets'
              },
              {
                name: 'Poissons',
                icon: 'waves',
                screen: 'FishManagement',
                hint: 'Navigue vers la gestion des poissons',
                code:'poissons'
              },
              {
                name: 'Stocks',
                icon: 'inventory',
                screen: 'StockManagement',
                hint: 'Navigue vers la gestion des stocks',
                code:'stocks'
              },
              {
                name: 'Rapports',
                icon: 'assessment',
                screen: 'Reports',
                hint: 'Navigue vers les rapports',
                code:'rapports'
              },
              {
                name: 'Ventes',
                icon: 'shopping-cart',
                screen: 'SalesTrackingGeneral',
                hint: 'Navigue vers le suivi des ventes',
                code:'ventes'
              },
              {
                name: 'Paramètres',
                icon: 'settings',
                screen: 'Settings',
                hint: 'Navigue vers les paramètres',
                code:'parametres'
              },
              {
                name: 'Sauvegarde',
                icon: 'archive',
                screen: 'Backup',
                hint: 'Navigue vers la gestion des sauvegardes',
                code:'sauvegarde'
              },
              {
                name: 'Tableau Avancé',
                icon: 'dashboard',
                screen: 'AdvancedDashboard',
                hint: 'Navigue vers le tableau de bord avancé',
                code:'tableau_de_bord'
              },
              {
                name: 'Planificateur',
                icon: 'event',
                screen: 'Planner',
                hint: 'Navigue vers le planificateur d’événements',
                code:'planificateur'
              },
              {
                name: 'Galerie',
                icon: 'photo-camera',
                screen: 'PhotoGallery',
                hint: 'Navigue vers la galerie photo',
                code:'galerie'
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (Dimensions.get('window').width - SIZES.padding * 3) / 2,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navButton: {
    width: (Dimensions.get('window').width - SIZES.padding * 3) / 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default memo(HomeScreen);
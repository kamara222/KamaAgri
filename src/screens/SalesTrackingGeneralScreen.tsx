// src/screens/SalesTrackingGeneralScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import CustomSelect from '../components/CustomSelect';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Données mock pour les ventes (à remplacer par API)
const mockSales = [
  {
    id: '1',
    type: 'Poulets',
    amount: 1000,
    date: '2025-05-01',
    target: 'Lot A1',
  },
  {
    id: '2',
    type: 'Poissons',
    amount: 75000,
    date: '2025-05-02',
    target: 'Bassin 1',
  },
  {
    id: '3',
    type: 'Poulets',
    amount: 60000,
    date: '2025-05-03',
    target: 'Lot B2',
  },
];

// Données mock pour le graphique des ventes (7 jours)
const salesChartData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      data: [1000, 75000, 60000, 90000, 120000, 80000, 95000],
      color: () => COLORS.accent,
      strokeWidth: 2,
    },
  ],
};

// Types pour une vente
interface Sale {
  id: string;
  type: string;
  amount: number;
  date: string;
  target: string;
}

const SalesTrackingGeneralScreen: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [filterType, setFilterType] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('mois');

  // Options pour les filtres
  const typeOptions = [
    { label: 'Tous', value: '' },
    { label: 'Poulets', value: 'Poulets' },
    { label: 'Poissons', value: 'Poissons' },
  ];

  const periodOptions = [
    { label: 'Jour', value: 'jour' },
    { label: 'Semaine', value: 'semaine' },
    { label: 'Mois', value: 'mois' },
  ];

  // Filtrer les ventes
  const filteredSales = sales.filter(
    (sale) => !filterType || sale.type === filterType
  );

  // Générer le contenu HTML pour le PDF
  const generatePDFContent = () => {
    const salesTable = filteredSales
      .map(
        (sale) => `
        <tr>
          <td>${sale.id}</td>
          <td>${sale.type}</td>
          <td>${sale.amount} XAF</td>
          <td>${sale.date}</td>
          <td>${sale.target}</td>
        </tr>`
      )
      .join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0288D1; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Rapport des Ventes</h1>
          <table>
            <tr><th>ID</th><th>Type</th><th>Montant</th><th>Date</th><th>Lot/Bassin</th></tr>
            ${salesTable}
          </table>
        </body>
      </html>
    `;
  };

  // Exporter les ventes en PDF
  const exportSales = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generatePDFContent(),
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le rapport des ventes',
        });
        Alert.alert('Succès', 'Rapport des ventes exporté avec succès.', [
          { text: 'OK', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Succès', `Rapport créé à: ${uri}`, [
          { text: 'OK', style: 'cancel' },
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de l’exportation:', error);
      Alert.alert('Erreur', 'Impossible d’exporter le rapport.', [
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  // Rendu de chaque vente
  const renderSaleItem = ({ item, index }: { item: Sale; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      style={styles.saleCard}
    >
      <View style={styles.cardHeader}>
        <Icon
          name={item.type === 'Poulets' ? 'egg' : 'waves'}
          size={24}
          color={COLORS.accent}
        />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>
            {item.type} - {item.target}
          </Text>
          <Text style={styles.cardDetail}>Montant: {item.amount} XAF</Text>
          <Text style={styles.cardDetail}>Date: {item.date}</Text>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* En-tête */}
      <Animatable.View animation="bounceIn" duration={1000} style={styles.header}>
        <Icon name="shopping-cart" size={28} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Suivi des Ventes</Text>
      </Animatable.View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <CustomSelect
          options={typeOptions}
          value={filterType}
          onChange={setFilterType}
          placeholder="Type"
          style={styles.filterSelect}
        />
        <CustomSelect
          options={periodOptions}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Période"
          style={styles.filterSelect}
        />
      </View>

      {/* Bouton d’exportation */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={exportSales}
        accessibilityLabel="Exporter les ventes en PDF"
        accessibilityHint="Génère et partage un rapport PDF des ventes"
      >
        <Icon name="picture-as-pdf" size={20} color={COLORS.white} />
        <Text style={styles.exportButtonText}>Exporter PDF</Text>
      </TouchableOpacity>

      {/* Graphique des ventes */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Ventes ({filterPeriod})</Text>
        <Animatable.View animation="bounceIn" duration={1000}>
          <LineChart
            data={salesChartData}
            width={Dimensions.get('window').width - SIZES.padding * 2}
            height={200}
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
                r: '5',
                strokeWidth: '1',
                stroke: COLORS.accent,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Animatable.View>
      </View>

      {/* Liste des ventes */}
      <Text style={styles.sectionTitle}>Historique des Ventes</Text>
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune vente disponible</Text>
        }
        scrollEnabled={false}
        nestedScrollEnabled
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.margin,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  filterSelect: {
    flex: 1,
    marginHorizontal: SIZES.margin / 2,
    padding: SIZES.padding / 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.margin,
  },
  exportButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: SIZES.margin / 2,
  },
  chartContainer: {
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    marginVertical: SIZES.margin,
  },
  chart: {
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    elevation: 3,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  saleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: SIZES.margin,
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  cardDetail: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  emptyText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
});

export default SalesTrackingGeneralScreen;
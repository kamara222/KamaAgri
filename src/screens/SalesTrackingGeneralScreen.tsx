import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import CustomSelect from '../components/CustomSelect';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useStats, useChickenSales, useFishSales } from '../services';

// Interface pour les statistiques de l'API
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

// Interface pour une vente (poulets ou poissons)
interface Sale {
  id: string;
  type: string;
  amount: number;
  date: string;
  target: string;
}

const SalesTrackingGeneralScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useStats();
  const { data: chickenSales, isLoading: isChickenSalesLoading, isError: isChickenSalesError } = useChickenSales();
  const { data: fishSales, isLoading: isFishSalesLoading, isError: isFishSalesError } = useFishSales();
  const [filterType, setFilterType] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('mois');
  const [showSellModal, setShowSellModal] = useState(false);

  // Options pour les filtres
  const typeOptions = [
    { label: 'Tous', value: '' },
    { label: 'Poulets', value: 'Poulets' },
    { label: 'Poissons', value: 'Poissons' },
  ];

  const periodOptions = [
    { label: 'Mois', value: 'mois' }, // Uniquement mois, car l'API fournit des données mensuelles
  ];

  // Combiner les ventes de poulets et de poissons
  const sales = useMemo<Sale[]>(() => {
    const salesData: Sale[] = [];
    if (chickenSales) {
      salesData.push(
        ...chickenSales.map((sale) => ({
          id: sale.id,
          type: 'Poulets',
          amount: sale.prix_total,
          date: sale.date,
          target: sale.batiment || 'Lot inconnu',
        }))
      );
    }
    if (fishSales) {
      salesData.push(
        ...fishSales.map((sale) => ({
          id: sale.id,
          type: 'Poissons',
          amount: sale.prix_total,
          date: sale.date,
          target: sale.bassin || 'Bassin inconnu',
        }))
      );
    }
    return salesData;
  }, [chickenSales, fishSales]);

  // Filtrer les ventes
  const filteredSales = sales.filter(
    (sale) => !filterType || sale.type === filterType
  );

  // Données pour le graphique des ventes
  const salesChartData = useMemo(() => {
    if (!stats) {
      return {
        labels: ['Poulets', 'Poissons'],
        datasets: [{ data: [0, 0], color: () => COLORS.accent, strokeWidth: 2 }],
      };
    }

    const data = [];
    if (!filterType || filterType === 'Poulets') {
      data.push(stats.prixVentePouletMois);
    } else {
      data.push(0);
    }
    if (!filterType || filterType === 'Poissons') {
      data.push(stats.prixVentePoissonMois);
    } else {
      data.push(0);
    }

    return {
      labels: ['Poulets', 'Poissons'],
      datasets: [{ data, color: () => COLORS.accent, strokeWidth: 2 }],
    };
  }, [stats, filterType]);

  // Gérer la navigation pour la vente
  const handleSellNavigation = (type: 'chicken' | 'fish') => {
    setShowSellModal(false);
    if (type === 'chicken') {
      navigation.navigate('SalesTracking'); // Remplacez par le nom exact de votre route
    } else {
      navigation.navigate('FishSalesTracking'); // Remplacez par le nom exact de votre route
    }
  };

  // Générer le contenu HTML pour le PDF
  const generatePDFContent = () => {
    if (!stats || (!chickenSales && !fishSales)) {
      return '<p>Données non disponibles</p>';
    }

    const salesTable = filteredSales
      .map(
        (sale) => `
        <tr>
          <!--<td>${sale.id}</td>-->
          <td>${sale.type}</td>
          <td>${sale.amount.toLocaleString('fr-FR')} XAF</td>
          <td>${new Date(sale.date).toLocaleDateString('fr-FR')}</td>
          <td>${sale.target}</td>
        </tr>`
      )
      .join('');

    const periode = stats
      ? `Période: ${new Date(stats.periode.debut).toLocaleDateString('fr-FR')} - ${new Date(stats.periode.finExclusive).toLocaleDateString('fr-FR')}`
      : 'Période non disponible';
    const totalSales = stats
      ? `Total des ventes: ${stats.totalVentesMois.toLocaleString('fr-FR')} XAF`
      : 'Total non disponible';

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12pt; }
            h1 { color: #0288D1; text-align: center; font-size: 24pt; margin-bottom: 20px; }
            h2 { font-size: 16pt; color: #333; margin-top: 20px; }
            p { font-size: 12pt; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12pt; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 20px; font-size: 10pt; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport des Ventes</h1>
            <p>${periode}</p>
          </div>
          <h2>Détails des Ventes</h2>
          <table>
            <tr>
              <!--<th>ID</th>-->
              <th>Type</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Lot/Bassin</th>
            </tr>
            ${salesTable || '<tr><td colspan="4">Aucune vente disponible</td></tr>'}
          </table>
          <h2>Récapitulatif</h2>
          <p>${totalSales}</p>
          <p class="footer">Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </body>
      </html>
    `;
  };

  // Exporter les ventes en PDF
  const exportSales = async () => {
    if (isChickenSalesLoading || isFishSalesLoading || isStatsLoading) {
      Alert.alert('Attendez', 'Les données sont en cours de chargement.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }
    if (isChickenSalesError || isFishSalesError || isStatsError) {
      Alert.alert('Erreur', 'Impossible de charger les données pour lexportation.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

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
      console.error('Erreur lors de lexportation:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter le rapport.', [
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
          <Text style={styles.cardDetail}>Montant: {item.amount.toLocaleString('fr-FR')} XAF</Text>
          <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
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

      {/* Filtres et Bouton Vendre */}
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
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => setShowSellModal(true)}
          accessibilityLabel="Vendre"
          accessibilityHint="Ouvre le menu pour vendre des poulets ou poissons"
        >
          <View style={styles.sellButtonContent}>
            <Text style={styles.sellButtonText}>Vendre</Text>
          <Icon name="add-shopping-cart" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de sélection Vendre */}
      <Modal
        visible={showSellModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSellModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSellModal(false)}
        >
          <Animatable.View
            animation="zoomIn"
            duration={300}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Que souhaitez-vous vendre ?</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSellNavigation('chicken')}
            >
              <Icon name="egg" size={32} color={COLORS.accent} />
              <Text style={styles.modalOptionText}>Poulets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSellNavigation('fish')}
            >
              <Icon name="waves" size={32} color={COLORS.accent} />
              <Text style={styles.modalOptionText}>Poissons</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowSellModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>

      {/* Bouton d'exportation */}
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
        <Text style={styles.sectionTitle}>
          Ventes ({stats ? `Mois: ${new Date(stats.periode.debut).toLocaleDateString('fr-FR')}` : 'Mois'})
        </Text>
        {isStatsLoading ? (
          <Text style={styles.loadingText}>Chargement des données...</Text>
        ) : isStatsError ? (
          <Text style={styles.errorText}>Erreur lors du chargement des données.</Text>
        ) : (
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
        )}
      </View>

      {/* Liste des ventes */}
      <Text style={styles.sectionTitle}>Historique des Ventes</Text>
      {isChickenSalesLoading || isFishSalesLoading ? (
        <Text style={styles.loadingText}>Chargement des ventes...</Text>
      ) : isChickenSalesError || isFishSalesError ? (
        <Text style={styles.errorText}>Erreur lors du chargement des ventes.</Text>
      ) : (
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
      )}
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
    alignItems: 'center',
    gap: SIZES.margin / 1,
    // justifyContent: 'center'
  },
  filterSelect: {
    flex: 1,
    marginHorizontal: SIZES.margin / 2,
    padding: SIZES.padding / 2,
  },
  sellButton: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding / 15,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.margin / 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 50,
    top: -5,
  },
  sellButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    marginRight: SIZES.margin / 4,
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
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  // Styles pour la modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 2,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  modalOptionText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.margin,
  },
  modalCancelButton: {
    marginTop: SIZES.margin,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
});

export default SalesTrackingGeneralScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';
import AddFishSaleModal from '../components/AddFishSaleModal';
import { useFishSales } from '../services';

// Types pour une vente
interface FishSale {
  id: string;
  date: string;
  type_de_vente: string;
  bassin: string;
  espece_poisson?: string;
  kg_poisson: number;
  prix_total: number;
  nom_complet_client?: string;
  mode_paiement: string;
}

const FishSalesTrackingScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterTypeVente, setFilterTypeVente] = useState('');
  const [filterEspece, setFilterEspece] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Liste statique des bassins
  const bassins = [
    { label: 'Tous les bassins', value: '' },
    { label: 'Bassin Nord', value: 'Bassin Nord' },
    { label: 'Bassin Sud', value: 'Bassin Sud' },
  ];

  // Options pour les filtres
  const typesVente = [
    { label: 'Tous les types', value: '' },
    { label: 'Vente directe', value: 'Vente directe' },
    { label: 'Vente en gros', value: 'Vente en gros' },
  ];
  const especes = [
    { label: 'Toutes espèces', value: '' },
    { label: 'Tilapia', value: 'Tilapia' },
    { label: 'Carpe', value: 'Carpe' },
    { label: 'Silure', value: 'Silure' },
    { label: 'Capitaine', value: 'Capitaine' },
  ];
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];
  const clients = [
    { label: 'Tous les clients', value: '' },
    { label: 'Marché Local', value: 'Marché Local' },
    { label: 'Restaurant XYZ', value: 'Restaurant XYZ' },
  ];

  // Utiliser le hook pour récupérer les ventes avec filtres
  const { data: sales = [], isLoading, isError } = useFishSales({
    type_de_vente: filterTypeVente,
    espece_poisson: filterEspece,
    bassin: filterBassin,
  });

  // Log pour déboguer les données reçues
  console.log('Ventes reçues:', sales);

  // Filtrer localement pour période et client
  const filteredSales = sales.filter((sale) => {
    try {
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' &&
          sale.date &&
          new Date(sale.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterPeriod === 'month' &&
          sale.date &&
          new Date(sale.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const matchesClient = !filterClient || sale.nom_complet_client === filterClient;
      return matchesPeriod && matchesClient;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: FishSale }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <Icon name="shopping-cart" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.bassin}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.cardDetail}>Type de vente: {item.type_de_vente}</Text>
      <Text style={styles.cardDetail}>Espèce: {item.espece_poisson || 'Non spécifiée'}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.kg_poisson} kg</Text>
      <Text style={styles.cardDetail}>Prix total: {item.prix_total} XAF</Text>
      <Text style={styles.cardDetail}>Client: {item.nom_complet_client || 'Non spécifié'}</Text>
      <Text style={styles.cardDetail}>Mode de paiement: {item.mode_paiement}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des ventes</Text>}

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={bassins}
          value={filterBassin}
          onChange={setFilterBassin}
          placeholder="Filtrer par bassin"
        />
        <CustomSelect
          options={typesVente}
          value={filterTypeVente}
          onChange={setFilterTypeVente}
          placeholder="Filtrer par type de vente"
        />
        <CustomSelect
          options={especes}
          value={filterEspece}
          onChange={setFilterEspece}
          placeholder="Filtrer par espèce"
        />
        {/* <CustomSelect
          options={periods}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Filtrer par période"
        /> */}
        {/* <CustomSelect
          options={clients}
          value={filterClient}
          onChange={setFilterClient}
          placeholder="Filtrer par client"
        /> */}
      </View>

      {/* Liste des ventes */}
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune vente enregistrée</Text>
        }
      />

      {/* Bouton flottant */}
      <Animatable.View animation="bounceIn" duration={1000}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter une vente */}
      <AddFishSaleModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(sale) => {
          console.log('Nouvelle vente soumise:', sale);
          setIsModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'column',
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  saleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: SIZES.margin / 2,
  },
  cardDetail: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
  fab: {
    position: 'absolute',
    bottom: SIZES.margin * 2,
    right: SIZES.margin * 2,
    backgroundColor: COLORS.accent,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default FishSalesTrackingScreen;
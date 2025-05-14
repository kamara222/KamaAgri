// src/screens/FeedTrackingScreen.tsx
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
import AddFeedDistributionModal from '../components/AddFeedDistributionModal';

// Données mock pour la liste des distributions (à remplacer par API)
const mockDistributions = [
  {
    id: '1',
    date: '2025-05-10',
    lot: 'Ross 308 - Bâtiment A',
    typeAliment: 'Granulés démarrage',
    quantite: 200,
  },
  {
    id: '2',
    date: '2025-05-08',
    lot: 'Cobb 500 - Bâtiment B',
    typeAliment: 'Granulés croissance',
    quantite: 150,
  },
];

// Types pour une distribution
interface FeedDistribution {
  id: string;
  date: string;
  lot: string;
  typeAliment: string;
  quantite: number;
}

const FeedTrackingScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterTypeAliment, setFilterTypeAliment] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Options pour les filtres
  const lots = [
    { label: 'Tous les lots', value: '' },
    { label: 'Ross 308 - Bâtiment A', value: 'Ross 308 - Bâtiment A' },
    { label: 'Cobb 500 - Bâtiment B', value: 'Cobb 500 - Bâtiment B' },
  ];
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];
  const typesAliment = [
    { label: 'Tous les types', value: '' },
    { label: 'Granulés démarrage', value: 'Granulés démarrage' },
    { label: 'Granulés croissance', value: 'Granulés croissance' },
    { label: 'Granulés finition', value: 'Granulés finition' },
  ];

  // Filtrer les distributions avec gestion des erreurs
  const filteredDistributions = mockDistributions.filter((distribution) => {
    try {
      const matchesLot = !filterLot || distribution.lot === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && distribution.date >= '2025-05-06') ||
        (filterPeriod === 'month' && distribution.date >= '2025-04-10');
      const matchesTypeAliment =
        !filterTypeAliment || distribution.typeAliment === filterTypeAliment;
      return matchesLot && matchesPeriod && matchesTypeAliment;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de distribution
  const renderDistributionItem = ({ item }: { item: FeedDistribution }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.distributionCard}>
      <View style={styles.cardHeader}>
        <Icon name="restaurant" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.lot}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Type: {item.typeAliment}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.quantite} kg</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={lots}
          value={filterLot}
          onChange={setFilterLot}
          placeholder="Filtrer par lot"
        />
        <CustomSelect
          options={periods}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Filtrer par période"
        />
        <CustomSelect
          options={typesAliment}
          value={filterTypeAliment}
          onChange={setFilterTypeAliment}
          placeholder="Filtrer par type"
        />
      </View>

      {/* Liste des distributions */}
      <FlatList
        data={filteredDistributions}
        renderItem={renderDistributionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune distribution enregistrée</Text>
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

      {/* Modal pour ajouter une distribution */}
      <AddFeedDistributionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(distribution) => {
          console.log('Nouvelle distribution:', distribution);
          setIsModalVisible(false);
          // TODO: Envoyer au backend
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
  distributionCard: {
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
});

export default FeedTrackingScreen;
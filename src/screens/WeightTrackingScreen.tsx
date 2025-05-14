// src/screens/WeightTrackingScreen.tsx
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
import AddWeightMeasurementModal from '../components/AddWeightMeasurementModal';

// Données mock pour la liste des mesures de poids (à remplacer par API)
const mockMeasurements = [
  {
    id: '1',
    date: '2025-05-10',
    lot: 'Ross 308 - Bâtiment A',
    poidsMoyen: 1.8,
    echantillon: 50,
  },
  {
    id: '2',
    date: '2025-05-08',
    lot: 'Cobb 500 - Bâtiment B',
    poidsMoyen: 1.9,
    echantillon: 40,
  },
];

// Types pour une mesure de poids
interface WeightMeasurement {
  id: string;
  date: string;
  lot: string;
  poidsMoyen: number;
  echantillon: number;
}

const WeightTrackingScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
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

  // Filtrer les mesures avec gestion des erreurs
  const filteredMeasurements = mockMeasurements.filter((measurement) => {
    try {
      const matchesLot = !filterLot || measurement.lot === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && measurement.date >= '2025-05-06') ||
        (filterPeriod === 'month' && measurement.date >= '2025-04-10');
      return matchesLot && matchesPeriod;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de mesure
  const renderMeasurementItem = ({ item }: { item: WeightMeasurement }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.measurementCard}>
      <View style={styles.cardHeader}>
        <Icon name="scale" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.lot}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Poids moyen: {item.poidsMoyen} kg</Text>
      <Text style={styles.cardDetail}>Échantillon: {item.echantillon} poulets</Text>
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
      </View>

      {/* Liste des mesures */}
      <FlatList
        data={filteredMeasurements}
        renderItem={renderMeasurementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune mesure enregistrée</Text>
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

      {/* Modal pour ajouter une mesure */}
      <AddWeightMeasurementModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(measurement) => {
          console.log('Nouvelle mesure:', measurement);
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
  measurementCard: {
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

export default WeightTrackingScreen;
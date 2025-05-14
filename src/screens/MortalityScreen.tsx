// src/screens/MortalityScreen.tsx
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
import AddMortalityModal from '../components/AddMortalityModal';

// Données mock pour la liste des mortalités
const mockMortalities = [
  {
    id: '1',
    date: '2025-05-10',
    lot: 'Ross 308 - Bâtiment A',
    nombreMorts: 15,
    cause: 'Maladie',
  },
  {
    id: '2',
    date: '2025-05-08',
    lot: 'Cobb 500 - Bâtiment B',
    nombreMorts: 10,
    cause: 'Chaleur excessive',
  },
];

// Types pour une mortalité
interface Mortality {
  id: string;
  date: string;
  lot: string;
  nombreMorts: number;
  cause: string;
}

const MortalityScreen: React.FC = () => {
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

  // Filtrer les mortalités
  const filteredMortalities = mockMortalities.filter((mortality) => {
    try {
      const matchesLot = !filterLot || mortality.lot === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && mortality.date >= '2025-05-06') ||
        (filterPeriod === 'month' && mortality.date >= '2025-04-10');
      return matchesLot && matchesPeriod;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de mortalité
  const renderMortalityItem = ({ item }: { item: Mortality }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.mortalityCard}>
      <View style={styles.cardHeader}>
        <Icon name="warning" size={28} color={COLORS.error} />
        <Text style={styles.cardTitle}>{item.lot}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Morts: {item.nombreMorts}</Text>
      <Text style={styles.cardDetail}>Cause: {item.cause}</Text>
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

      {/* Liste des mortalités */}
      <FlatList
        data={filteredMortalities}
        renderItem={renderMortalityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune mortalité enregistrée</Text>
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

      {/* Modal pour ajouter une mortalité */}
      <AddMortalityModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(mortality) => {
          console.log('Nouvelle mortalité:', mortality);
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  mortalityCard: {
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
    backgroundColor: COLORS.secondary,
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

export default MortalityScreen;
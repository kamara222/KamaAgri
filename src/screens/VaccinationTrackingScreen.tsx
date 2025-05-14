// src/screens/VaccinationTrackingScreen.tsx
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
import AddVaccinationModal from '../components/AddVaccinationModal';

// Données mock pour la liste des vaccins/traitements (à remplacer par API)
const mockVaccinations = [
  {
    id: '1',
    date: '2025-05-05',
    lot: 'Ross 308 - Bâtiment A',
    type: 'Vaccin Newcastle',
    methode: 'Eau de boisson',
  },
  {
    id: '2',
    date: '2025-05-03',
    lot: 'Cobb 500 - Bâtiment B',
    type: 'Antibiotique Amoxicilline',
    methode: 'Injection',
  },
];

// Types pour un vaccin/traitement
interface Vaccination {
  id: string;
  date: string;
  lot: string;
  type: string;
  methode: string;
}

const VaccinationTrackingScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterType, setFilterType] = useState('');
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
  const types = [
    { label: 'Tous les types', value: '' },
    { label: 'Vaccin Newcastle', value: 'Vaccin Newcastle' },
    { label: 'Antibiotique Amoxicilline', value: 'Antibiotique Amoxicilline' },
    { label: 'Vaccin Gumboro', value: 'Vaccin Gumboro' },
  ];

  // Filtrer les vaccins/traitements avec gestion des erreurs
  const filteredVaccinations = mockVaccinations.filter((vaccination) => {
    try {
      const matchesLot = !filterLot || vaccination.lot === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && vaccination.date >= '2025-05-01') ||
        (filterPeriod === 'month' && vaccination.date >= '2025-04-05');
      const matchesType = !filterType || vaccination.type === filterType;
      return matchesLot && matchesPeriod && matchesType;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de vaccin/traitement
  const renderVaccinationItem = ({ item }: { item: Vaccination }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.vaccinationCard}>
      <View style={styles.cardHeader}>
        <Icon name="medical-services" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.type}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Lot: {item.lot}</Text>
      <Text style={styles.cardDetail}>Méthode: {item.methode}</Text>
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
          options={types}
          value={filterType}
          onChange={setFilterType}
          placeholder="Filtrer par type"
        />
      </View>

      {/* Liste des vaccins/traitements */}
      <FlatList
        data={filteredVaccinations}
        renderItem={renderVaccinationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun enregistrement trouvé</Text>
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

      {/* Modal pour ajouter un vaccin/traitement */}
      <AddVaccinationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(vaccination) => {
          console.log('Nouveau vaccin/traitement:', vaccination);
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
  vaccinationCard: {
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

export default VaccinationTrackingScreen;
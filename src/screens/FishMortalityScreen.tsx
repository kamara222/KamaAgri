// src/screens/FishMortalityScreen.tsx
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
import AddFishMortalityModal from '../components/AddFishMortalityModal';

// Données mock pour la liste des mortalités (à remplacer par API)
const mockMortalities = [
  {
    id: '1',
    date: '2025-05-10',
    bassin: 'Bassin Nord',
    nombreMorts: 10,
    cause: 'Maladie',
  },
  {
    id: '2',
    date: '2025-05-08',
    bassin: 'Bassin Sud',
    nombreMorts: 5,
    cause: 'Qualité eau',
  },
];

// Types pour une mortalité
interface Mortality {
  id: string;
  date: string;
  bassin: string;
  nombreMorts: number;
  cause: string;
}

const FishMortalityScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterCause, setFilterCause] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Options pour les filtres
  const bassins = [
    { label: 'Tous les bassins', value: '' },
    { label: 'Bassin Nord', value: 'Bassin Nord' },
    { label: 'Bassin Sud', value: 'Bassin Sud' },
  ];
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];
  const causes = [
    { label: 'Toutes causes', value: '' },
    { label: 'Maladie', value: 'Maladie' },
    { label: 'Qualité eau', value: 'Qualité eau' },
    { label: 'Autre', value: 'Autre' },
  ];

  // Filtrer les mortalités avec gestion des erreurs
  const filteredMortalities = mockMortalities.filter((mortality) => {
    try {
      const matchesBassin = !filterBassin || mortality.bassin === filterBassin;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && mortality.date >= '2025-05-06') ||
        (filterPeriod === 'month' && mortality.date >= '2025-04-10');
      const matchesCause = !filterCause || mortality.cause === filterCause;
      return matchesBassin && matchesPeriod && matchesCause;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de mortalité
  const renderMortalityItem = ({ item }: { item: Mortality }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.mortalityCard}>
      <View style={styles.cardHeader}>
        <Icon name="warning" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.bassin}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Nombre de morts: {item.nombreMorts}</Text>
      <Text style={styles.cardDetail}>Cause: {item.cause}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={bassins}
          value={filterBassin}
          onChange={setFilterBassin}
          placeholder="Filtrer par bassin"
        />
        <CustomSelect
          options={periods}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Filtrer par période"
        />
        <CustomSelect
          options={causes}
          value={filterCause}
          onChange={setFilterCause}
          placeholder="Filtrer par cause"
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
      <AddFishMortalityModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(mortality) => {
          console.log('Nouvelle mortalité:', mortality);
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

export default FishMortalityScreen;
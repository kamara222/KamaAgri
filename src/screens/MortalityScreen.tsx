import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';
import AddMortalityModal from '../components/AddMortalityModal';
import { useMortalities, useCreateMortality, useLots } from '../services';

// Interface pour une mortalité
interface Mortality {
  id: string;
  date: string;
  batiment: string;
  race: string;
  nombre: number;
  cause: string;
}

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string | null;
  race: string | null;
  date: string;
  nombre: number;
  poids_moyen: number;
}

const MortalityScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Récupérer les mortalités via API
  const { data: mortalities, isLoading, error } = useMortalities(filterLot ? filterLot.split(' - ')[0] : undefined);

  // Récupérer les lots pour les options de filtre
  const { data: lots } = useLots();

  // Mutation pour créer une mortalité
  const createMortalityMutation = useCreateMortality();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des mortalités',
      },
    });
  }

  // Créer les options pour les lots dynamiquement
  const lotOptions = [
    { label: 'Tous les lots', value: '' },
    ...(lots?.map((lot) => ({
      label: `${lot.race || 'Inconnu'} - ${lot.batiment || 'Inconnu'}`,
      value: `${lot.race || 'Inconnu'} - ${lot.batiment || 'Inconnu'}`,
    })) || []),
  ];

  // Options pour les périodes
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];

  // Filtrer les mortalités localement
  const filteredMortalities = mortalities?.filter((mortality) => {
    try {
      const lotString = `${mortality.race || 'Inconnu'} - ${mortality.batiment || 'Inconnu'}`;
      const matchesLot = !filterLot || lotString === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && mortality.date >= '2025-05-06') ||
        (filterPeriod === 'month' && mortality.date >= '2025-04-10');
      return matchesLot && matchesPeriod;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  }) || [];

  // Gérer la soumission du modal
  const handleAddMortality = (form: {
    date: Date;
    lot: string;
    nombreMorts: string;
    cause: string;
    customCause?: string;
  }) => {
    const [race, batiment] = form.lot.split(' - ');
    createMortalityMutation.mutate(
      {
        date: form.date.toISOString().split('T')[0], // Format ISO
        batiment,
        race,
        nombre: parseInt(form.nombreMorts),
        cause: form.cause === 'Autre' ? form.customCause || 'Inconnue' : form.cause,
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'successToast',
            props: {
              message: 'Mortalité ajoutée avec succès',
            },
          });
          setIsModalVisible(false);
        },
        onError: (err) => {
          Toast.show({
            type: 'errorToast',
            props: {
              message: 'Erreur lors de l’ajout de la mortalité',
            },
          });
        },
      }
    );
  };

  // Rendu de chaque carte de mortalité
  const renderMortalityItem = ({ item }: { item: Mortality }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.mortalityCard}>
      <View style={styles.cardHeader}>
        <Icon name="warning" size={28} color={COLORS.error} />
        <Text style={styles.cardTitle}>{`${item.race || 'Inconnu'} - ${item.batiment || 'Inconnu'}`}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Morts: {item.nombre}</Text>
      <Text style={styles.cardDetail}>Cause: {item.cause}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={lotOptions}
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Chargement des mortalités...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMortalities}
          renderItem={renderMortalityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune mortalité enregistrée</Text>
          }
        />
      )}

      {/* Bouton flottant */}
      <Animatable.View animation="bounceIn" duration={1000}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="Ajouter une nouvelle mortalité"
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter une mortalité */}
      <AddMortalityModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddMortality}
        lots={lotOptions} // Passer les options dynamiques
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
});

export default MortalityScreen;
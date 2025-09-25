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
import AddFeedDistributionModal from '../components/AddFeedDistributionModal';
import { useFeedDistributions, useCreateFeedDistribution, useLots } from '../services';

// Interface pour une distribution d'aliment
interface FeedDistribution {
  id: string;
  date: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre?: number;
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

const FeedTrackingScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterTypeAliment, setFilterTypeAliment] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Récupérer les distributions via API
  const { data: distributions, isLoading, error } = useFeedDistributions(
    filterTypeAliment || undefined
  );

  // Récupérer les lots pour les options de filtre
  const { data: lots } = useLots();

  // Mutation pour créer une distribution
  const createFeedDistributionMutation = useCreateFeedDistribution();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des distributions',
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

  // Options pour les types d'aliments (mockées, pas d'API fournie)
  const typesAliment = [
    { label: 'Tous les types', value: '' },
    { label: 'Granulés démarrage', value: 'Granulés démarrage' },
    { label: 'Granulés croissance', value: 'Granulés croissance' },
    { label: 'Granulés finition', value: 'Granulés finition' },
  ];

  // Filtrer les distributions localement
  const filteredDistributions = distributions?.filter((distribution) => {
    try {
      const lotString = `${distribution.nom_alimentation || 'Inconnu'}`;
      const matchesLot = !filterLot || lotString.includes(filterLot.split(' - ')[1] || '');
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && distribution.date >= '2025-05-06') ||
        (filterPeriod === 'month' && distribution.date >= '2025-04-10');
      const matchesTypeAliment =
        !filterTypeAliment || distribution.type === filterTypeAliment;
      return matchesLot && matchesPeriod && matchesTypeAliment;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  }) || [];

  // Gérer la soumission du modal
  const handleAddDistribution = (form: {
    date: Date;
    lot: string;
    typeAliment: string;
    quantite: string;
  }) => {
    const [race, nom_alimentation] = form.lot.split(' - ');
    createFeedDistributionMutation.mutate(
      {
        date: form.date.toISOString().split('T')[0], // Format ISO
        nom_alimentation,
        type: form.typeAliment,
        poids: parseFloat(form.quantite),
        nombre: parseFloat(form.quantite), // Optionnel, mais inclus ici pour cohérence
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'successToast',
            props: {
              message: 'Distribution ajoutée avec succès',
            },
          });
          setIsModalVisible(false);
        },
        onError: (err) => {
          Toast.show({
            type: 'errorToast',
            props: {
              message: 'Erreur lors de l’ajout de la distribution',
            },
          });
        },
      }
    );
  };

  // Rendu de chaque carte de distribution
  const renderDistributionItem = ({ item }: { item: FeedDistribution }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.distributionCard}>
      <View style={styles.cardHeader}>
        <Icon name="restaurant" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.nom_alimentation || 'Inconnu'}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Type: {item.type}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.poids} kg</Text>
      {item.nombre && <Text style={styles.cardDetail}>Nombre: {item.nombre}</Text>}
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
        <CustomSelect
          options={typesAliment}
          value={filterTypeAliment}
          onChange={setFilterTypeAliment}
          placeholder="Filtrer par type"
        />
      </View>

      {/* Liste des distributions */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Chargement des distributions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDistributions}
          renderItem={renderDistributionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune distribution enregistrée</Text>
          }
        />
      )}

      {/* Bouton flottant */}
      <Animatable.View animation="bounceIn" duration={1000}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
          accessibilityLabel="Ajouter une nouvelle distribution"
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter une distribution */}
      <AddFeedDistributionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddDistribution}
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

export default FeedTrackingScreen;
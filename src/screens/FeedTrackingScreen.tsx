import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';
import AddFeedDistributionModal from '../components/AddFeedDistributionModal';
import { useFeedDistributions, useCreateFeedDistribution, useLots, useDeleteFeedDistribution } from '../services';

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
  race: string | { nom: string; code: string } | null;
  date: string;
  nombre: number;
  poids_moyen: number;
}

const FeedTrackingScreen: React.FC = () => {
  const [filterBatiment, setFilterBatiment] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterTypeAliment, setFilterTypeAliment] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  // Récupérer les distributions via API
  const { data: distributions, isLoading, error } = useFeedDistributions();

  // Récupérer les lots pour vérification
  const { data: lots } = useLots();

  // Mutation pour créer une distribution
  const createFeedDistributionMutation = useCreateFeedDistribution();
  // Mutation pour supprimer une distribution
  const deleteFeedDistributionMutation = useDeleteFeedDistribution();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des distributions',
      },
    });
  }

  // Créer les options pour les bâtiments à partir des distributions
  const batimentOptions = [
    { label: 'Tous les bâtiments', value: '' },
    ...(distributions
      ? [...new Set(distributions.map((distribution) => distribution.nom_alimentation || 'Inconnu'))].map((batiment) => ({
          label: batiment,
          value: batiment,
        }))
      : []),
    // Fallback pour inclure Bâtiment C
    ...(distributions && !distributions.some((d) => d.nom_alimentation === 'Bâtiment C')
      ? [{ label: 'Bâtiment C', value: 'Bâtiment C' }]
      : []),
  ];

  // Log pour déboguer les options de bâtiments
  console.log('Options des bâtiments:', batimentOptions);

  // Options pour les périodes
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];

  // Options pour les types d'aliments
  const typesAliment = [
    { label: 'Tous les types', value: '' },
    { label: 'Granulés démarrage', value: 'Granulés démarrage' },
    { label: 'Granulés croissance', value: 'Granulés croissance' },
    { label: 'Granulés finition', value: 'Granulés finition' },
  ];

  // Calculer les dates pour le filtrage par période
  const today = new Date('2025-09-26');
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7); // 7 jours avant
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1); // 1 mois avant

  // Filtrer les distributions localement
  const filteredDistributions = distributions?.filter((distribution) => {
    try {
      const matchesBatiment = !filterBatiment || distribution.nom_alimentation === filterBatiment;
      const distributionDate = new Date(distribution.date);
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && distributionDate >= oneWeekAgo) ||
        (filterPeriod === 'month' && distributionDate >= oneMonthAgo);
      const matchesTypeAliment = !filterTypeAliment || distribution.type === filterTypeAliment;
      console.log('Filtrage:', {
        id: distribution.id,
        batiment: distribution.nom_alimentation,
        matchesBatiment,
        date: distribution.date,
        matchesPeriod,
        type: distribution.type,
        matchesTypeAliment,
      });
      return matchesBatiment && matchesPeriod && matchesTypeAliment;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  }) || [];

  // Gérer la soumission du modal
  const handleAddDistribution = (form: {
    date: Date;
    batiment: string;
    typeAliment: string;
    quantite: string;
  }) => {
    console.log('Soumission de la distribution:', form);
    createFeedDistributionMutation.mutate(
      {
        date: form.date.toISOString().split('T')[0],
        nom_alimentation: form.batiment,
        type: form.typeAliment,
        poids: parseFloat(form.quantite),
        nombre: parseFloat(form.quantite),
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
          setResetForm(true);
        },
        onError: (err) => {
          console.error('Erreur lors de l’ajout de la distribution:', err);
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

  // Gérer la suppression d'une distribution
  const handleDeleteDistribution = (distributionId: string, distribution: FeedDistribution) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la distribution pour ${distribution.nom_alimentation || 'Inconnu'} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteFeedDistributionMutation.mutate(distributionId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Distribution supprimée avec succès',
                  },
                });
              },
              onError: () => {
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur lors de la suppression de la distribution',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Rendu de chaque carte de distribution
  const renderDistributionItem = ({ item }: { item: FeedDistribution }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.distributionCard}>
      <View style={styles.cardHeader}>
        <Icon name="restaurant" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.nom_alimentation || 'Inconnu'}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDistribution(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
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
          options={batimentOptions}
          value={filterBatiment}
          onChange={(value) => {
            console.log('Filtre bâtiment sélectionné:', value);
            setFilterBatiment(value);
          }}
          placeholder="Filtrer par bâtiment"
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
          onPress={() => {
            setIsModalVisible(true);
            setResetForm(true);
          }}
          accessibilityLabel="Ajouter une nouvelle distribution"
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter une distribution */}
      <AddFeedDistributionModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setResetForm(false);
        }}
        onSubmit={handleAddDistribution}
        batiments={batimentOptions} // Passer les options de bâtiments
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
    flex: 1,
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
  deleteButton: {
    padding: 8,
  },
});

export default FeedTrackingScreen;
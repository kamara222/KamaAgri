import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';
import AddFishFeedModal from '../components/AddFishFeedModal';
import { useFishFeedDistributions, useBassins, useDeleteFishFeedDistribution } from '../services';
import Toast from 'react-native-toast-message';

// Types pour une distribution d’aliment
interface FishFeedDistribution {
  id: string;
  date: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre: number;
}

const FishFeedTrackingScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterTypeAliment, setFilterTypeAliment] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Hook pour récupérer les bassins dynamiquement
  const { data: bassinsData = [] } = useBassins();
  const bassins = [
    { label: 'Tous les bassins', value: '' },
    ...bassinsData.map((basin: { nom_bassin: string }) => ({
      label: basin.nom_bassin,
      value: basin.nom_bassin,
    })),
  ];

  // Options pour les filtres
  const typesAliment = [
    { label: 'Tous les types', value: '' },
    { label: 'Granulés', value: 'Granulés' },
    { label: 'Farine', value: 'Farine' },
  ];
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];

  // Utiliser le hook pour récupérer les distributions avec filtre par type
  const { data: distributions = [], isLoading, isError } = useFishFeedDistributions(filterTypeAliment);

  // Hook pour supprimer une distribution
  const deleteFishFeedDistributionMutation = useDeleteFishFeedDistribution();

  // Log pour déboguer les données reçues
  console.log('Distributions reçues:', JSON.stringify(distributions, null, 2));

  // Gérer la suppression d'une distribution
  const handleDeleteDistribution = (distributionId: string, distribution: FishFeedDistribution) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la distribution de ${distribution.nom_alimentation} (${distribution.type}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteFishFeedDistributionMutation.mutate(distributionId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Distribution supprimée avec succès',
                  },
                });
              },
              onError: (error) => {
                console.error('Erreur lors de la suppression:', error);
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur',
                    description: 'Erreur lors de la suppression de la distribution',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Filtrer localement pour bassin et période
  const filteredDistributions = distributions.filter((distribution) => {
    try {
      const matchesBassin = !filterBassin || distribution.nom_alimentation.includes(filterBassin);
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' &&
          distribution.date &&
          new Date(distribution.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterPeriod === 'month' &&
          distribution.date &&
          new Date(distribution.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      return matchesBassin && matchesPeriod;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de distribution
  const renderFeedItem = ({ item }: { item: FishFeedDistribution }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.feedCard}>
      <View style={styles.cardHeader}>
        <Icon name="restaurant" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.nom_alimentation}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDistribution(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.cardDetail}>Type d’aliment: {item.type}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.poids} kg</Text>
      <Text style={styles.cardDetail}>Nombre: {item.nombre}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des distributions</Text>}

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={bassins}
          value={filterBassin}
          onChange={setFilterBassin}
          placeholder="Filtrer par bassin"
        />
        <CustomSelect
          options={typesAliment}
          value={filterTypeAliment}
          onChange={setFilterTypeAliment}
          placeholder="Filtrer par type d’aliment"
        />
        <CustomSelect
          options={periods}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Filtrer par période"
        />
      </View>

      {/* Liste des distributions */}
      <FlatList
        data={filteredDistributions}
        renderItem={renderFeedItem}
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
      <AddFishFeedModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(distribution) => {
          console.log('Nouvelle distribution soumise:', distribution);
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
  feedCard: {
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
  deleteButton: {
    padding: 8,
  },
});

export default FishFeedTrackingScreen;
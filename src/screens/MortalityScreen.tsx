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
import AddMortalityModal from '../components/AddMortalityModal';
import { useMortalities, useCreateMortality, useDeleteMortality, useLots } from '../services';

// Interface pour une mortalité
interface Mortality {
  id: string;
  date: string;
  batiment: string;
  race: string | { nom: string; code: string }; // Accepte race comme chaîne ou objet
  nombre: number;
  cause: string;
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

const MortalityScreen: React.FC = () => {
  const [filterBatiment, setFilterBatiment] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  // Récupérer les mortalités via API
  const { data: mortalities, isLoading, error } = useMortalities();

  // Récupérer les lots pour vérification
  const { data: lots } = useLots();

  // Mutation pour créer une mortalité
  const createMortalityMutation = useCreateMortality();
  // Mutation pour supprimer une mortalité
  const deleteMortalityMutation = useDeleteMortality();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des mortalités',
      },
    });
  }

  // Créer les options pour les bâtiments à partir des mortalités
  const batimentOptions = [
    { label: 'Tous les bâtiments', value: '' },
    ...(mortalities
      ? [...new Set(mortalities.map((mortality) => mortality.batiment || 'Inconnu'))].map((batiment) => ({
          label: batiment,
          value: batiment,
        }))
      : []),
    // Fallback pour inclure Bâtiment C si non présent dans les mortalités
    ...(mortalities && !mortalities.some((m) => m.batiment === 'Bâtiment C')
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

  // Calculer les dates pour le filtrage par période
  const today = new Date('2025-09-26'); // Date actuelle
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7); // 7 jours avant
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1); // 1 mois avant

  // Filtrer les mortalités localement
  const filteredMortalities = mortalities?.filter((mortality) => {
    try {
      const matchesBatiment = !filterBatiment || mortality.batiment === filterBatiment;
      const mortalityDate = new Date(mortality.date);
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && mortalityDate >= oneWeekAgo) ||
        (filterPeriod === 'month' && mortalityDate >= oneMonthAgo);
      console.log('Filtrage:', {
        id: mortality.id,
        batiment: mortality.batiment,
        matchesBatiment,
        date: mortality.date,
        matchesPeriod,
      });
      return matchesBatiment && matchesPeriod;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  }) || [];

  // Gérer la soumission du modal
  const handleAddMortality = (form: {
    date: Date;
    batiment: string;
    race: string;
    nombreMorts: string;
    cause: string;
  }) => {
    console.log('Soumission de la mortalité:', form); // Log pour vérifier form.race
    createMortalityMutation.mutate(
      {
        date: form.date.toISOString().split('T')[0],
        batiment: form.batiment,
        race: form.race, // form.race est une chaîne (code de la race)
        nombre: parseInt(form.nombreMorts),
        cause: form.cause,
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
          setResetForm(true);
        },
        onError: (err) => {
          console.error('Erreur lors de l’ajout de la mortalité:', err);
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

  // Gérer la suppression d'une mortalité
  const handleDeleteMortality = (mortalityId: string, mortality: Mortality) => {
    const raceName = typeof mortality.race === 'string' ? mortality.race : mortality.race?.nom || 'Inconnu';
    const displayString = `${raceName} - ${mortality.batiment || 'Inconnu'}`;
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la mortalité pour ${displayString} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteMortalityMutation.mutate(mortalityId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Mortalité supprimée avec succès',
                  },
                });
              },
              onError: () => {
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur lors de la suppression de la mortalité',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Rendu de chaque carte de mortalité
  const renderMortalityItem = ({ item }: { item: Mortality }) => {
    const raceName = typeof item.race === 'string' ? item.race : item.race?.nom || 'Inconnu';
    console.log('Rendu de la mortalité:', { id: item.id, race: item.race, raceName }); // Log pour débogage
    return (
      <Animatable.View animation="fadeInUp" duration={500} style={styles.mortalityCard}>
        <View style={styles.cardHeader}>
          <Icon name="warning" size={28} color={COLORS.error} />
          <Text style={styles.cardTitle}>
            {`${raceName} - ${item.batiment || 'Inconnu'}`}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMortality(item.id, item)}
          >
            <Icon name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDetail}>Date: {item.date}</Text>
        <Text style={styles.cardDetail}>Morts: {item.nombre}</Text>
        <Text style={styles.cardDetail}>Cause: {item.cause}</Text>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={batimentOptions}
          value={filterBatiment}
          onChange={(value) => {
            console.log('Filtre bâtiment sélectionné:', value); // Log pour débogage
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
          onPress={() => {
            setIsModalVisible(true);
            setResetForm(true);
          }}
          accessibilityLabel="Ajouter une nouvelle mortalité"
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter une mortalité */}
      <AddMortalityModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setResetForm(false);
        }}
        onSubmit={handleAddMortality}
        resetForm={resetForm}
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
  deleteButton: {
    padding: 8,
  },
});

export default MortalityScreen;
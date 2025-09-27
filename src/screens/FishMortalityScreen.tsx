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
import AddFishMortalityModal from '../components/AddFishMortalityModal';
import { useFishMortalities, useDeleteFishMortality } from '../services';
import Toast from 'react-native-toast-message';

// Types pour une mortalité
interface FishMortality {
  id: string;
  date?: string;
  bassin: string;
  nombre?: number;
  cause: string;
  espece: string | { code: string; nom: string } | null;
}

// Type pour une espèce
interface Espece {
  label: string;
  value: string;
}

const FishMortalityScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterCause, setFilterCause] = useState('');
  const [filterEspece, setFilterEspece] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Liste statique des espèces pour la correspondance
  const especes: Espece[] = [
    { label: 'Toutes espèces', value: '' },
    { label: 'Tilapia', value: 'tilapia' },
    { label: 'Silure', value: 'silure' },
    { label: 'Carpe', value: 'carpe' },
  ];

  // Options pour les filtres
  const bassins = [
    { label: 'Tous les bassins', value: '' },
    { label: 'Bassin Nord', value: 'Bassin Nord' },
    { label: 'Bassin Sud', value: 'Bassin Sud' },
    { label: 'Bassin Est', value: 'Bassin Est' },
    { label: 'Bassin Ouest', value: 'Bassin Ouest' },
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

  // Utiliser le hook pour récupérer les mortalités avec filtre par espèce
  const { data: mortalities = [], isLoading, isError } = useFishMortalities(filterEspece);

  // Hook pour supprimer une mortalité
  const deleteFishMortalityMutation = useDeleteFishMortality();

  // Log pour déboguer les données reçues
  console.log('Mortalités reçues (brut):', JSON.stringify(mortalities, null, 2));
  console.log('État de chargement:', isLoading);
  console.log('Erreur API:', isError);
  console.log('Filtre espèce:', filterEspece);

  // Mapper le code de l'espèce à son nom pour l'affichage
  const getEspeceName = (espece?: string | { code: string; nom: string } | null) => {
    if (!espece) {
      console.log('espece est null ou undefined:', espece);
      return 'Non spécifiée';
    }
    if (typeof espece === 'string') {
      const especeFound = especes.find((e: Espece) => e.value === espece.toLowerCase());
      console.log(`Recherche de l'espèce "${espece}" dans especes:`, especes);
      console.log('Espèce trouvée:', especeFound);
      return especeFound ? especeFound.label : espece;
    }
    console.log(`Recherche de l'espèce (objet) "${espece.code}" dans especes:`, especes);
    const especeFound = especes.find((e: Espece) => e.value === espece.code.toLowerCase());
    console.log('Espèce trouvée:', especeFound);
    return especeFound ? especeFound.label : espece.nom || 'Non spécifiée';
  };

  // Gérer la suppression d'une mortalité
  const handleDeleteMortality = (mortalityId: string, mortality: FishMortality) => {
    const especeDisplay = getEspeceName(mortality.espece);
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la mortalité pour ${mortality.bassin} (${especeDisplay}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteFishMortalityMutation.mutate(mortalityId, {
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

  // Filtrer localement pour bassin, période et cause
  const filteredMortalities = mortalities.filter((mortality) => {
    try {
      const matchesBassin = !filterBassin || mortality.bassin === filterBassin;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' &&
          mortality.date &&
          new Date(mortality.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterPeriod === 'month' &&
          mortality.date &&
          new Date(mortality.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const matchesCause = !filterCause || mortality.cause === filterCause;
      return matchesBassin && matchesPeriod && matchesCause;
    } catch (error) {
      console.error('Erreur de filtrage pour mortalité:', mortality, error);
      return true;
    }
  });

  // Rendu de chaque carte de mortalité
  const renderMortalityItem = ({ item }: { item: FishMortality }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.mortalityCard}>
      <View style={styles.cardHeader}>
        <Icon name="warning" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.bassin}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMortality(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      {item.date && <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>}
      <Text style={styles.cardDetail}>Nombre de morts: {item.nombre || 0}</Text>
      <Text style={styles.cardDetail}>Cause: {item.cause}</Text>
      <Text style={styles.cardDetail}>Espèce: {getEspeceName(item.espece)}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des mortalités</Text>}

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
        <CustomSelect
          options={especes}
          value={filterEspece}
          onChange={setFilterEspece}
          placeholder="Filtrer par espèce"
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
          console.log('Nouvelle mortalité soumise:', JSON.stringify(mortality, null, 2));
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

export default FishMortalityScreen;
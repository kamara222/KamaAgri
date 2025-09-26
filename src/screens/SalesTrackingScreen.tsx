import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';
import AddSaleModal from '../components/AddSaleModal';
import { useChickenSales, useDeleteChickenSale, useRaces } from '../services';
import Toast from 'react-native-toast-message';

// Types pour une vente
interface Sale {
  id: string;
  date: string;
  type_de_vente: string;
  batiment: string;
  race_poulet?: string | { code: string; nom: string } | null;
  nombre_poulet: number;
  prix_unitaitre: number;
  prix_total: number;
  nom_complet_client: string;
  mode_paiement: string;
}

// Type pour une race
interface Race {
  code: string;
  nom: string;
}

const SalesTrackingScreen: React.FC = () => {
  const [filterBatiment, setFilterBatiment] = useState('');
  const [filterRace, setFilterRace] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Liste statique des bâtiments
  const batiments = [
    { label: 'Tous les bâtiments', value: '' },
    { label: 'Bâtiment A', value: 'Bâtiment A' },
    { label: 'Bâtiment B', value: 'Bâtiment B' },
    { label: 'Bâtiment C', value: 'Bâtiment C' },
  ];

  // Récupérer les races dynamiquement
  const { data: racesData = [], isLoading: isRacesLoading, isError: isRacesError } = useRaces();
  const races = [
    { label: 'Toutes races', value: '' },
    ...racesData.map((race: Race) => ({
      label: race.nom,
      value: race.code,
    })),
  ];

  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];

  // Utiliser le hook pour récupérer les ventes avec filtres
  const { data: sales = [], isLoading, isError } = useChickenSales({
    type_de_vente: 'Poulet',
    race_poulet: filterRace,
    batiment: filterBatiment,
  });

  // Hook pour supprimer une vente
  const deleteChickenSaleMutation = useDeleteChickenSale();

  // Log pour déboguer les données reçues
  console.log('Ventes poulets reçues:', sales);
  console.log('État de chargement:', isLoading);
  console.log('Erreur API:', isError);
  console.log('Races chargées:', racesData);

  // Définir les clients dynamiquement avec une vérification pour sales
  const clients = [
    { label: 'Tous les clients', value: '' },
    ...(sales && Array.isArray(sales)
      ? [...new Set(sales.map((sale) => sale.nom_complet_client))].map((client) => ({
          label: client,
          value: client,
        }))
      : []),
  ];

  // Filtrer localement pour période, client et recherche
  const filteredSales = sales && Array.isArray(sales) ? sales.filter((sale) => {
    try {
      const today = new Date('2025-09-26');
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);

      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' &&
          sale.date &&
          new Date(sale.date) >= oneWeekAgo) ||
        (filterPeriod === 'month' &&
          sale.date &&
          new Date(sale.date) >= oneMonthAgo);

      const matchesClient = !filterClient || sale.nom_complet_client === filterClient;

      // Gestion de la recherche par race, bâtiment ou client
      const race = sale.race_poulet
        ? typeof sale.race_poulet === 'string'
          ? sale.race_poulet.toLowerCase()
          : sale.race_poulet.nom
          ? sale.race_poulet.nom.toLowerCase()
          : ''
        : '';
      const batiment =
        sale.batiment !== null && sale.batiment !== undefined
          ? sale.batiment.toLowerCase()
          : '';
      const client = sale.nom_complet_client
        ? sale.nom_complet_client.toLowerCase()
        : '';
      const matchesSearch =
        !searchQuery ||
        race.includes(searchQuery.toLowerCase()) ||
        batiment.includes(searchQuery.toLowerCase()) ||
        client.includes(searchQuery.toLowerCase());

      return matchesPeriod && matchesClient && matchesSearch;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  }) : [];

  // Gérer la suppression d'une vente
  const handleDeleteSale = (saleId: string, sale: Sale) => {
    const raceDisplay =
      typeof sale.race_poulet === 'string'
        ? sale.race_poulet
        : sale.race_poulet?.nom || 'Inconnu';
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la vente pour ${sale.batiment} (${raceDisplay}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteChickenSaleMutation.mutate(saleId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Vente supprimée avec succès',
                  },
                });
              },
              onError: () => {
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur lors de la suppression de la vente',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Mapper le code de la race à son nom pour l'affichage
  const getRaceName = (race_poulet?: string | { code: string; nom: string } | null) => {
    if (!race_poulet) return 'Non spécifiée';
    if (typeof race_poulet === 'string') {
      const race = racesData.find((r: Race) => r.code === race_poulet);
      return race ? race.nom : race_poulet;
    }
    return race_poulet.nom || 'Non spécifiée';
  };

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: Sale }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <Icon name="shopping-cart" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.batiment}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSale(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.cardDetail}>Race: {getRaceName(item.race_poulet)}</Text>
      <Text style={styles.cardDetail}>Nombre vendu: {item.nombre_poulet}</Text>
      <Text style={styles.cardDetail}>
        Prix unitaire: {item.prix_unitaitre ? `${item.prix_unitaitre.toFixed(2)} XAF` : 'Non défini'}
      </Text>
      <Text style={styles.cardDetail}>Prix total: {item.prix_total.toFixed(2)} XAF</Text>
      <Text style={styles.cardDetail}>Client: {item.nom_complet_client}</Text>
      <Text style={styles.cardDetail}>Mode de paiement: {item.mode_paiement}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading || isRacesLoading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : null}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des ventes</Text>}
      {isRacesError && <Text style={styles.errorText}>Erreur lors du chargement des races</Text>}

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par race, bâtiment ou client"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher une vente"
        />
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={batiments}
          value={filterBatiment}
          onChange={setFilterBatiment}
          placeholder="Filtrer par bâtiment"
        />
        <CustomSelect
          options={races}
          value={filterRace}
          onChange={setFilterRace}
          placeholder="Filtrer par race"
        />
        <CustomSelect
          options={periods}
          value={filterPeriod}
          onChange={setFilterPeriod}
          placeholder="Filtrer par période"
        />
        <CustomSelect
          options={clients}
          value={filterClient}
          onChange={setFilterClient}
          placeholder="Filtrer par client"
        />
      </View>

      {/* Liste des ventes */}
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune vente enregistrée</Text>
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

      {/* Modal pour ajouter une vente */}
      <AddSaleModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(sale) => {
          console.log('Nouvelle vente soumise:', sale);
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    paddingHorizontal: SIZES.padding,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    padding: SIZES.padding / 2,
  },
  filterContainer: {
    flexDirection: 'column',
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  saleCard: {
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

export default SalesTrackingScreen;
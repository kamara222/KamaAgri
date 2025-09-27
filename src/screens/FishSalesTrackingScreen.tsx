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
import AddFishSaleModal from '../components/AddFishSaleModal';
import { useFishSales, useDeleteFishSale } from '../services';
import Toast from 'react-native-toast-message';

// Types pour une vente
interface FishSale {
  id: string;
  date: string;
  type_de_vente: string;
  bassin: string;
  espece_poisson?: string | { code: string; nom: string } | null;
  kg_poisson: number;
  prix_kg_poisson?: number;
  prix_total: number;
  nom_complet_client?: string;
  mode_paiement: string;
}

// Type pour une espèce
interface Espece {
  label: string;
  value: string;
}

const FishSalesTrackingScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterEspece, setFilterEspece] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Liste statique des bassins
  const bassins = [
    { label: 'Tous les bassins', value: '' },
    { label: 'Bassin Nord', value: 'Bassin Nord' },
    { label: 'Bassin Sud', value: 'Bassin Sud' },
  ];

  // Liste statique des espèces
  const especes = [
    { label: 'Toutes espèces', value: '' },
    { label: 'Tilapia', value: 'tilapia' },
    { label: 'Silure', value: 'silure' },
    { label: 'Carpe', value: 'carpe' },
  ];

  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];

  // Utiliser le hook pour récupérer les ventes avec filtres
  const { data: sales = [], isLoading, isError } = useFishSales({
    type_de_vente: 'Poisson',
    espece_poisson: filterEspece,
    bassin: filterBassin,
  });

  // Hook pour supprimer une vente
  const deleteFishSaleMutation = useDeleteFishSale();

  // Log pour déboguer les données reçues
  console.log('Ventes poissons reçues (brut):', JSON.stringify(sales, null, 2));
  console.log('État de chargement:', isLoading);
  console.log('Erreur API:', isError);
  console.log('Filtre espèce appliqué:', filterEspece);

  // Définir les clients dynamiquement
  const clients = [
    { label: 'Tous les clients', value: '' },
    ...(sales && Array.isArray(sales)
      ? [...new Set(sales.map((sale) => sale.nom_complet_client))].map((client) => ({
          label: client || 'Non spécifié',
          value: client || '',
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

      // Gestion de la recherche par espèce, bassin ou client
      const espece = sale.espece_poisson
        ? typeof sale.espece_poisson === 'string'
          ? sale.espece_poisson.toLowerCase()
          : sale.espece_poisson.nom
          ? sale.espece_poisson.nom.toLowerCase()
          : ''
        : '';
      const bassin =
        sale.bassin !== null && sale.bassin !== undefined
          ? sale.bassin.toLowerCase()
          : '';
      const client = sale.nom_complet_client
        ? sale.nom_complet_client.toLowerCase()
        : '';
      const matchesSearch =
        !searchQuery ||
        espece.includes(searchQuery.toLowerCase()) ||
        bassin.includes(searchQuery.toLowerCase()) ||
        client.includes(searchQuery.toLowerCase());

      return matchesPeriod && matchesClient && matchesSearch;
    } catch (error) {
      console.error('Erreur de filtrage pour vente:', sale, error);
      return true;
    }
  }) : [];

  // Gérer la suppression d'une vente
  const handleDeleteSale = (saleId: string, sale: FishSale) => {
    const especeDisplay = getEspeceName(sale.espece_poisson);
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer la vente pour ${sale.bassin} (${especeDisplay}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteFishSaleMutation.mutate(saleId, {
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

  // Mapper le code de l'espèce à son nom pour l'affichage
  const getEspeceName = (espece_poisson?: string | { code: string; nom: string } | null) => {
    if (!espece_poisson) {
      console.log('espece_poisson est null ou undefined:', espece_poisson);
      return 'Non spécifiée';
    }
    if (typeof espece_poisson === 'string') {
      const espece = especes.find((e: Espece) => e.value === espece_poisson);
      console.log(`Recherche de l'espèce "${espece_poisson}" dans especes:`, especes);
      console.log('Espèce trouvée:', espece);
      return espece ? espece.label : espece_poisson;
    }
    console.log(`Recherche de l'espèce (objet) "${espece_poisson.code}" dans especes:`, especes);
    const espece = especes.find((e: Espece) => e.value === espece_poisson.code);
    console.log('Espèce trouvée:', espece);
    return espece ? espece.label : espece_poisson.nom || 'Non spécifiée';
  };

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: FishSale }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <Icon name="shopping-cart" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.bassin}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSale(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDetail}>Date: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.cardDetail}>Espèce: {getEspeceName(item.espece_poisson)}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.kg_poisson} kg</Text>
      <Text style={styles.cardDetail}>
        Prix par kg: {item.prix_kg_poisson ? `${item.prix_kg_poisson.toFixed(2)} XAF` : 'Non défini'}
      </Text>
      <Text style={styles.cardDetail}>Prix total: {item.prix_total.toFixed(2)} XAF</Text>
      <Text style={styles.cardDetail}>Client: {item.nom_complet_client || 'Non spécifié'}</Text>
      <Text style={styles.cardDetail}>Mode de paiement: {item.mode_paiement}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : null}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des ventes</Text>}

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par espèce, bassin ou client"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher une vente"
        />
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={bassins}
          value={filterBassin}
          onChange={setFilterBassin}
          placeholder="Filtrer par bassin"
        />
        <CustomSelect
          options={especes}
          value={filterEspece}
          onChange={setFilterEspece}
          placeholder="Filtrer par espèce"
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
      <AddFishSaleModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(sale) => {
          console.log('Nouvelle vente soumise:', JSON.stringify(sale, null, 2));
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

export default FishSalesTrackingScreen;
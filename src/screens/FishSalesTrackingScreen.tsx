import React, { useState, useEffect, useMemo } from 'react';
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
import DetailModal from '../components/DetailModal';
import { useFishSales, useDeleteFishSale } from '../services';
import { saleDetailRows } from '../utils';
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
  const [selectedSale, setSelectedSale] = useState<FishSale | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [filterBassin, filterEspece, filterPeriod, filterClient, searchQuery]);

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

  // Définir les clients dynamiquement
  const clients = [
    { label: 'Tous les clients', value: '' },
    ...(Array.isArray(sales)
      ? [...new Set(sales.map((sale) => sale.nom_complet_client).filter(Boolean))].map((client) => ({
          label: client || 'Non spécifié',
          value: client || '',
        }))
      : []),
  ];

  // Filtrer localement (mémoïsé) pour période, client et recherche
  const filteredSales = useMemo(() => {
    const list = Array.isArray(sales) ? sales : [];
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const q = searchQuery.toLowerCase();

    return list.filter((sale) => {
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && sale.date && new Date(sale.date) >= oneWeekAgo) ||
        (filterPeriod === 'month' && sale.date && new Date(sale.date) >= oneMonthAgo);

      const matchesClient = !filterClient || sale.nom_complet_client === filterClient;

      const espece = sale.espece_poisson
        ? typeof sale.espece_poisson === 'string'
          ? sale.espece_poisson.toLowerCase()
          : (sale.espece_poisson?.nom ?? '').toLowerCase()
        : '';
      const bassin = sale.bassin ? String(sale.bassin).toLowerCase() : '';
      const client = sale.nom_complet_client ? sale.nom_complet_client.toLowerCase() : '';
      const matchesSearch =
        !searchQuery || espece.includes(q) || bassin.includes(q) || client.includes(q);

      return matchesPeriod && matchesClient && matchesSearch;
    });
  }, [sales, filterPeriod, filterClient, searchQuery]);

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
    if (!espece_poisson) return 'Non spécifiée';
    if (typeof espece_poisson === 'string') {
      const espece = especes.find((e: Espece) => e.value === espece_poisson);
      return espece ? espece.label : espece_poisson;
    }
    const espece = especes.find((e: Espece) => e.value === espece_poisson.code);
    return espece ? espece.label : espece_poisson.nom || 'Non spécifiée';
  };

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: FishSale }) => (
    <Animatable.View animation="fadeInUp" duration={400} style={styles.saleCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedSale(item)}>
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
        <Text style={styles.cardDetail}>Prix total: {(item.prix_total ?? 0).toFixed(2)} XAF</Text>
      </TouchableOpacity>
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
        data={filteredSales.slice(0, visibleCount)}
        renderItem={renderSaleItem as any}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune vente enregistrée</Text>
        }
        onEndReached={() => setVisibleCount((c) => c + 10)}
        onEndReachedThreshold={0.4}
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

      {/* Modal de détail d'une vente */}
      <DetailModal
        visible={!!selectedSale}
        title="Détail de la vente"
        rows={selectedSale ? saleDetailRows(selectedSale) : []}
        onClose={() => setSelectedSale(null)}
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
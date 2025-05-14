// src/screens/FishSalesTrackingScreen.tsx
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
import AddFishSaleModal from '../components/AddFishSaleModal';

// Données mock pour la liste des ventes (à remplacer par API)
const mockSales = [
  {
    id: '1',
    date: '2025-05-10',
    bassin: 'Bassin Nord',
    quantite: 50,
    prixTotal: 250000,
    client: 'Marché Local',
  },
  {
    id: '2',
    date: '2025-05-08',
    bassin: 'Bassin Sud',
    quantite: 30,
    prixTotal: 150000,
    client: 'Restaurant XYZ',
  },
];

// Types pour une vente
interface Sale {
  id: string;
  date: string;
  bassin: string;
  quantite: number;
  prixTotal: number;
  client?: string;
}

const FishSalesTrackingScreen: React.FC = () => {
  const [filterBassin, setFilterBassin] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClient, setFilterClient] = useState('');
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
  const clients = [
    { label: 'Tous les clients', value: '' },
    { label: 'Marché Local', value: 'Marché Local' },
    { label: 'Restaurant XYZ', value: 'Restaurant XYZ' },
  ];

  // Filtrer les ventes avec gestion des erreurs
  const filteredSales = mockSales.filter((sale) => {
    try {
      const matchesBassin = !filterBassin || sale.bassin === filterBassin;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && sale.date >= '2025-05-06') ||
        (filterPeriod === 'month' && sale.date >= '2025-04-10');
      const matchesClient = !filterClient || sale.client === filterClient;
      return matchesBassin && matchesPeriod && matchesClient;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: Sale }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <Icon name="shopping-cart" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.bassin}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Quantité: {item.quantite} kg</Text>
      <Text style={styles.cardDetail}>Prix total: {item.prixTotal} XAF</Text>
      <Text style={styles.cardDetail}>Client: {item.client || 'Non spécifié'}</Text>
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
          console.log('Nouvelle vente:', sale);
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

export default FishSalesTrackingScreen;
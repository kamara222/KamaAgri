// src/screens/SalesTrackingScreen.tsx
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
import AddSaleModal from '../components/AddSaleModal';

// Données mock pour la liste des ventes (à remplacer par API)
const mockSales = [
  {
    id: '1',
    date: '2025-05-10',
    lot: 'Ross 308 - Bâtiment A',
    nombreVendu: 100,
    prixUnitaire: 5000,
    client: 'Client A',
    modePaiement: 'Espèces',
  },
  {
    id: '2',
    date: '2025-05-08',
    lot: 'Cobb 500 - Bâtiment B',
    nombreVendu: 150,
    prixUnitaire: 4800,
    client: 'Client B',
    modePaiement: 'Virement',
  },
];

// Types pour une vente
interface Sale {
  id: string;
  date: string;
  lot: string;
  nombreVendu: number;
  prixUnitaire: number;
  client: string;
  modePaiement: string;
}

const SalesTrackingScreen: React.FC = () => {
  const [filterLot, setFilterLot] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Options pour les filtres
  const lots = [
    { label: 'Tous les lots', value: '' },
    { label: 'Ross 308 - Bâtiment A', value: 'Ross 308 - Bâtiment A' },
    { label: 'Cobb 500 - Bâtiment B', value: 'Cobb 500 - Bâtiment B' },
  ];
  const periods = [
    { label: 'Toutes périodes', value: '' },
    { label: 'Dernière semaine', value: 'week' },
    { label: 'Dernier mois', value: 'month' },
  ];
  const clients = [
    { label: 'Tous les clients', value: '' },
    { label: 'Client A', value: 'Client A' },
    { label: 'Client B', value: 'Client B' },
  ];

  // Filtrer les ventes avec gestion des erreurs
  const filteredSales = mockSales.filter((sale) => {
    try {
      const matchesLot = !filterLot || sale.lot === filterLot;
      const matchesPeriod =
        !filterPeriod ||
        (filterPeriod === 'week' && sale.date >= '2025-05-06') ||
        (filterPeriod === 'month' && sale.date >= '2025-04-10');
      const matchesClient = !filterClient || sale.client === filterClient;
      return matchesLot && matchesPeriod && matchesClient;
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      return true;
    }
  });

  // Rendu de chaque carte de vente
  const renderSaleItem = ({ item }: { item: Sale }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <Icon name="attach-money" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.lot}</Text>
      </View>
      <Text style={styles.cardDetail}>Date: {item.date}</Text>
      <Text style={styles.cardDetail}>Nombre vendu: {item.nombreVendu}</Text>
      <Text style={styles.cardDetail}>Prix unitaire: {item.prixUnitaire} XAF</Text>
      <Text style={styles.cardDetail}>Client: {item.client}</Text>
      <Text style={styles.cardDetail}>Paiement: {item.modePaiement}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={lots}
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

export default SalesTrackingScreen;
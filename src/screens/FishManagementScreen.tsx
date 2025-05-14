// src/screens/FishManagementScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import AddBasinModal from '../components/AddBasinModal';
import { useNavigation } from '@react-navigation/native';

// Données mock pour la liste des bassins (à remplacer par API)
const mockBasins = [
  {
    id: '1',
    nom: 'Bassin Nord',
    espece: 'Tilapia',
    dateMiseEnEau: '2025-05-01',
    nombrePoissons: 1000,
    volume: 50,
  },
  {
    id: '2',
    nom: 'Bassin Sud',
    espece: 'Carpe',
    dateMiseEnEau: '2025-04-15',
    nombrePoissons: 800,
    volume: 40,
  },
];

// Types pour un bassin
interface Basin {
  id: string;
  nom: string;
  espece: string;
  dateMiseEnEau: string;
  nombrePoissons: number;
  volume: number;
}

const FishManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filtrer les bassins en fonction de la recherche
  const filteredBasins = mockBasins.filter(
    (basin) =>
      basin.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basin.espece.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Rendu de chaque carte de bassin
  const renderBasinItem = ({ item }: { item: Basin }) => (
    <TouchableOpacity
      style={styles.basinCard}
      onPress={() => {
        // TODO: Naviguer vers la modification du bassin
        console.log('Modifier bassin', item.id);
      }}
    >
      <View style={styles.basinHeader}>
        <Icon name="waves" size={24} color={COLORS.accent} />
        <Text style={styles.basinTitle}>{item.nom}</Text>
      </View>
      <Text style={styles.basinDetail}>Espèce: {item.espece}</Text>
      <Text style={styles.basinDetail}>Mise en eau: {item.dateMiseEnEau}</Text>
      <Text style={styles.basinDetail}>Poissons: {item.nombrePoissons}</Text>
      <Text style={styles.basinDetail}>Volume: {item.volume} m³</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou espèce"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Boutons de navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('FishMortality')}
        >
          <Text style={styles.navButtonText}>Suivi des Mortalités</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('FishFeedTracking')}
        >
          <Text style={styles.navButtonText}>Suivi de l’Alimentation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('FishSalesTracking')}
        >
          <Text style={styles.navButtonText}>Suivi des Ventes</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des bassins */}
      <FlatList
        data={filteredBasins}
        renderItem={renderBasinItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun bassin trouvé</Text>
        }
      />

      {/* Bouton flottant pour ajouter un bassin */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Icon name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal pour ajouter un bassin */}
      <AddBasinModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(basin) => {
          console.log('Nouveau bassin:', basin);
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
  navigationButtons: {
    flexDirection: 'column',
    marginHorizontal: SIZES.margin,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    alignItems: 'center',
  },
  navButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: SIZES.fontMedium,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  basinCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  basinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  basinTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: SIZES.margin / 2,
  },
  basinDetail: {
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

export default FishManagementScreen;
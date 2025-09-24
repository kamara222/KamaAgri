import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import AddLotModal from '../components/AddLotModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLots, useCreateLot } from '../services';

// Définir les types pour la navigation
type RootStackParamList = {
  Mortality: undefined;
  FeedTracking: undefined;
  SalesTracking: undefined;
  Error: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string | null;
  race: string | null;
  date: string;
  nombre: number;
  poids_moyen: number;
}

const ChickenManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Récupérer les lots via API
  const { data: lots, isLoading, error } = useLots(searchQuery ? searchQuery : undefined);

  // Mutation pour créer un lot
  const createLotMutation = useCreateLot();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des lots',
      },
    });
  }

  // Filtrer les lots localement avec vérification des null
  const filteredLots = lots?.filter(
    (lot) =>
      (lot.race?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lot.batiment?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  // Gérer la soumission du modal
  const handleAddLot = (form: {
    dateArrivee: Date;
    nombrePoulets: string;
    poidsMoyen: string;
    batiment: string;
    race: string;
  }) => {
    createLotMutation.mutate(
      {
        batiment: form.batiment,
        race: form.race,
        date: form.dateArrivee.toISOString().split('T')[0], // Format ISO (YYYY-MM-DD)
        nombre: parseInt(form.nombrePoulets),
        poids_moyen: parseFloat(form.poidsMoyen),
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'successToast',
            props: {
              message: 'Lot ajouté avec succès',
            },
          });
          setIsModalVisible(false);
        },
        onError: (err) => {
          Toast.show({
            type: 'errorToast',
            props: {
              message: 'Erreur lors de l’ajout du lot',
            },
          });
        },
      }
    );
  };

  // Rendu de chaque carte de lot
  const renderLotItem = ({ item }: { item: Lot }) => (
    <TouchableOpacity
      style={styles.lotCard}
      onPress={() => {
        console.log('Modifier lot', item.id); // À remplacer par EditLotModal
      }}
    >
      <View style={styles.lotHeader}>
        <Icon name="egg" size={24} color={COLORS.primary} />
        <Text style={styles.lotTitle}>{item.race || 'Inconnu'}</Text>
      </View>
      <Text style={styles.lotDetail}>Arrivée: {item.date}</Text>
      <Text style={styles.lotDetail}>Poulets: {item.nombre}</Text>
      <Text style={styles.lotDetail}>Poids moyen: {item.poids_moyen} kg</Text>
      <Text style={styles.lotDetail}>Bâtiment: {item.batiment || 'Inconnu'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par race ou bâtiment"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher un lot"
        />
      </View>

      {/* Boutons de navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Mortality')}
        >
          <Text style={styles.navButtonText}>Suivi des Mortalités</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('FeedTracking')}
        >
          <Text style={styles.navButtonText}>Suivi de l’Alimentation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('SalesTracking')}
        >
          <Text style={styles.navButtonText}>Suivi des Ventes</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des lots */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Chargement des lots...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLots}
          renderItem={renderLotItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun lot trouvé</Text>
          }
        />
      )}

      {/* Bouton flottant pour ajouter un lot */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        accessibilityLabel="Ajouter un nouveau lot"
      >
        <Icon name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal pour ajouter un lot */}
      <AddLotModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddLot}
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
  lotCard: {
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
  lotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  lotTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: SIZES.margin / 2,
  },
  lotDetail: {
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
});

export default ChickenManagementScreen;
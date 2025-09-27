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
import AddBasinModal from '../components/AddBasinModal';
import { useNavigation } from '@react-navigation/native';
import { useBassins, useDeleteBassin } from '../services';
import Toast from 'react-native-toast-message';

// Types pour un bassin
interface Basin {
  id: string;
  nom_bassin: string;
  espece: string | { code: string; nom: string } | null;
  date?: string;
  nombre?: number;
}

// Type pour une espèce
interface Espece {
  label: string;
  value: string;
}

const FishManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Liste statique des espèces pour la correspondance
  const especes: Espece[] = [
    { label: 'Tilapia', value: 'tilapia' },
    { label: 'Silure', value: 'silure' },
    { label: 'Carpe', value: 'carpe' },
  ];

  // Utiliser le hook pour récupérer les bassins avec filtre par espèce si nécessaire
  const { data: basins = [], isLoading, isError } = useBassins(searchQuery);

  // Hook pour supprimer un bassin
  const deleteBassinMutation = useDeleteBassin();

  // Log pour déboguer les données reçues
  console.log('Bassins reçus (brut):', JSON.stringify(basins, null, 2));
  console.log('État de chargement:', isLoading);
  console.log('Erreur API:', isError);
  console.log('Recherche:', searchQuery);

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

  // Gérer la suppression d'un bassin
  const handleDeleteBassin = (bassinId: string, bassin: Basin) => {
    const especeDisplay = getEspeceName(bassin.espece);
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer le bassin ${bassin.nom_bassin} (${especeDisplay}) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteBassinMutation.mutate(bassinId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Bassin supprimé avec succès',
                  },
                });
              },
              onError: () => {
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur lors de la suppression du bassin',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Filtrer les bassins en fonction de la recherche (nom_bassin et espece)
  const filteredBasins = basins && Array.isArray(basins) ? basins.filter((basin) => {
    try {
      const nomBassin = basin.nom_bassin ? basin.nom_bassin.toLowerCase() : '';
      const espece = basin.espece
        ? typeof basin.espece === 'string'
          ? basin.espece.toLowerCase()
          : basin.espece.nom
          ? basin.espece.nom.toLowerCase()
          : ''
        : '';
      return (
        nomBassin.includes(searchQuery.toLowerCase()) ||
        espece.includes(searchQuery.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur de filtrage pour bassin:', basin, error);
      return true;
    }
  }) : [];

  // Rendu de chaque carte de bassin
  const renderBasinItem = ({ item }: { item: Basin }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.basinCard}>
      <View style={styles.basinHeader}>
        <Icon name="waves" size={24} color={COLORS.accent} />
        <Text style={styles.basinTitle}>{item.nom_bassin}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBassin(item.id, item)}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.basinDetail}>Espèce: {getEspeceName(item.espece)}</Text>
      {item.date && <Text style={styles.basinDetail}>Mise en eau: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>}
      {item.nombre && <Text style={styles.basinDetail}>Poissons: {item.nombre}</Text>}
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Indicateur de chargement */}
      {isLoading && <Text style={styles.loadingText}>Chargement...</Text>}
      {isError && <Text style={styles.errorText}>Erreur lors du chargement des bassins</Text>}

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou espèce"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Rechercher un bassin"
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
      <Animatable.View animation="bounceIn" duration={1000}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter un bassin */}
      <AddBasinModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(basin) => {
          console.log('Nouveau bassin soumis:', JSON.stringify(basin, null, 2));
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
    flex: 1,
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

export default FishManagementScreen;
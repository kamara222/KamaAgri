import React, { useState, useRef, useMemo } from 'react';
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
import DetailModal from '../components/DetailModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigations/navigation';
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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBasin, setEditingBasin] = useState<Basin | null>(null);
  const [selectedBasin, setSelectedBasin] = useState<Basin | null>(null);
  const [fabExtended, setFabExtended] = useState(true);
  const lastOffsetY = useRef(0);

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

  // Mapper le code de l'espèce à son nom pour l'affichage
  const getEspeceName = (espece?: string | { code: string; nom: string } | null) => {
    if (!espece) return 'Non spécifiée';
    if (typeof espece === 'string') {
      const especeFound = especes.find((e: Espece) => e.value === espece.toLowerCase());
      return especeFound ? especeFound.label : espece;
    }
    const especeFound = especes.find((e: Espece) => e.value === (espece.code ?? '').toLowerCase());
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

  // Filtrer les bassins (mémoïsé) en fonction de la recherche (nom_bassin et espece)
  const filteredBasins = useMemo(
    () =>
      (Array.isArray(basins) ? basins : []).filter((basin) => {
        const nomBassin = basin.nom_bassin ? basin.nom_bassin.toLowerCase() : '';
        const espece = basin.espece
          ? typeof basin.espece === 'string'
            ? basin.espece.toLowerCase()
            : (basin.espece?.nom ?? '').toLowerCase()
          : '';
        const q = searchQuery.toLowerCase();
        return nomBassin.includes(q) || espece.includes(q);
      }),
    [basins, searchQuery]
  );

  // Total des poissons affichés (somme des `nombre` des bassins) — cohérent avec le dashboard
  const totalPoissons = filteredBasins.reduce((sum, basin) => sum + (basin.nombre || 0), 0);

  // Mapper un bassin (API) vers le formulaire pour pré-remplir l'édition
  const mapBasinToForm = (basin: Basin) => ({
    id: basin.id,
    nom_bassin: basin.nom_bassin || '',
    espece: typeof basin.espece === 'string' ? basin.espece : basin.espece?.code || '',
    date: basin.date || '',
    nombre: basin.nombre !== undefined && basin.nombre !== null ? String(basin.nombre) : '',
  });

  // Ouvrir le formulaire en mode édition
  const handleEditBasin = (basin: Basin) => {
    setEditingBasin(basin);
    setIsModalVisible(true);
  };

  // Lignes de détail d'un bassin pour la modal
  const basinDetailRows = (basin: Basin) => [
    { label: 'Nom du bassin', value: basin.nom_bassin || 'Non spécifié' },
    { label: 'Espèce', value: getEspeceName(basin.espece) },
    {
      label: 'Mise en eau',
      value: basin.date ? new Date(basin.date).toLocaleDateString('fr-FR') : '—',
    },
    { label: 'Nombre de poissons', value: `${basin.nombre ?? 0}` },
  ];

  // FAB : réduire/étendre selon le sens du scroll
  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastOffsetY.current + 8 && fabExtended) setFabExtended(false);
    else if (y < lastOffsetY.current - 8 && !fabExtended) setFabExtended(true);
    lastOffsetY.current = y;
  };

  // Rendu de chaque carte de bassin
  const renderBasinItem = ({ item }: { item: Basin }) => (
    <Animatable.View animation="fadeInUp" duration={400} style={styles.basinCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedBasin(item)}>
        <View style={styles.basinHeader}>
          <Icon name="waves" size={24} color={COLORS.accent} />
          <Text style={styles.basinTitle}>{item.nom_bassin}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteBassin(item.id, item)}
              accessibilityLabel="Supprimer le bassin"
            >
              <Icon name="delete" size={24} color={COLORS.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditBasin(item)}
              accessibilityLabel="Modifier le bassin"
            >
              <Icon name="edit" size={24} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.basinDetail}>Espèce: {getEspeceName(item.espece)}</Text>
        {item.date && <Text style={styles.basinDetail}>Mise en eau: {new Date(item.date).toLocaleDateString('fr-FR')}</Text>}
        {item.nombre ? <Text style={styles.basinDetail}>Poissons: {item.nombre}</Text> : null}
      </TouchableOpacity>
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
        ListHeaderComponent={
          <Text style={styles.totalHeader}>Total : {totalPoissons.toLocaleString('fr-FR')} poissons</Text>
        }
        data={filteredBasins}
        renderItem={renderBasinItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun bassin trouvé</Text>
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* FAB étendu : "+ Nouveau" qui se réduit à "+" au scroll */}
      <TouchableOpacity
        style={[styles.fab, fabExtended && styles.fabExtended]}
        onPress={() => {
          setEditingBasin(null);
          setIsModalVisible(true);
        }}
        accessibilityLabel="Ajouter un nouveau bassin"
      >
        <Icon name="add" size={28} color={COLORS.white} />
        {fabExtended && <Text style={styles.fabText}>Nouveau</Text>}
      </TouchableOpacity>

      {/* Modal pour ajouter / modifier un bassin */}
      <AddBasinModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingBasin(null);
        }}
        onSubmit={() => {
          setIsModalVisible(false);
          setEditingBasin(null);
        }}
        initialData={editingBasin ? mapBasinToForm(editingBasin) : undefined}
      />

      {/* Modal de détail d'un bassin */}
      <DetailModal
        visible={!!selectedBasin}
        title="Détail du bassin"
        rows={selectedBasin ? basinDetailRows(selectedBasin) : []}
        onClose={() => setSelectedBasin(null)}
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
  totalHeader: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    marginBottom: SIZES.margin,
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
    borderRadius: 28,
    minWidth: 56,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fabExtended: {
    paddingHorizontal: 20,
  },
  fabText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: SIZES.fontMedium,
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: SIZES.margin / 2,
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
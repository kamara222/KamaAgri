import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import AddLotModal from '../components/AddLotModal';
import DetailModal from '../components/DetailModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLots, useCreateLot, useUpdateLot, useDeleteLot } from '../services';

// Définir les types pour la navigation
type RootStackParamList = {
  Mortality: undefined;
  FeedTracking: undefined;
  SalesTracking: undefined;
  Error: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interface pour une race
interface Race {
  code: string;
  nom: string;
}

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string | null;
  race: Race | string | null | undefined;
  date: string;
  nombre: number;
  poids_moyen: number;
}

const ChickenManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetForm, setResetForm] = useState(false); // État pour déclencher la réinitialisation
  const [editingLot, setEditingLot] = useState<Lot | null>(null); // lot en cours de modification
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null); // lot affiché en détail
  const [fabExtended, setFabExtended] = useState(true); // FAB étendu ("+ Nouveau")
  const lastOffsetY = useRef(0);

  // Récupérer les lots via API
  const { data: lots, isLoading, error } = useLots(searchQuery ? searchQuery : undefined);

  // Mutations
  const createLotMutation = useCreateLot();
  const updateLotMutation = useUpdateLot();
  const deleteLotMutation = useDeleteLot();

  // Gérer les erreurs
  if (error) {
    Toast.show({
      type: 'errorToast',
      props: {
        message: 'Erreur lors du chargement des lots',
      },
    });
  }

  // Filtrer les lots localement (mémoïsé) avec vérification des null/undefined
  const filteredLots = useMemo(
    () =>
      (lots ?? []).filter((lot) => {
        const race = lot.race
          ? typeof lot.race === 'string'
            ? lot.race.toLowerCase()
            : (lot.race?.nom ?? '').toLowerCase()
          : '';
        const batiment =
          lot.batiment !== null && lot.batiment !== undefined
            ? String(lot.batiment).toLowerCase()
            : '';
        const q = searchQuery.toLowerCase();
        return race.includes(q) || batiment.includes(q);
      }),
    [lots, searchQuery]
  );

  // Total des poulets affichés (somme des `nombre` des lots) — cohérent avec le dashboard
  const totalPoulets = filteredLots.reduce((sum, lot) => sum + (lot.nombre || 0), 0);

  type LotForm = {
    dateArrivee: Date;
    nombrePoulets: string;
    poidsMoyen: string;
    batiment: string;
    race: string;
  };

  // Mapper un lot (API) vers le formulaire pour pré-remplir l'édition
  const mapLotToForm = (lot: Lot): LotForm => ({
    dateArrivee: lot.date ? new Date(lot.date) : new Date(),
    nombrePoulets: String(lot.nombre ?? ''),
    poidsMoyen: String(lot.poids_moyen ?? ''),
    batiment: lot.batiment || '',
    race: typeof lot.race === 'string' ? lot.race : lot.race?.code || '',
  });

  // Ouvrir le formulaire en mode édition (pré-rempli)
  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setResetForm(false);
    setIsModalVisible(true);
  };

  // Gérer la soumission du modal (création ou mise à jour)
  const handleAddLot = (form: LotForm) => {
    const lotData = {
      batiment: form.batiment,
      race: form.race,
      date: form.dateArrivee.toISOString().split('T')[0],
      nombre: parseInt(form.nombrePoulets),
      poids_moyen: parseFloat(form.poidsMoyen),
    };
    const handlers = {
      onSuccess: () => {
        Toast.show({
          type: 'successToast',
          props: { message: editingLot ? 'Lot modifié avec succès' : 'Lot ajouté avec succès' },
        });
        setIsModalVisible(false);
        setEditingLot(null);
        setResetForm(true);
      },
      onError: () => {
        Toast.show({
          type: 'errorToast',
          props: {
            message: editingLot
              ? 'Erreur lors de la modification du lot'
              : 'Erreur lors de l’ajout du lot',
          },
        });
      },
    };
    if (editingLot) {
      updateLotMutation.mutate({ id: editingLot.id, ...lotData }, handlers);
    } else {
      createLotMutation.mutate(lotData, handlers);
    }
  };

  // FAB : réduire ("+") au scroll vers le bas, étendre ("+ Nouveau") vers le haut
  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastOffsetY.current + 8 && fabExtended) setFabExtended(false);
    else if (y < lastOffsetY.current - 8 && !fabExtended) setFabExtended(true);
    lastOffsetY.current = y;
  };

  // Gérer la suppression d'un lot
  const handleDeleteLot = (lotId: string, lotRace: Race | string | null | undefined) => {
    const raceDisplay = typeof lotRace === 'string' ? lotRace : lotRace?.nom || 'Inconnu';
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer le lot ${raceDisplay} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteLotMutation.mutate(lotId, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: {
                    message: 'Lot supprimé avec succès',
                  },
                });
              },
              onError: () => {
                Toast.show({
                  type: 'errorToast',
                  props: {
                    message: 'Erreur lors de la suppression du lot',
                  },
                });
              },
            });
          },
        },
      ]
    );
  };

  // Lignes de détail d'un lot pour la modal
  const lotDetailRows = (lot: Lot) => [
    { label: 'Bâtiment', value: lot.batiment || 'Inconnu' },
    { label: 'Race', value: typeof lot.race === 'string' ? lot.race : lot.race?.nom || 'Inconnu' },
    { label: "Date d'arrivée", value: lot.date || '—' },
    { label: 'Nombre de poulets', value: `${lot.nombre ?? 0}` },
    { label: 'Poids moyen', value: `${lot.poids_moyen ?? 0} kg` },
  ];

  // Rendu de chaque carte de lot
  const renderLotItem = ({ item }: { item: Lot }) => (
    <TouchableOpacity
      style={styles.lotCard}
      activeOpacity={0.7}
      onPress={() => setSelectedLot(item)}
    >
      <View style={styles.lotHeader}>
        <Icon name="egg" size={24} color={COLORS.primary} />
        <Text style={styles.lotTitle}>
          {typeof item.race === 'string' ? item.race : item.race?.nom || 'Inconnu'}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteLot(item.id, item.race)}
            accessibilityLabel="Supprimer le lot"
          >
            <Icon name="delete" size={24} color={COLORS.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditLot(item)}
            accessibilityLabel="Modifier le lot"
          >
            <Icon name="edit" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
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
          ListHeaderComponent={
            <Text style={styles.totalHeader}>Total : {totalPoulets.toLocaleString('fr-FR')} poulets</Text>
          }
          data={filteredLots}
          renderItem={renderLotItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun lot trouvé</Text>
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      {/* FAB étendu : "+ Nouveau" qui se réduit à "+" au scroll */}
      <TouchableOpacity
        style={[styles.fab, fabExtended && styles.fabExtended]}
        onPress={() => {
          setEditingLot(null);
          setIsModalVisible(true);
          setResetForm(true);
        }}
        accessibilityLabel="Ajouter un nouveau lot"
      >
        <Icon name="add" size={28} color={COLORS.white} />
        {fabExtended && <Text style={styles.fabText}>Nouveau</Text>}
      </TouchableOpacity>

      {/* Modal pour ajouter / modifier un lot */}
      <AddLotModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingLot(null);
          setResetForm(false);
        }}
        onSubmit={handleAddLot}
        resetForm={resetForm}
        initialData={editingLot ? mapLotToForm(editingLot) : undefined}
      />

      {/* Modal de détail d'un lot */}
      <DetailModal
        visible={!!selectedLot}
        title="Détail du lot"
        rows={selectedLot ? lotDetailRows(selectedLot) : []}
        onClose={() => setSelectedLot(null)}
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
    flex: 1,
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
  deleteButton: {
    padding: 8,
  },
});

export default ChickenManagementScreen;
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useChickenSales, useFishSales, useLogout } from '../services';
import { RootStackParamList } from '../navigations/navigation';
import AnimalSelectionModal from '../components/AnimalSelectionModal';
import DetailModal from '../components/DetailModal';
import { saleDetailRows } from '../utils';

// Informations utilisateur stockées dans AsyncStorage
interface UserInfo {
  prenom: string;
  nom: string;
  role: { code: string; nom: string };
}

// Vente normalisée (poulet ou poisson) pour l'historique
interface Sale {
  id: string;
  type: 'Poulets' | 'Poissons';
  amount: number;
  date: string;
  target: string;
  raw: any; // objet vente complet (pour la modal de détail)
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mode de la modal de sélection poulet/poisson
type ModalMode = null | 'vente' | 'enregistrer';

// Filtre de l'historique
type FilterType = '' | 'Poulets' | 'Poissons';

// Filtre par période
type FilterPeriod = '' | 'today' | 'week' | 'month';

const AccueilScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { mutate: logout } = useLogout();
  const [userInitials, setUserInitials] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [filterType, setFilterType] = useState<FilterType>('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Repartir à 10 lignes quand un filtre change
  useEffect(() => {
    setVisibleCount(10);
  }, [filterType, filterPeriod]);

  const {
    data: chickenSales,
    isLoading: isChickenSalesLoading,
    isError: isChickenSalesError,
  } = useChickenSales();
  const {
    data: fishSales,
    isLoading: isFishSalesLoading,
    isError: isFishSalesError,
  } = useFishSales();

  // Récupérer les initiales de l'utilisateur pour l'avatar du header
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('userInfo');
        if (userData) {
          const user: UserInfo = JSON.parse(userData);
          const initials = `${(user.prenom ?? '?').charAt(0)}${(user.nom ?? '').charAt(0)}`.toUpperCase();
          setUserInitials(initials);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos utilisateur:', error);
      }
    };
    fetchUserInfo();
  }, []);

  // Déconnexion avec confirmation
  const handleLogout = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: () => {
            logout(
              undefined,
              {
                onSuccess: () => {
                  Toast.show({
                    type: 'successToast',
                    props: { message: 'Déconnexion réussie' },
                  });
                  navigation.replace('LoginScreen');
                },
                onError: (error: any) => {
                  Toast.show({
                    type: 'errorToast',
                    props: { message: 'Échec de la déconnexion' },
                  });
                  console.error('Erreur de déconnexion:', error);
                },
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Header : avatar (→ Profil) à gauche, déconnexion à droite
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerInitialsContainer}
          onPress={() => navigation.navigate('ProfileScreen')}
          accessibilityLabel="Voir le profil"
        >
          <Text style={styles.headerInitials}>{userInitials || '??'}</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={handleLogout}
          accessibilityLabel="Se déconnecter"
        >
          <Icon name="logout" size={24} color={COLORS.white} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userInitials]);

  // Combiner et normaliser les ventes poulets + poissons
  const sales = useMemo<Sale[]>(() => {
    const salesData: Sale[] = [];
    if (chickenSales) {
      salesData.push(
        ...chickenSales.map((sale) => ({
          id: sale.id,
          type: 'Poulets' as const,
          amount: sale.prix_total,
          date: sale.date,
          target: sale.batiment || 'Lot inconnu',
          raw: sale,
        }))
      );
    }
    if (fishSales) {
      salesData.push(
        ...fishSales.map((sale) => ({
          id: sale.id,
          type: 'Poissons' as const,
          amount: sale.prix_total,
          date: sale.date,
          target: sale.bassin || 'Bassin inconnu',
          raw: sale,
        }))
      );
    }
    // Tri du plus récent au plus ancien
    return salesData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [chickenSales, fishSales]);

  const filteredSales = useMemo(() => {
    // Bornes de période calculées à partir de maintenant
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(startOfToday);
    oneWeekAgo.setDate(startOfToday.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales.filter((sale) => {
      const matchesType = !filterType || sale.type === filterType;
      if (!matchesType) return false;

      if (!filterPeriod) return true;
      const saleDate = new Date(sale.date);
      if (filterPeriod === 'today') return saleDate >= startOfToday;
      if (filterPeriod === 'week') return saleDate >= oneWeekAgo;
      if (filterPeriod === 'month') return saleDate >= startOfMonth;
      return true;
    });
  }, [sales, filterType, filterPeriod]);

  // Sélection poulet/poisson selon le portail ouvert
  const handleSelect = (animal: 'chicken' | 'fish') => {
    const mode = modalMode;
    setModalMode(null);
    if (mode === 'vente') {
      navigation.navigate(animal === 'chicken' ? 'SalesTracking' : 'FishSalesTracking');
    } else if (mode === 'enregistrer') {
      navigation.navigate(animal === 'chicken' ? 'ChickenManagement' : 'FishManagement');
    }
  };

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'Tous', value: '' },
    { label: 'Poulets', value: 'Poulets' },
    { label: 'Poissons', value: 'Poissons' },
  ];

  const periodOptions: { label: string; value: FilterPeriod }[] = [
    { label: 'Tout', value: '' },
    { label: "Aujourd'hui", value: 'today' },
    { label: '7 jours', value: 'week' },
    { label: 'Ce mois', value: 'month' },
  ];

  const renderSaleItem = ({ item, index }: { item: Sale; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={(index % 10) * 50}
      style={styles.saleCard}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedSale(item.raw)}
        accessibilityLabel="Voir le détail de la vente"
      >
        <View style={styles.cardHeader}>
          <Icon
            name={item.type === 'Poulets' ? 'egg' : 'waves'}
            size={24}
            color={COLORS.accent}
          />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>
              {item.type} - {item.target}
            </Text>
            <Text style={styles.cardDetail}>
              Montant: {(item.amount ?? 0).toLocaleString('fr-FR')} XAF
            </Text>
            <Text style={styles.cardDetail}>
              Date: {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Bloc fixe : portails + tableau de bord + titre + filtres */}
      <View style={styles.fixedHeader}>
        {/* Portails d'action : Vente et Gestion */}
        <View style={styles.portalsRow}>
          <Animatable.View animation="fadeInLeft" duration={600} style={styles.portalWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setModalMode('vente')}
              accessibilityLabel="Vente"
              accessibilityHint="Choisir poulets ou poissons pour enregistrer une vente"
            >
              <LinearGradient
                colors={[COLORS.success, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.portalCard}
              >
                <Icon name="shopping-cart" size={40} color={COLORS.white} />
                <Text style={styles.portalText}>Vente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" duration={600} style={styles.portalWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setModalMode('enregistrer')}
              accessibilityLabel="Gestion"
              accessibilityHint="Choisir poulets ou poissons à gérer"
            >
              <LinearGradient
                colors={[COLORS.accent, '#01579B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.portalCard}
              >
                <Icon name="tune" size={40} color={COLORS.white} />
                <Text style={styles.portalText}>Gestion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Accès au tableau de bord (HomeScreen) */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Tableau de bord"
          accessibilityHint="Ouvre le tableau de bord"
        >
          <Icon name="dashboard" size={24} color={COLORS.success} />
          <Text style={styles.dashboardButtonText}>Tableau de bord</Text>
        </TouchableOpacity>

        {/* Historique des ventes + filtre */}
        <Text style={styles.sectionTitle}>Historique des Ventes</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map((option) => {
            const active = filterType === option.value;
            return (
              <TouchableOpacity
                key={option.label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilterType(option.value)}
                accessibilityLabel={`Filtrer: ${option.label}`}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {periodOptions.map((option) => {
            const active = filterPeriod === option.value;
            return (
              <TouchableOpacity
                key={option.label}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilterPeriod(option.value)}
                accessibilityLabel={`Période: ${option.label}`}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Liste des ventes : scroll SOUS le filtre + pagination 10 par 10 */}
      {isChickenSalesLoading || isFishSalesLoading ? (
        <Text style={styles.loadingText}>Chargement des ventes...</Text>
      ) : isChickenSalesError || isFishSalesError ? (
        <Text style={styles.errorText}>Erreur lors du chargement des ventes.</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredSales.slice(0, visibleCount)}
          renderItem={renderSaleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune vente disponible</Text>
          }
          onEndReached={() => setVisibleCount((c) => c + 10)}
          onEndReachedThreshold={0.4}
        />
      )}

      {/* Modal de sélection partagée par les deux portails */}
      <AnimalSelectionModal
        visible={modalMode !== null}
        title={
          modalMode === 'vente'
            ? 'Que souhaitez-vous vendre ?'
            : 'Que souhaitez-vous gérer ?'
        }
        onSelect={handleSelect}
        onClose={() => setModalMode(null)}
      />

      {/* Modal de détail d'une vente */}
      <DetailModal
        visible={!!selectedSale}
        title="Détail de la vente"
        rows={selectedSale ? saleDetailRows(selectedSale) : []}
        onClose={() => setSelectedSale(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedHeader: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  // Header
  headerInitialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.padding,
  },
  headerInitials: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerIconContainer: {
    marginRight: SIZES.padding,
  },
  // Portails
  portalsRow: {
    flexDirection: 'row',
    gap: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  portalWrapper: {
    flex: 1,
  },
  portalCard: {
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  portalText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: SIZES.margin / 2,
  },
  // Bouton tableau de bord
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.success,
    marginBottom: SIZES.margin,
  },
  dashboardButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    marginLeft: SIZES.margin / 2,
  },
  // Historique
  sectionTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginVertical: SIZES.margin / 2,
  },
  filterRow: {
    alignItems: 'center',
    paddingRight: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  filterChip: {
    paddingVertical: SIZES.padding / 2,
    paddingHorizontal: SIZES.padding,
    marginRight: SIZES.margin / 2,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  filterChipText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  saleCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: SIZES.margin,
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  cardDetail: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  emptyText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
});

export default AccueilScreen;

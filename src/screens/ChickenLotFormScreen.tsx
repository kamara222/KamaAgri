// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const ChickenLotFormScreen = () => {
//   return (
//     <View>
//       <Text>ChickenLotFormScreen</Text>
//     </View>
//   )
// }

// export default ChickenLotFormScreen

// const styles = StyleSheet.create({})

// Importations
import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigations/navigation';
import { theme } from '../styles/theme';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import Card from '../components/Card';

// TypeScript : Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'ChickenLotList'>;

// Données statiques pour simuler les lots (à remplacer par API)
const mockLots = [
  {
    id: '1',
    dateArrivee: '2025-05-01',
    nombrePoulets: 500,
    poidsMoyen: 1.5,
    batiment: 'Bâtiment A',
    race: 'Ross 308',
  },
  {
    id: '2',
    dateArrivee: '2025-04-15',
    nombrePoulets: 300,
    poidsMoyen: 1.7,
    batiment: 'Bâtiment B',
    race: 'Cobb 500',
  },
];

// Composant de la liste des lots
const ChickenLotListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = React.useState('');
  const [batimentFilter, setBatimentFilter] = React.useState('');
  const [page, setPage] = React.useState(1);

  // Options pour le filtre des bâtiments
  const batimentOptions = [
    { label: 'Tous', value: '' },
    { label: 'Bâtiment A', value: 'Bâtiment A' },
    { label: 'Bâtiment B', value: 'Bâtiment B' },
  ];

  // Filtrage des lots
  const filteredLots = mockLots.filter(
    (lot) =>
      lot.race.toLowerCase().includes(search.toLowerCase()) &&
      (batimentFilter === '' || lot.batiment === batimentFilter)
  );

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Lots de Poulets</Text>
        <Text style={styles.headerSubtitle}>Gérez vos lots de poulets</Text>
      </LinearGradient>

      {/* Contenu principal */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Filtres */}
        <View style={styles.filterSection}>
          <Input
            label="Rechercher par race"
            value={search}
            onChangeText={setSearch}
            placeholder="Ex. : Ross 308"
          />
          <Dropdown
            label="Filtrer par bâtiment"
            value={batimentFilter}
            onValueChange={setBatimentFilter}
            items={batimentOptions}
          />
        </View>

        {/* Liste des lots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lots</Text>
          {filteredLots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              onPress={() =>
                navigation.navigate('ChickenLotForm', { lotId: lot.id })
              }
            >
              <Card
                title={`Lot ${lot.id}`}
                value={`${lot.nombrePoulets} poulets`}
                subtitle={`Race: ${lot.race} | Arrivée: ${lot.dateArrivee}`}
                iconName="egg"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <Button
            title="Précédent"
            onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          />
          <Text style={styles.pageText}>Page {page}</Text>
          <Button
            title="Suivant"
            onPress={() => setPage((prev) => prev + 1)}
            disabled={filteredLots.length === 0}
          />
        </View>

        {/* Bouton Ajouter */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ChickenLotForm')}
        >
          <MaterialIcons
            name="add"
            size={theme.iconSizes.large}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xlarge,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  pageText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.sm,
    elevation: 5,
  },
});

export default ChickenLotListScreen;
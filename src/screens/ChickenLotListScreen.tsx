// Importations
import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DatePicker from 'react-native-date-picker';
import { RootStackParamList } from '../navigations/navigation';
import { theme } from '../styles/theme';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';

// TypeScript : Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'ChickenLotForm'>;

// Interface pour les données du formulaire
interface FormData {
  dateArrivee: Date;
  nombrePoulets: string;
  poidsMoyen: string;
  batiment: string;
  race: string;
}

// Composant du formulaire
const ChickenLotFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const lotId = route.params?.lotId;

  // État du formulaire
  const [formData, setFormData] = React.useState<FormData>({
    dateArrivee: new Date(),
    nombrePoulets: '',
    poidsMoyen: '',
    batiment: '',
    race: '',
  });
  const [errors, setErrors] = React.useState<Partial<FormData>>({});
  const [openDatePicker, setOpenDatePicker] = React.useState(false);

  // Options pour le dropdown des bâtiments
  const batimentOptions = [
    { label: 'Bâtiment A', value: 'Bâtiment A' },
    { label: 'Bâtiment B', value: 'Bâtiment B' },
  ];

  // Simuler le pré-remplissage pour la modification
  React.useEffect(() => {
    if (lotId) {
      // Exemple : Récupérer les données du lot (à remplacer par API)
      setFormData({
        dateArrivee: new Date('2025-05-01'),
        nombrePoulets: '500',
        poidsMoyen: '1.5',
        batiment: 'Bâtiment A',
        race: 'Ross 308',
      });
    }
  }, [lotId]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.nombrePoulets || parseInt(formData.nombrePoulets) <= 0) {
      newErrors.nombrePoulets = 'Nombre de poulets doit être positif';
    }
    if (!formData.poidsMoyen || parseFloat(formData.poidsMoyen) <= 0) {
      newErrors.poidsMoyen = 'Poids moyen doit être positif';
    }
    if (!formData.batiment) {
      newErrors.batiment = 'Sélectionnez un bâtiment';
    }
    if (!formData.race) {
      newErrors.race = 'Entrez une race';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Formulaire soumis :', formData);
      // Appeler l’API ici (à implémenter par le backend)
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {lotId ? 'Modifier Lot' : 'Ajouter Lot'}
        </Text>
        <Text style={styles.headerSubtitle}>Remplissez les informations du lot</Text>
      </LinearGradient>

      {/* Contenu principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Date d’arrivée"
          value={formData.dateArrivee.toLocaleDateString()}
          onChangeText={() => setOpenDatePicker(true)}
          placeholder="Sélectionnez une date"
        />
        <DatePicker
          modal
          open={openDatePicker}
          date={formData.dateArrivee}
          onConfirm={(date) => {
            setOpenDatePicker(false);
            setFormData({ ...formData, dateArrivee: date });
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
        <Input
          label="Nombre de poulets"
          value={formData.nombrePoulets}
          onChangeText={(text) => setFormData({ ...formData, nombrePoulets: text })}
          keyboardType="numeric"
          placeholder="Ex. : 500"
          error={errors.nombrePoulets}
        />
        <Input
          label="Poids moyen initial (kg)"
          value={formData.poidsMoyen}
          onChangeText={(text) => setFormData({ ...formData, poidsMoyen: text })}
          keyboardType="decimal-pad"
          placeholder="Ex. : 1.5"
          error={errors.poidsMoyen}
        />
        <Dropdown
          label="Type de bâtiment"
          value={formData.batiment}
          onValueChange={(value) => setFormData({ ...formData, batiment: value })}
          items={batimentOptions}
          error={errors.batiment}
        />
        <Input
          label="Race/Variété"
          value={formData.race}
          onChangeText={(text) => setFormData({ ...formData, race: text })}
          placeholder="Ex. : Ross 308"
          error={errors.race}
        />
        <Button title="Enregistrer" onPress={handleSubmit} />
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
});

export default ChickenLotFormScreen;
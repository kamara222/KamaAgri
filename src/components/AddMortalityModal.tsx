import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from './CustomSelect';
import { useRaces } from '../services';

// Types pour le formulaire
interface MortalityForm {
  date: Date;
  batiment: string;
  race: string;
  nombreMorts: string;
  cause: string;
}

interface AddMortalityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (mortality: MortalityForm) => void;
  resetForm: boolean;
}

const AddMortalityModal: React.FC<AddMortalityModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  resetForm,
}) => {
  // État du formulaire
  const [form, setForm] = useState<MortalityForm>({
    date: new Date(),
    batiment: '',
    race: '',
    nombreMorts: '',
    cause: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Réinitialiser le formulaire lorsque resetForm est true
  useEffect(() => {
    if (isVisible && resetForm) {
      setForm({
        date: new Date(),
        batiment: '',
        race: '',
        nombreMorts: '',
        cause: '',
      });
      setErrors({});
      setShowDatePicker(false);
    }
  }, [isVisible, resetForm]);

  // Récupérer les races via API
  const { data: races, isLoading: racesLoading, error: racesError } = useRaces();

  // Fallback statique si API vide ou erreur
  const fallbackRaces = [
    { code: 'ross_308', nom: 'Ross 308' },
    { code: 'cobb_500', nom: 'Cobb 500' },
    { code: 'poulets_africains', nom: 'Poulets africains' },
    { code: 'pondeuses', nom: 'Pondeuses' },
  ];

  // Options des races
  const raceOptions = (races && races.length > 0
    ? [
        { key: 'default', label: 'Sélectionner une race', value: '' },
        ...races.map((race: { code: string; nom: string }, index: number) => ({
          key: race.code || `race-${index}`,
          label: race.nom,
          value: race.code,
        })),
      ]
    : [
        { key: 'default', label: 'Sélectionner une race', value: '' },
        ...fallbackRaces.map((race, index) => ({
          key: race.code || `fallback-${index}`,
          label: race.nom,
          value: race.code,
        })),
      ]) || [{ key: 'loading', label: 'Chargement...', value: '' }];

  // Feedback si fallback utilisé
  useEffect(() => {
    if (isVisible && (!races || races.length === 0 || racesError)) {
      console.warn('Aucune race disponible depuis l\'API. Utilisation du fallback statique.');
      Toast.show({
        type: 'info',
        text1: 'Information',
        text2: 'Aucune race chargée depuis le serveur. Utilisation de races par défaut.',
      });
    } else if (isVisible && races) {
      console.log('Races chargées:', races);
      console.log('Options générées:', raceOptions);
    }
  }, [isVisible, races, racesError]);

  // Options pour les bâtiments
  const batiments = [
    { key: 'default-bat', label: 'Sélectionner un bâtiment', value: '' },
    { key: 'a', label: 'Bâtiment A', value: 'Bâtiment A' },
    { key: 'b', label: 'Bâtiment B', value: 'Bâtiment B' },
    { key: 'c', label: 'Bâtiment C', value: 'Bâtiment C' },
  ];

  // Log pour déboguer les options de bâtiments
  useEffect(() => {
    if (isVisible) {
      console.log('Options des bâtiments dans le modal:', batiments);
    }
  }, [isVisible]);

  // Options pour les causes
  const causes = [
    { key: 'default', label: 'Sélectionner une cause', value: '' },
    { key: 'maladie', label: 'Maladie', value: 'Maladie' },
    { key: 'chaleur', label: 'Chaleur excessive', value: 'Chaleur excessive' },
    { key: 'predation', label: 'Prédation', value: 'Prédation' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = 'Date requise';
    if (!form.batiment) newErrors.batiment = 'Bâtiment requis';
    if (!form.race) newErrors.race = 'Race requise';
    if (!form.nombreMorts || parseInt(form.nombreMorts) <= 0)
      newErrors.nombreMorts = 'Nombre positif requis';
    if (!form.cause) newErrors.cause = 'Cause requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Formulaire soumis:', form);
      onSubmit(form);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View
            animation="slideInUp"
            duration={300}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            {/* En-tête du modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter Mortalité</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[styles.input, errors.date && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {form.date.toLocaleDateString('fr-FR')}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setForm({ ...form, date: date });
                      setErrors({ ...errors, date: '' });
                    }
                  }}
                  textColor={COLORS.text}
                  accentColor={COLORS.secondary}
                  themeVariant="light"
                />
              )}
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            {/* Champ Bâtiment */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bâtiment *</Text>
              <CustomSelect
                options={batiments}
                value={form.batiment}
                onChange={(value) => {
                  setForm({ ...form, batiment: value });
                  setErrors({ ...errors, batiment: '' });
                }}
                placeholder="Sélectionner un bâtiment"
                error={errors.batiment}
              />
            </View>

            {/* Champ Race */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Race *</Text>
              <CustomSelect
                options={raceOptions}
                value={form.race}
                onChange={(value) => {
                  console.log('Race sélectionnée:', value);
                  setForm({ ...form, race: value });
                  setErrors({ ...errors, race: '' });
                }}
                placeholder="Sélectionner une race"
                error={errors.race}
                disabled={racesLoading}
              />
            </View>

            {/* Champ Nombre de morts */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de morts *</Text>
              <TextInput
                style={[styles.input, errors.nombreMorts && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombreMorts}
                onChangeText={(text) => {
                  setForm({ ...form, nombreMorts: text });
                  setErrors({ ...errors, nombreMorts: '' });
                }}
                placeholder="Ex: 10"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombreMorts && (
                <Text style={styles.errorText}>{errors.nombreMorts}</Text>
              )}
            </View>

            {/* Champ Cause */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cause *</Text>
              <CustomSelect
                options={causes}
                value={form.cause}
                onChange={(value) => {
                  setForm({ ...form, cause: value });
                  setErrors({ ...errors, cause: '' });
                }}
                placeholder="Sélectionner une cause"
                error={errors.cause}
              />
            </View>

            {/* Bouton de soumission */}
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <View style={styles.submitGradient}>
                  <Text style={styles.submitButtonText}>Ajouter</Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  keyboardAvoidingView: {
    // flex: 1,
  },
  scrollContainer: {
    // flexGrow: 1,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding,
    minHeight: '50%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.textLight,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: SIZES.margin,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  modalTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: 4,
  },
  submitButton: {
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin,
  },
  submitGradient: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default AddMortalityModal;
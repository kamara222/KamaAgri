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
interface LotForm {
  dateArrivee: Date;
  nombrePoulets: string;
  poidsMoyen: string;
  batiment: string;
  race: string;
}

interface AddLotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (lot: LotForm) => void;
  resetForm: boolean;
  initialData?: LotForm;
}

const AddLotModal: React.FC<AddLotModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  resetForm,
  initialData,
}) => {
  // État du formulaire
  const [form, setForm] = useState<LotForm>(
    initialData || {
      dateArrivee: new Date(),
      nombrePoulets: '',
      poidsMoyen: '',
      batiment: '',
      race: '',
    }
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Réinitialiser le formulaire lorsque resetForm est true
  useEffect(() => {
    if (isVisible && resetForm) {
      setForm({
        dateArrivee: new Date(),
        nombrePoulets: '',
        poidsMoyen: '',
        batiment: '',
        race: '',
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

  // Gérer le changement de race
  const handleRaceChange = (value: string) => {
    setForm({ ...form, race: value });
    setErrors({ ...errors, race: '' });
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.dateArrivee) newErrors.dateArrivee = 'Date requise';
    if (!form.nombrePoulets || parseInt(form.nombrePoulets) <= 0)
      newErrors.nombrePoulets = 'Nombre positif requis';
    if (!form.poidsMoyen || parseFloat(form.poidsMoyen) <= 0)
      newErrors.poidsMoyen = 'Poids positif requis';
    if (!form.batiment) newErrors.batiment = 'Bâtiment requis';
    if (!form.race) newErrors.race = 'Race requise';
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

  // Options pour les bâtiments
  const batiments = [
    { key: 'default-bat', label: 'Sélectionner un bâtiment', value: '' },
    { key: 'a', label: 'Bâtiment A', value: 'Bâtiment A' },
    { key: 'b', label: 'Bâtiment B', value: 'Bâtiment B' },
    { key: 'c', label: 'Bâtiment C', value: 'Bâtiment C' },
  ];

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
              <Text style={styles.modalTitle}>
                {initialData ? 'Modifier Lot' : 'Ajouter Lot'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Date d’arrivée */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date d’arrivée *</Text>
              <TouchableOpacity
                style={[styles.input, errors.dateArrivee && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {form.dateArrivee.toLocaleDateString('fr-FR')}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.dateArrivee}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setForm({ ...form, dateArrivee: date });
                      setErrors({ ...errors, dateArrivee: '' });
                    }
                  }}
                  textColor={COLORS.text}
                  accentColor={COLORS.secondary}
                  themeVariant="light"
                />
              )}
              {errors.dateArrivee && (
                <Text style={styles.errorText}>{errors.dateArrivee}</Text>
              )}
            </View>

            {/* Champ Nombre de poulets */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de poulets *</Text>
              <TextInput
                style={[styles.input, errors.nombrePoulets && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombrePoulets}
                onChangeText={(text) => {
                  setForm({ ...form, nombrePoulets: text });
                  setErrors({ ...errors, nombrePoulets: '' });
                }}
                placeholder="Ex: 500"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombrePoulets && (
                <Text style={styles.errorText}>{errors.nombrePoulets}</Text>
              )}
            </View>

            {/* Champ Poids moyen */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Poids moyen initial (kg) *</Text>
              <TextInput
                style={[styles.input, errors.poidsMoyen && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.poidsMoyen}
                onChangeText={(text) => {
                  setForm({ ...form, poidsMoyen: text });
                  setErrors({ ...errors, poidsMoyen: '' });
                }}
                placeholder="Ex: 1.5"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.poidsMoyen && (
                <Text style={styles.errorText}>{errors.poidsMoyen}</Text>
              )}
            </View>

            {/* Champ Type de bâtiment */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type de bâtiment *</Text>
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

            {/* Champ Race/Variété */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Race / Variété *</Text>
              <CustomSelect
                options={raceOptions}
                value={form.race}
                onChange={handleRaceChange}
                placeholder="Sélectionner une race"
                error={errors.race}
                disabled={racesLoading}
              />
            </View>

            {/* Bouton de soumission */}
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <View style={styles.submitGradient}>
                  <Text style={styles.submitButtonText}>
                    {initialData ? 'Modifier' : 'Ajouter'}
                  </Text>
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
    marginBottom: 8,
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

export default AddLotModal;
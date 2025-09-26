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
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from './CustomSelect';

// Types pour le formulaire
interface FeedDistributionForm {
  date: Date;
  batiment: string;
  typeAliment: string;
  quantite: string;
}

interface AddFeedDistributionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (distribution: FeedDistributionForm) => void;
  batiments: { label: string; value: string }[]; // Options dynamiques
  resetForm?: boolean;
}

const AddFeedDistributionModal: React.FC<AddFeedDistributionModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  batiments,
  resetForm,
}) => {
  // État du formulaire
  const [form, setForm] = useState<FeedDistributionForm>({
    date: new Date(),
    batiment: '',
    typeAliment: '',
    quantite: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Réinitialiser le formulaire lorsque resetForm est true
  useEffect(() => {
    if (isVisible && resetForm) {
      setForm({
        date: new Date(),
        batiment: '',
        typeAliment: '',
        quantite: '',
      });
      setErrors({});
      setShowDatePicker(false);
    }
  }, [isVisible, resetForm]);

  // Options pour les types d'aliments
  const typesAliment = [
    { key: 'default', label: 'Sélectionner un type', value: '' },
    { key: 'demarrage', label: 'Granulés démarrage', value: 'Granulés démarrage' },
    { key: 'croissance', label: 'Granulés croissance', value: 'Granulés croissance' },
    { key: 'finition', label: 'Granulés finition', value: 'Granulés finition' },
  ];

  // Log pour déboguer les options de bâtiments
  useEffect(() => {
    if (isVisible) {
      console.log('Options des bâtiments dans le modal:', batiments);
    }
  }, [isVisible, batiments]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = 'Date requise';
    if (!form.batiment) newErrors.batiment = 'Bâtiment requis';
    if (!form.typeAliment) newErrors.typeAliment = 'Type d’aliment requis';
    if (!form.quantite || parseFloat(form.quantite) <= 0)
      newErrors.quantite = 'Quantité positive requise';
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
              <Text style={styles.modalTitle}>Ajouter Distribution</Text>
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
                      setForm({ ...form, date });
                      setErrors({ ...errors, date: '' });
                    }
                  }}
                  textColor={COLORS.text}
                  accentColor={COLORS.accent}
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
                  console.log('Bâtiment sélectionné:', value);
                  setForm({ ...form, batiment: value });
                  setErrors({ ...errors, batiment: '' });
                }}
                placeholder="Sélectionner un bâtiment"
                error={errors.batiment}
              />
            </View>

            {/* Champ Type d’aliment */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type d’aliment *</Text>
              <CustomSelect
                options={typesAliment}
                value={form.typeAliment}
                onChange={(value) => {
                  setForm({ ...form, typeAliment: value });
                  setErrors({ ...errors, typeAliment: '' });
                }}
                placeholder="Sélectionner un type"
                error={errors.typeAliment}
              />
            </View>

            {/* Champ Quantité */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantité (kg) *</Text>
              <TextInput
                style={[styles.input, errors.quantite && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.quantite}
                onChangeText={(text) => {
                  setForm({ ...form, quantite: text });
                  setErrors({ ...errors, quantite: '' });
                }}
                placeholder="Ex: 100"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.quantite && (
                <Text style={styles.errorText}>{errors.quantite}</Text>
              )}
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
    minHeight: '40%',
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
    backgroundColor: COLORS.accent,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default AddFeedDistributionModal;
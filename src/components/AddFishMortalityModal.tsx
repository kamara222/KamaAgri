// src/components/AddFishMortalityModal.tsx
import React, { useState } from 'react';
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
interface MortalityForm {
  date: Date;
  bassin: string;
  nombreMorts: string;
  cause: string;
  causeDetails?: string;
}

interface AddFishMortalityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (mortality: MortalityForm) => void;
}

const AddFishMortalityModal: React.FC<AddFishMortalityModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<MortalityForm>({
    date: new Date(),
    bassin: '',
    nombreMorts: '',
    cause: '',
    causeDetails: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Options pour les dropdowns (mockées, à remplacer par API)
  const bassins = [
    { label: 'Sélectionner un bassin', value: '' },
    { label: 'Bassin Nord', value: 'Bassin Nord' },
    { label: 'Bassin Sud', value: 'Bassin Sud' },
  ];
  const causes = [
    { label: 'Sélectionner une cause', value: '' },
    { label: 'Maladie', value: 'Maladie' },
    { label: 'Qualité eau', value: 'Qualité eau' },
    { label: 'Autre', value: 'Autre' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = 'Date requise';
    if (!form.bassin) newErrors.bassin = 'Bassin requis';
    if (!form.nombreMorts || parseInt(form.nombreMorts) <= 0)
      newErrors.nombreMorts = 'Nombre positif requis';
    if (!form.cause) newErrors.cause = 'Cause requise';
    if (form.cause === 'Autre' && !form.causeDetails)
      newErrors.causeDetails = 'Détails requis pour Autre';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
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

            {/* Champ Bassin */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bassin concerné *</Text>
              <CustomSelect
                options={bassins}
                value={form.bassin}
                onChange={(value) => {
                  setForm({ ...form, bassin: value });
                  setErrors({ ...errors, bassin: '' });
                }}
                placeholder="Sélectionner un bassin"
                error={errors.bassin}
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
                  setForm({ ...form, cause: value, causeDetails: '' });
                  setErrors({ ...errors, cause: '', causeDetails: '' });
                }}
                placeholder="Sélectionner une cause"
                error={errors.cause}
              />
            </View>

            {/* Champ Détails pour Autre */}
            {form.cause === 'Autre' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Détails de la cause *</Text>
                <TextInput
                  style={[styles.input, errors.causeDetails && styles.inputError]}
                  value={form.causeDetails}
                  onChangeText={(text) => {
                    setForm({ ...form, causeDetails: text });
                    setErrors({ ...errors, causeDetails: '' });
                  }}
                  placeholder="Décrivez la cause"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                />
                {errors.causeDetails && (
                  <Text style={styles.errorText}>{errors.causeDetails}</Text>
                )}
              </View>
            )}

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
    backgroundColor: COLORS.accent, // Remplacement temporaire pour LinearGradient
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default AddFishMortalityModal;
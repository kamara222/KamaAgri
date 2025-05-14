// src/components/AddWeightMeasurementModal.tsx
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
interface WeightMeasurementForm {
  date: Date;
  lot: string;
  poidsMoyen: string;
  echantillon: string;
}

interface AddWeightMeasurementModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (measurement: WeightMeasurementForm) => void;
}

const AddWeightMeasurementModal: React.FC<AddWeightMeasurementModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<WeightMeasurementForm>({
    date: new Date(),
    lot: '',
    poidsMoyen: '',
    echantillon: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Options pour les dropdowns (mockées, à remplacer par API)
  const lots = [
    { label: 'Sélectionner un lot', value: '' },
    { label: 'Ross 308 - Bâtiment A', value: 'Ross 308 - Bâtiment A' },
    { label: 'Cobb 500 - Bâtiment B', value: 'Cobb 500 - Bâtiment B' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = 'Date requise';
    if (!form.lot) newErrors.lot = 'Lot requis';
    if (!form.poidsMoyen || parseFloat(form.poidsMoyen) <= 0)
      newErrors.poidsMoyen = 'Poids positif requis';
    if (!form.echantillon || parseInt(form.echantillon) <= 0)
      newErrors.echantillon = 'Échantillon positif requis';
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
              <Text style={styles.modalTitle}>Ajouter Mesure de Poids</Text>
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

            {/* Champ Lot */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lot concerné *</Text>
              <CustomSelect
                options={lots}
                value={form.lot}
                onChange={(value) => {
                  setForm({ ...form, lot: value });
                  setErrors({ ...errors, lot: '' });
                }}
                placeholder="Sélectionner un lot"
                error={errors.lot}
              />
            </View>

            {/* Champ Poids moyen */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Poids moyen (kg) *</Text>
              <TextInput
                style={[styles.input, errors.poidsMoyen && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.poidsMoyen}
                onChangeText={(text) => {
                  setForm({ ...form, poidsMoyen: text });
                  setErrors({ ...errors, poidsMoyen: '' });
                }}
                placeholder="Ex: 1.8"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.poidsMoyen && (
                <Text style={styles.errorText}>{errors.poidsMoyen}</Text>
              )}
            </View>

            {/* Champ Échantillon */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de poulets échantillonnés *</Text>
              <TextInput
                style={[styles.input, errors.echantillon && styles.inputError]}
                keyboardType="number-pad"
                value={form.echantillon}
                onChangeText={(text) => {
                  setForm({ ...form, echantillon: text });
                  setErrors({ ...errors, echantillon: '' });
                }}
                placeholder="Ex: 50"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.echantillon && (
                <Text style={styles.errorText}>{errors.echantillon}</Text>
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
    backgroundColor: COLORS.accent, // Remplacement temporaire pour LinearGradient
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default AddWeightMeasurementModal;
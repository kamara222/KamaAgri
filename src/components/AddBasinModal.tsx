// src/components/AddBasinModal.tsx
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
interface BasinForm {
  nom: string;
  espece: string;
  dateMiseEnEau: Date;
  nombrePoissons: string;
  volume: string;
}

interface AddBasinModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (basin: BasinForm) => void;
}

const AddBasinModal: React.FC<AddBasinModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<BasinForm>({
    nom: '',
    espece: '',
    dateMiseEnEau: new Date(),
    nombrePoissons: '',
    volume: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Options pour le dropdown des espèces (mockées, à remplacer par API)
  const especes = [
    { label: 'Sélectionner une espèce', value: '' },
    { label: 'Tilapia', value: 'Tilapia' },
    { label: 'Carpe', value: 'Carpe' },
    { label: 'Silure', value: 'Silure' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.nom) newErrors.nom = 'Nom requis';
    if (!form.espece) newErrors.espece = 'Espèce requise';
    if (!form.dateMiseEnEau) newErrors.dateMiseEnEau = 'Date requise';
    if (!form.nombrePoissons || parseInt(form.nombrePoissons) <= 0)
      newErrors.nombrePoissons = 'Nombre positif requis';
    if (!form.volume || parseFloat(form.volume) <= 0)
      newErrors.volume = 'Volume positif requis';
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
              <Text style={styles.modalTitle}>Ajouter Bassin</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Nom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom du bassin *</Text>
              <TextInput
                style={[styles.input, errors.nom && styles.inputError]}
                value={form.nom}
                onChangeText={(text) => {
                  setForm({ ...form, nom: text });
                  setErrors({ ...errors, nom: '' });
                }}
                placeholder="Ex: Bassin Nord"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
            </View>

            {/* Champ Espèce */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Espèce *</Text>
              <CustomSelect
                options={especes}
                value={form.espece}
                onChange={(value) => {
                  setForm({ ...form, espece: value });
                  setErrors({ ...errors, espece: '' });
                }}
                placeholder="Sélectionner une espèce"
                error={errors.espece}
              />
            </View>

            {/* Champ Date mise en eau */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date mise en eau *</Text>
              <TouchableOpacity
                style={[styles.input, errors.dateMiseEnEau && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {form.dateMiseEnEau.toLocaleDateString('fr-FR')}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.dateMiseEnEau}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setForm({ ...form, dateMiseEnEau: date });
                      setErrors({ ...errors, dateMiseEnEau: '' });
                    }
                  }}
                  textColor={COLORS.text}
                  accentColor={COLORS.accent}
                  themeVariant="light"
                />
              )}
              {errors.dateMiseEnEau && (
                <Text style={styles.errorText}>{errors.dateMiseEnEau}</Text>
              )}
            </View>

            {/* Champ Nombre de poissons */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de poissons *</Text>
              <TextInput
                style={[styles.input, errors.nombrePoissons && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombrePoissons}
                onChangeText={(text) => {
                  setForm({ ...form, nombrePoissons: text });
                  setErrors({ ...errors, nombrePoissons: '' });
                }}
                placeholder="Ex: 1000"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombrePoissons && (
                <Text style={styles.errorText}>{errors.nombrePoissons}</Text>
              )}
            </View>

            {/* Champ Volume */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Volume (m³) *</Text>
              <TextInput
                style={[styles.input, errors.volume && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.volume}
                onChangeText={(text) => {
                  setForm({ ...form, volume: text });
                  setErrors({ ...errors, volume: '' });
                }}
                placeholder="Ex: 50"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.volume && (
                <Text style={styles.errorText}>{errors.volume}</Text>
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

export default AddBasinModal;
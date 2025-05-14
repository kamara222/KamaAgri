// src/components/AddStockModal.tsx
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
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from './CustomSelect';

// Types pour le formulaire
interface StockForm {
  nom: string;
  type: string;
  quantite: string;
  seuilCritique: string;
}

interface AddStockModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (stock: StockForm) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<StockForm>({
    nom: '',
    type: '',
    quantite: '',
    seuilCritique: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Options pour le dropdown
  const types = [
    { label: 'Sélectionner un type', value: '' },
    { label: 'Aliment', value: 'Aliment' },
    { label: 'Médicament', value: 'Médicament' },
    { label: 'Autre', value: 'Autre' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.nom.trim()) newErrors.nom = 'Nom requis';
    if (!form.type) newErrors.type = 'Type requis';
    if (!form.quantite || parseFloat(form.quantite) <= 0)
      newErrors.quantite = 'Quantité positive requise';
    if (!form.seuilCritique || parseFloat(form.seuilCritique) <= 0)
      newErrors.seuilCritique = 'Seuil positif requis';
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
              <Text style={styles.modalTitle}>Ajouter Article</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Nom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom de l’article *</Text>
              <TextInput
                style={[styles.input, errors.nom && styles.inputError]}
                value={form.nom}
                onChangeText={(text) => {
                  setForm({ ...form, nom: text });
                  setErrors({ ...errors, nom: '' });
                }}
                placeholder="Ex: Granulés poisson"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
            </View>

            {/* Champ Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type *</Text>
              <CustomSelect
                options={types}
                value={form.type}
                onChange={(value) => {
                  setForm({ ...form, type: value });
                  setErrors({ ...errors, type: '' });
                }}
                placeholder="Sélectionner un type"
                error={errors.type}
              />
            </View>

            {/* Champ Quantité */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantité {form.type === 'Aliment' ? '(kg)' : '(unités)'} *</Text>
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

            {/* Champ Seuil critique */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Seuil critique {form.type === 'Aliment' ? '(kg)' : '(unités)'} *</Text>
              <TextInput
                style={[styles.input, errors.seuilCritique && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.seuilCritique}
                onChangeText={(text) => {
                  setForm({ ...form, seuilCritique: text });
                  setErrors({ ...errors, seuilCritique: '' });
                }}
                placeholder="Ex: 20"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.seuilCritique && (
                <Text style={styles.errorText}>{errors.seuilCritique}</Text>
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

export default AddStockModal;
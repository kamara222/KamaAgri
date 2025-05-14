// src/components/AddUserModal.tsx
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
interface UserForm {
  name: string;
  email: string;
  role: string;
}

interface AddUserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (user: UserForm) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<UserForm>({
    name: '',
    email: '',
    role: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Options pour le dropdown
  const roles = [
    { label: 'Sélectionner un rôle', value: '' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Utilisateur', value: 'Utilisateur' },
  ];

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email invalide';
    if (!form.role) newErrors.role = 'Rôle requis';
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
              <Text style={styles.modalTitle}>Ajouter Utilisateur</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Nom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="Ex: Jean Dupont"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Champ Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={form.email}
                onChangeText={(text) => {
                  setForm({ ...form, email: text });
                  setErrors({ ...errors, email: '' });
                }}
                placeholder="Ex: jean.dupont@example.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Champ Rôle */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rôle *</Text>
              <CustomSelect
                options={roles}
                value={form.role}
                onChange={(value) => {
                  setForm({ ...form, role: value });
                  setErrors({ ...errors, role: '' });
                }}
                placeholder="Sélectionner un rôle"
                error={errors.role}
              />
            </View>

            {/* Bouton de soumission */}
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Ajouter</Text>
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
    backgroundColor: COLORS.accent,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.margin,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default AddUserModal;
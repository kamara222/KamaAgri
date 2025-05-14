// src/components/EditLotModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

interface Lot {
  id: string;
  name: string;
  quantity: number;
  date: string;
}

interface EditLotModalProps {
  visible: boolean;
  lot: Lot | null;
  onClose: () => void;
  onSave: (updatedLot: Lot) => void;
}

const EditLotModal: React.FC<EditLotModalProps> = ({ visible, lot, onClose, onSave }) => {
  const [name, setName] = useState(lot?.name || '');
  const [quantity, setQuantity] = useState(lot?.quantity.toString() || '');
  const [date, setDate] = useState(lot?.date || '');

  const handleSave = () => {
    if (!name || !quantity || !date) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    onSave({
      id: lot?.id || '',
      name,
      quantity: parseInt(quantity),
      date,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier le Lot</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom du lot (ex. Lot A1)"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Nom du lot"
          />
          <TextInput
            style={styles.input}
            placeholder="Quantité (ex. 100)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            accessibilityLabel="Quantité de poulets"
          />
          <TextInput
            style={styles.input}
            placeholder="Date (ex. 2025-05-01)"
            value={date}
            onChangeText={setDate}
            accessibilityLabel="Date d’ajout"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: COLORS.textLight }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: COLORS.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.modalButtonText, { color: COLORS.white }]}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    width: '80%',
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SIZES.margin / 2,
  },
  modalButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
  },
});

export default EditLotModal;
import React from 'react';
import { Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Modal réutilisable pour choisir entre Poulets et Poissons.
// Utilisée par les portails "Vente" et "Enregistrer" de la page d'Accueil.
interface AnimalSelectionModalProps {
  visible: boolean;
  title: string;
  onSelect: (type: 'chicken' | 'fish') => void;
  onClose: () => void;
}

const AnimalSelectionModal: React.FC<AnimalSelectionModalProps> = ({
  visible,
  title,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>{title}</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onSelect('chicken')}
            accessibilityLabel="Poulets"
          >
            <Icon name="egg" size={32} color={COLORS.accent} />
            <Text style={styles.modalOptionText}>Poulets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => onSelect('fish')}
            accessibilityLabel="Poissons"
          >
            <Icon name="waves" size={32} color={COLORS.accent} />
            <Text style={styles.modalOptionText}>Poissons</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 2,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  modalOptionText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.margin,
  },
  modalCancelButton: {
    marginTop: SIZES.margin,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
});

export default AnimalSelectionModal;

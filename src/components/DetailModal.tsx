import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Une ligne de détail (libellé + valeur)
export interface DetailRow {
  label: string;
  value: string;
}

// Modal générique d'affichage de détails (ventes, lots, bassins...).
interface DetailModalProps {
  visible: boolean;
  title: string;
  rows: DetailRow[];
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ visible, title, rows, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animatable.View animation="zoomIn" duration={250} style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fermer">
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.rows}>
            {rows.map((row, index) => (
              <View key={`${row.label}-${index}`} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.5,
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.margin / 2,
  },
  rows: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  rowLabel: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
    flex: 1,
  },
  rowValue: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    marginTop: SIZES.margin,
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default DetailModal;

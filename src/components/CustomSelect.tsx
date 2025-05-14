// src/components/CustomSelect.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Types pour les options
interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Trouver le label correspondant à la valeur sélectionnée
  const selectedOption = options.find((opt) => opt.value === value);

  // Rendu de chaque option
  const renderOption = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => {
        onChange(item.value);
        setIsModalVisible(false);
      }}
    >
      <Text style={styles.optionText}>{item.label}</Text>
      {item.value === value && (
        <Icon name="check" size={20} color={COLORS.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animatable.View animation="pulse" duration={2000} iterationCount="infinite">
        <TouchableOpacity
          style={[styles.selectButton, error && styles.inputError]}
          onPress={() => setIsModalVisible(true)}
        >
          <Text
            style={[
              styles.selectText,
              !value && { color: COLORS.textLight },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </Animatable.View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal pour la liste des options */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="slideInUp"
            duration= {300}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionList}
            />
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.margin,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  selectText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding,
    maxHeight: '50%',
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
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  optionList: {
    flexGrow: 0,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  optionText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
});

export default CustomSelect;
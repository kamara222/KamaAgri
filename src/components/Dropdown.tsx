// Importations
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { theme } from '../styles/theme';

// Props du composant
interface DropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
}

// Composant dropdown personnalisé
const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onValueChange,
  items,
  placeholder = 'Sélectionner...',
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNPickerSelect
        onValueChange={onValueChange}
        items={items}
        value={value}
        placeholder={{ label: placeholder, value: null }}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          placeholder: { color: theme.colors.textLight },
        }}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  error: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Dropdown;
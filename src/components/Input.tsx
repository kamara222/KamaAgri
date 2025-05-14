// Importations
import * as React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

// Props du composant
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  error?: string;
}

// Composant d’input personnalisé
const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={theme.colors.textLight}
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
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Input;
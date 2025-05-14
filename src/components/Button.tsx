// Importations
import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

// Props du composant
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// Composant de bouton personnalisé
const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textLight,
    opacity: 0.6,
  },
});

export default Button;
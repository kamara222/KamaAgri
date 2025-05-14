// Importations
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

// Props du composant
interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: string; // Nom de l’icône MaterialIcons
}

// Composant de carte pour afficher des résumés
const Card: React.FC<CardProps> = ({ title, value, subtitle, iconName }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons
          name={iconName}
          size={theme.iconSizes.medium}
          color={theme.colors.primary}
        />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.sm,
  },
  cardValue: {
    fontSize: theme.fontSizes.xlarge,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
});

export default Card;
// Définition des couleurs, tailles et styles globaux pour une UI cohérente
export const theme = {
    colors: {
      primary: '#2E7D32', // Vert professionnel pour les actions principales
      primaryLight: '#4CAF50', // Vert clair pour dégradés
      secondary: '#0288D1', // Bleu pour éléments secondaires
      background: '#F5F5F5', // Fond gris clair
      text: '#212121', // Texte sombre
      textLight: '#757575', // Texte secondaire
      error: '#D32F2F', // Rouge pour les erreurs
      white: '#FFFFFF',
      cardBorder: '#E0E0E0', // Bordure des cartes
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSizes: {
      small: 14,
      medium: 16,
      large: 20,
      xlarge: 24,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    iconSizes: {
      small: 20,
      medium: 24,
      large: 32,
    },
  };

 // src/styles/GlobalStyles.ts
 export const COLORS = {
  primary: '#1B5E20', // Vert foncé pour les éléments principaux
  secondary: '#66BB6A', // Vert vif pour les boutons
  accent: '#0288D1', // Bleu pour les éléments liés à l’alimentation/poids/poissons
  background: '#FAFAFA', // Fond clair
  text: '#1A1A1A', // Texte sombre
  textLight: '#666666', // Texte secondaire
  white: '#FFFFFF',
  error: '#C62828',
  // gradientStart: '#4CAF50', // Commenté pour éviter LinearGradient
  // gradientEnd: '#2E7D32',
};

export const SIZES = {
  padding: 16,
  margin: 16,
  radius: 16, // Coins arrondis
  fontSmall: 15,
  fontMedium: 17,
  fontLarge: 22,
  fontTitle: 26,
};

export const FONTS = {
  regular: 'Roboto-Regular',
  bold: 'Roboto-Bold',
  medium: 'Roboto-Medium',
};
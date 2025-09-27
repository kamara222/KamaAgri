import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useLogout } from '../services';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/Navigation';

// Interface pour les informations utilisateur
interface UserInfo {
  prenom: string;
  nom: string;
  email: string;
  numeroTelephone: string;
  role: {
    code: string;
    nom: string;
    description: string;
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { mutate: logout } = useLogout();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les informations utilisateur depuis AsyncStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await AsyncStorage.getItem('userInfo');
        console.log('Données AsyncStorage userInfo:', userData);
        if (userData) {
          const parsedUser: UserInfo = JSON.parse(userData);
          setUserInfo(parsedUser);
          console.log('Utilisateur parsé:', parsedUser);
        } else {
          setError('Aucune information utilisateur trouvée');
          console.warn('Aucune donnée userInfo trouvée dans AsyncStorage');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des infos utilisateur:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  // Gérer la déconnexion
  const handleLogout = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vous déconnecter ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: () => {
            logout(
              {},
              {
                onSuccess: () => {
                  Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Déconnexion réussie',
                  });
                  navigation.replace('LoginScreen');
                },
                onError: (error: any) => {
                  Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Échec de la déconnexion',
                  });
                  console.error('Erreur de déconnexion:', error);
                },
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Formatter le numéro de téléphone
  const formatPhoneNumber = (phone: string) => {
    // Supposons que le numéro est au format 2250707056181
    // On le formate comme +225 07 07 05 61 81
    if (phone.startsWith('225') && phone.length === 12) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)} ${phone.slice(11)}`;
    }
    return phone;
  };

  // Calculer les initiales
  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : userInfo ? (
        <View style={styles.profileContainer}>
          {/* En-tête avec initiales */}
          <Animatable.View animation="zoomIn" duration={1000} style={styles.initialsContainer}>
            <Text style={styles.initials}>
              {getInitials(userInfo.prenom, userInfo.nom)}
            </Text>
          </Animatable.View>

          {/* Carte des informations utilisateur */}
          <Animatable.View animation="fadeInUp" duration={1000} style={styles.infoCard}>
            <Text style={styles.name}>
              {userInfo.prenom} {userInfo.nom}
            </Text>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={COLORS.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>{userInfo.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={COLORS.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>{formatPhoneNumber(userInfo.numeroTelephone)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="person" size={20} color={COLORS.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>{userInfo.role.nom}</Text>
            </View>
            <Text style={styles.roleDescription}>{userInfo.role.description}</Text>
          </Animatable.View>

          {/* Bouton de déconnexion */}
          <Animatable.View animation="bounceIn" duration={1000} delay={200}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Se déconnecter"
              accessibilityHint="Déconnecte l'utilisateur et retourne à l'écran de connexion"
            >
              <Icon name="logout" size={24} color={COLORS.white} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.padding,
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  initials: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    width: '90%',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: SIZES.margin * 2,
  },
  name: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  infoIcon: {
    marginRight: SIZES.margin / 2,
  },
  infoText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  roleDescription: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '50%',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: SIZES.margin / 2,
  },
  logoutText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default ProfileScreen;
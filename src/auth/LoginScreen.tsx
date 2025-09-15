import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    // Ici vous pouvez ajouter votre logique de connexion
    Alert.alert('Succès', 'Connexion réussie!');
    // Navigation vers l'écran principal après la connexion
    navigation.replace('Home');
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={['green', 'green', 'green']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="green" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          {/* Header avec logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="water" size={40} color="#fff" />
              <Ionicons name="leaf" size={30} color="#fff" style={styles.leafIcon} />
            </View>
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.appName}>AquaFarm Pro</Text>
          </View>

          {/* Formulaire de connexion */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                animateButton();
                handleLogin();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>
                Pas de compte ? <Text style={styles.registerLink}>contacter le support</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Décoration de fond */}
        <View style={styles.backgroundDecoration}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  leafIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  appName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    backdropFilter: 'blur(10px)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 15,
    fontSize: 14,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  registerLink: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: -50,
  },
});

export default LoginScreen;
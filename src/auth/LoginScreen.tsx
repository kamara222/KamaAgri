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
  Alert,
  ScrollView,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Fonction pour obtenir des dimensions responsives
const getResponsiveDimensions = () => {
  const isSmallScreen = height < 700;
  const isMediumScreen = height >= 700 && height < 800;
  
  return {
    headerMarginBottom: isSmallScreen ? 30 : isMediumScreen ? 40 : 50,
    logoSize: isSmallScreen ? 60 : 80,
    formPadding: isSmallScreen ? 20 : 30,
    inputHeight: isSmallScreen ? 45 : 50,
    fontSize: {
      welcome: isSmallScreen ? 20 : 24,
      appName: isSmallScreen ? 14 : 16,
      input: isSmallScreen ? 14 : 16,
      button: isSmallScreen ? 16 : 18,
    }
  };
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const dimensions = getResponsiveDimensions();

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

    // Listeners pour le clavier
    const keyboardWillShow = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardWillHide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardWillShow, (event) => {
      setKeyboardVisible(true);
      Animated.timing(keyboardAnim, {
        toValue: -event.endCoordinates.height * 0.3,
        duration: Platform.OS === 'ios' ? 250 : 200,
        useNativeDriver: true,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(keyboardWillHide, () => {
      setKeyboardVisible(false);
      Animated.timing(keyboardAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 250 : 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    Alert.alert('Succès', 'Connexion réussie!');
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['green', 'green', 'green']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="green" />
        
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                    { translateY: keyboardAnim }
                  ],
                },
              ]}
            >
              {/* Header avec logo - masqué partiellement quand clavier visible */}
              {!keyboardVisible && (
                <Animated.View 
                  style={[
                    styles.header, 
                    { marginBottom: dimensions.headerMarginBottom }
                  ]}
                >
                  <View style={[
                    styles.logoContainer,
                    { 
                      width: dimensions.logoSize,
                      height: dimensions.logoSize,
                      borderRadius: dimensions.logoSize / 2
                    }
                  ]}>
                    <Ionicons name="water" size={dimensions.logoSize * 0.5} color="#fff" />
                    <Ionicons 
                      name="leaf" 
                      size={dimensions.logoSize * 0.375} 
                      color="#fff" 
                      style={styles.leafIcon} 
                    />
                  </View>
                  <Text style={[styles.welcomeText, { fontSize: dimensions.fontSize.welcome }]}>
                    Bienvenue
                  </Text>
                  <Text style={[styles.appName, { fontSize: dimensions.fontSize.appName }]}>
                    AquaFarm Pro
                  </Text>
                </Animated.View>
              )}

              {/* Version compacte du header pour le clavier */}
              {keyboardVisible && (
                <View style={styles.compactHeader}>
                  <Text style={styles.compactTitle}>AquaFarm Pro</Text>
                </View>
              )}

              {/* Formulaire de connexion */}
              <View style={[styles.formContainer, { padding: dimensions.formPadding }]}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        height: dimensions.inputHeight,
                        fontSize: dimensions.fontSize.input
                      }
                    ]}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        height: dimensions.inputHeight,
                        fontSize: dimensions.fontSize.input
                      }
                    ]}
                    placeholder="Mot de passe"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
                    <Text style={[
                      styles.loginButtonText, 
                      { fontSize: dimensions.fontSize.button }
                    ]}>
                      Se connecter
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {!keyboardVisible && (
                  <>
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
                  </>
                )}
              </View>
            </Animated.View>
          </ScrollView>

          {/* Décoration de fond */}
          <View style={styles.backgroundDecoration}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'green',
  },
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Math.max(width * 0.08, 30),
    zIndex: 2,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  appName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  compactHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
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
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
    top: -Math.min(width * 0.25, 100),
    right: -Math.min(width * 0.25, 100),
  },
  circle2: {
    width: Math.min(width * 0.375, 150),
    height: Math.min(width * 0.375, 150),
    bottom: -Math.min(width * 0.1875, 75),
    left: -Math.min(width * 0.1875, 75),
  },
  circle3: {
    width: Math.min(width * 0.25, 100),
    height: Math.min(width * 0.25, 100),
    top: height * 0.3,
    left: -Math.min(width * 0.125, 50),
  },
});

export default LoginScreen;
import messaging from "@react-native-firebase/messaging";
import { NavigationContainerRef } from "@react-navigation/native";
// NOUVEAU: Import pour gérer l'affichage local des notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// --- CONFIGURATION EXPONOTIFICATIONS (IMPORTANT POUR LE FOREGROUND) ---
// Définir la logique pour les notifications reçues en premier plan.
// C'est ce qui indique à Expo/l'OS d'afficher la bannière et de jouer le son.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // <-- La clé pour l'affichage en premier plan !
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
// ----------------------------------------------------------------------


let navigationRef: NavigationContainerRef<ReactNavigation.RootParamList> | null = null;

export const setNavigationRef = (ref: any) => {
  // Assurez-vous que le type est compatible si vous utilisez TypeScript strict
  navigationRef = ref;
};

export const handleNotificationOpen = async (remoteMessage: any) => {
  if (remoteMessage) {
    console.log('Notification ouverte par l\'utilisateur', remoteMessage);
    
    // Exemple : navigation vers un écran spécifique
    if (navigationRef && remoteMessage.data) {
      const type = remoteMessage.data.type || 'default';
      
      switch (type) {
        case 'chat':
          navigationRef.navigate('ChatScreen', {
            chatId: remoteMessage.data.chatId
          });
          break;
        case 'notification':
        default:
          // Le nom de l'écran par défaut dans votre projet
          navigationRef.navigate('Notification'); 
          break;
      }
    }
  }
};

export const setupFirebaseMessaging = async () => {
  // 1. Demande de permission FCM
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Statut d\'autorisation des notifications :', authStatus);
    
    // 2. Assurer les permissions locales pour Expo Notifications (pour l'affichage en premier plan)
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Statut des permissions Expo Notifications :', status);


    // 3. Créer le canal de notification pour Android (utilise "default" comme dans votre log)
    if (Platform.OS === 'android') {
        // Le channelId 'default' doit exister pour que les notifications Android s'affichent correctement
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Notifications par Défaut',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default', 
        });
    }

    // Obtenir le token
    const token = await messaging().getToken();
    console.log('Firebase Token:', token);

    // Gérer les notifications en arrière-plan/clic sur l'icône
    messaging().onNotificationOpenedApp(handleNotificationOpen);
    messaging().getInitialNotification().then(handleNotificationOpen);

    // Notifications en premier plan (Foreground)
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Notification en premier plan (reçue du serveur)', remoteMessage);

      // ***** LA VRAIE SOLUTION EST ICI: Déclencher une notification locale *****
      if (remoteMessage.notification) {
        const { title, body, android } = remoteMessage.notification;
        
        await Notifications.presentNotificationAsync({
            title: title || 'Nouvelle notification',
            body: body || '',
            data: remoteMessage.data, // Transmettre les données pour la navigation
            sound: android?.sound || 'default', // Utilise le son spécifié dans la payload FCM
            android: {
                channelId: android?.channelId || 'default', // S'assure d'utiliser le canal
            }
        });
        console.log('Notification affichée localement en premier plan.');
      }
      // *****************************************************************
    });

    return unsubscribe;
  }
  
  // Si les permissions ne sont pas activées, renvoyer une fonction de nettoyage vide
  return () => {};
};

import messaging from "@react-native-firebase/messaging";
import { NavigationContainerRef } from "@react-navigation/native";

let navigationRef: NavigationContainerRef<ReactNavigation.RootParamList>;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

export const handleNotificationOpen = async (remoteMessage) => {
  if (remoteMessage) {
    // Exemple : navigation vers un écran spécifique
    // Vous devrez adapter cette logique en fonction de votre structure de navigation
    if (navigationRef && remoteMessage.data) {
      switch (remoteMessage.data.type) {
        case 'chat':
          navigationRef.navigate('ChatScreen', { 
            chatId: remoteMessage.data.chatId 
          });
          break;
        case 'notification':
          navigationRef.navigate('Notification');
          break;
        default:
          navigationRef.navigate('Notification');
      }
    }
  }
};

export const setupFirebaseMessaging = async () => {
  // Demande de permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    // Obtenir le token
    const token = await messaging().getToken();
    console.log('Firebase Token:', token);

    // Gérer les notifications en arrière-plan
    messaging().onNotificationOpenedApp(handleNotificationOpen);

    // Gérer l'ouverture initiale de l'application via une notification
    messaging()
      .getInitialNotification()
      .then(handleNotificationOpen);

    // Notifications en premier plan
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // Logique de gestion des notifications en premier plan
      console.log('Notification en premier plan', remoteMessage);
    });

    return unsubscribe;
  }
};
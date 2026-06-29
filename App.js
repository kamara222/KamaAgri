import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Navigation from './src/navigations/navigation';
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils";

// Importer les fonctions Firebase
import { setupFirebaseMessaging, setNavigationRef } from './test-firebase';

// QueryClient créé UNE SEULE FOIS (niveau module) pour conserver le cache
// entre les rendus et les navigations. Cache en session : les pages déjà
// visitées ne se rechargent pas tant que les données restent "fraîches".
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min : pas de refetch en revisitant une page
      gcTime: 30 * 60 * 1000, // gardées 30 min en mémoire même sans écran monté
      retry: 2,
      refetchOnReconnect: true,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  // Référence pour la navigation
  const navigationRef = useRef(null);

  // Initialisation Firebase Messaging au démarrage
  useEffect(() => {
    // Fournir la référence de navigation à test-firebase.js
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }

    let cleanup;
    
    // Démarrer la configuration Firebase Messaging et gérer la désinscription
    setupFirebaseMessaging().then(unsubscribe => {
        cleanup = unsubscribe;
    }).catch(error => {
        console.error("Erreur lors de la configuration de Firebase Messaging:", error);
    });

    // Fonction de nettoyage exécutée lors du démontage du composant
    return () => {
        if (cleanup) {
            cleanup();
            console.log("Désabonnement de Firebase Messaging effectué.");
        }
    };
    // Dépendance vide car cette initialisation ne doit se faire qu'une seule fois
  }, []); 

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* Transmettre la ref au composant Navigation */}
      <Navigation ref={navigationRef} />
      <Toast config={toastConfig} position={'bottom'} />
    </QueryClientProvider>
  );
}

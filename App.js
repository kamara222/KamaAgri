// // App.tsx
// import React, { useEffect, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
// import Navigation from './src/navigations/navigation';
// import Toast from "react-native-toast-message";
// import { toastConfig } from "./src/utils";



// export default function App() {
//   // Charger les polices
//   const [fontsLoaded] = useFonts({
//     'Roboto-Regular': Roboto_400Regular,
//     'Roboto-Medium': Roboto_500Medium,
//     'Roboto-Bold': Roboto_700Bold,
//   });

//   // Afficher un écran de chargement si les polices ne sont pas prêtes
//   if (!fontsLoaded) {
//     return null;
//   }

//   const queryClient = new QueryClient();

//   return (
//     <QueryClientProvider client={queryClient}>
//       <StatusBar style="light" />
//       <Navigation />
//       <Toast config={toastConfig} position={'bottom'} />
//     </QueryClientProvider>

//   );
// }




// App.tsx
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Navigation from './src/navigations/navigation';
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils";

// Importer les fonctions Firebase
import { setupFirebaseMessaging, setNavigationRef } from './test-firebase';

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
    // Fournir la référence de navigation à testfirebase.js
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }

    // Démarrer la configuration Firebase Messaging et récupérer la fonction de désabonnement
    const unsubscribePromise = setupFirebaseMessaging();

    // Se désabonner lors du démontage du composant si nécessaire
    unsubscribePromise.then(unsubscribe => {
      return () => {
        if (unsubscribe) unsubscribe();
      };
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* Transmettre la ref au composant Navigation */}
      <Navigation ref={navigationRef} />
      <Toast config={toastConfig} position={'bottom'} />
    </QueryClientProvider>
  );
}

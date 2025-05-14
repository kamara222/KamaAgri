// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });



// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Navigation from './src/navigations/navigation';

export default function App() {
  // Charger les polices
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  // Afficher un écran de chargement si les polices ne sont pas prêtes
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Navigation />
    </>
  );
}
// // src/screens/ReportsScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as Animatable from 'react-native-animatable';
// import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
// import CustomSelect from '../components/CustomSelect';
// import { useNavigation } from '@react-navigation/native';

// // Données mock pour la liste des rapports (à remplacer par API)
// const mockReports = [
//   {
//     id: '1',
//     title: 'Mortalités Poulets',
//     type: 'Poulets',
//     period: 'Dernier mois',
//     date: '2025-05-10',
//   },
//   {
//     id: '2',
//     title: 'Ventes Poissons',
//     type: 'Poissons',
//     period: 'Dernière semaine',
//     date: '2025-05-08',
//   },
//   {
//     id: '3',
//     title: 'Stocks Critiques',
//     type: 'Stocks',
//     period: 'Dernier mois',
//     date: '2025-05-05',
//   },
// ];

// // Types pour un rapport
// interface Report {
//   id: string;
//   title: string;
//   type: string;
//   period: string;
//   date: string;
// }

// const ReportsScreen: React.FC = () => {
//   const navigation = useNavigation();
//   const [filterType, setFilterType] = useState('');
//   const [filterPeriod, setFilterPeriod] = useState('');

//   // Options pour les filtres
//   const types = [
//     { label: 'Tous les types', value: '' },
//     { label: 'Poulets', value: 'Poulets' },
//     { label: 'Poissons', value: 'Poissons' },
//     { label: 'Stocks', value: 'Stocks' },
//   ];
//   const periods = [
//     { label: 'Toutes périodes', value: '' },
//     { label: 'Dernière semaine', value: 'week' },
//     { label: 'Dernier mois', value: 'month' },
//   ];

//   // Filtrer les rapports avec gestion des erreurs
//   const filteredReports = mockReports.filter((report) => {
//     try {
//       const matchesType = !filterType || report.type === filterType;
//       const matchesPeriod =
//         !filterPeriod ||
//         (filterPeriod === 'week' && report.date >= '2025-05-06') ||
//         (filterPeriod === 'month' && report.date >= '2025-04-10');
//       return matchesType && matchesPeriod;
//     } catch (error) {
//       console.error('Erreur de filtrage:', error);
//       return true;
//     }
//   });

//   // Rendu de chaque carte de rapport
//   const renderReportItem = ({ item }: { item: Report }) => (
//     <Animatable.View animation="fadeInUp" duration={500} style={styles.reportCard}>
//       <TouchableOpacity
//         onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
//       >
//         <View style={styles.cardHeader}>
//           <Icon
//             name={item.type === 'Poulets' ? 'egg' : item.type === 'Poissons' ? 'waves' : 'inventory'}
//             size={28}
//             color={COLORS.accent}
//           />
//           <Text style={styles.cardTitle}>{item.title}</Text>
//         </View>
//         <Text style={styles.cardDetail}>Type: {item.type}</Text>
//         <Text style={styles.cardDetail}>Période: {item.period}</Text>
//         <Text style={styles.cardDetail}>Date: {item.date}</Text>
//       </TouchableOpacity>
//     </Animatable.View>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Filtres */}
//       <View style={styles.filterContainer}>
//         <CustomSelect
//           options={types}
//           value={filterType}
//           onChange={setFilterType}
//           placeholder="Filtrer par type"
//         />
//         <CustomSelect
//           options={periods}
//           value={filterPeriod}
//           onChange={setFilterPeriod}
//           placeholder="Filtrer par période"
//         />
//       </View>

//       {/* Liste des rapports */}
//       <FlatList
//         data={filteredReports}
//         renderItem={renderReportItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>Aucun rapport disponible</Text>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   filterContainer: {
//     flexDirection: 'column',
//     padding: SIZES.padding,
//   },
//   listContainer: {
//     padding: SIZES.padding,
//   },
//   reportCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: SIZES.radius,
//     padding: SIZES.padding,
//     marginBottom: SIZES.margin,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: SIZES.margin / 2,
//   },
//   cardTitle: {
//     fontSize: SIZES.fontLarge,
//     fontFamily: FONTS.bold,
//     color: COLORS.primary,
//     marginLeft: SIZES.margin / 2,
//   },
//   cardDetail: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.regular,
//     color: COLORS.text,
//     marginBottom: 4,
//   },
//   emptyText: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.regular,
//     color: COLORS.textLight,
//     textAlign: 'center',
//     marginTop: SIZES.margin,
//   },
// });

// export default ReportsScreen;






import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import { COLORS } from '../styles/GlobalStyles';

// Assure-toi de remplacer 'animation.json' par le nom de ton fichier Lottie téléchargé  
const loadingAnimation = require('../../assets/empty.json');

const ReportsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emptyContainer}>

        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={styles.animation}
        />
        {/* Message indiquant que la page est en maintenance */}
        <Text style={styles.maintenanceText}>
          Les rapports seront bientôt disponibles
        </Text>

      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animation: {
    width: 300, // Ajustez la taille selon vos besoins  
    height: 300,
    marginBottom: 10,
  },
  maintenanceText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
    fontFamily: "Poppins-Bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingTop: 50,
    paddingHorizontal: 20,
  }
});
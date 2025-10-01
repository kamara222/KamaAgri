// // src/screens/StockManagementScreen.tsx
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
// import AddStockModal from '../components/AddStockModal';

// // Données mock pour la liste des articles (à remplacer par API)
// const mockStocks = [
//   {
//     id: '1',
//     nom: 'Granulés poisson',
//     type: 'Aliment',
//     quantite: 100,
//     seuilCritique: 20,
//   },
//   {
//     id: '2',
//     nom: 'Antibiotique',
//     type: 'Médicament',
//     quantite: 5,
//     seuilCritique: 10,
//   },
// ];

// // Types pour un article en stock
// interface StockItem {
//   id: string;
//   nom: string;
//   type: string;
//   quantite: number;
//   seuilCritique: number;
// }

// const StockManagementScreen: React.FC = () => {
//   const [filterType, setFilterType] = useState('');
//   const [filterStockLevel, setFilterStockLevel] = useState('');
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   // Options pour les filtres
//   const types = [
//     { label: 'Tous les types', value: '' },
//     { label: 'Aliment', value: 'Aliment' },
//     { label: 'Médicament', value: 'Médicament' },
//     { label: 'Autre', value: 'Autre' },
//   ];
//   const stockLevels = [
//     { label: 'Tous les niveaux', value: '' },
//     { label: 'Critique', value: 'critical' },
//     { label: 'Normal', value: 'normal' },
//   ];

//   // Filtrer les articles avec gestion des erreurs
//   const filteredStocks = mockStocks.filter((stock) => {
//     try {
//       const matchesType = !filterType || stock.type === filterType;
//       const matchesStockLevel =
//         !filterStockLevel ||
//         (filterStockLevel === 'critical' && stock.quantite <= stock.seuilCritique) ||
//         (filterStockLevel === 'normal' && stock.quantite > stock.seuilCritique);
//       return matchesType && matchesStockLevel;
//     } catch (error) {
//       console.error('Erreur de filtrage:', error);
//       return true;
//     }
//   });

//   // Rendu de chaque carte d’article
//   const renderStockItem = ({ item }: { item: StockItem }) => (
//     <Animatable.View animation="fadeInUp" duration={500} style={styles.stockCard}>
//       <View style={styles.cardHeader}>
//         <Icon
//           name={item.type === 'Aliment' ? 'restaurant' : item.type === 'Médicament' ? 'healing' : 'inventory'}
//           size={28}
//           color={COLORS.accent}
//         />
//         <Text style={styles.cardTitle}>{item.nom}</Text>
//       </View>
//       <Text style={styles.cardDetail}>Type: {item.type}</Text>
//       <Text style={styles.cardDetail}>Quantité: {item.quantite} {item.type === 'Aliment' ? 'kg' : 'unités'}</Text>
//       <Text style={styles.cardDetail}>Seuil critique: {item.seuilCritique} {item.type === 'Aliment' ? 'kg' : 'unités'}</Text>
//       <Text
//         style={[
//           styles.cardDetail,
//           { color: item.quantite <= item.seuilCritique ? COLORS.error : COLORS.text },
//         ]}
//       >
//         Statut: {item.quantite <= item.seuilCritique ? 'Critique' : 'Normal'}
//       </Text>
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
//           options={stockLevels}
//           value={filterStockLevel}
//           onChange={setFilterStockLevel}
//           placeholder="Filtrer par niveau"
//         />
//       </View>

//       {/* Liste des articles */}
//       <FlatList
//         data={filteredStocks}
//         renderItem={renderStockItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>Aucun article en stock</Text>
//         }
//       />

//       {/* Bouton flottant */}
//       <Animatable.View animation="bounceIn" duration={1000}>
//         <TouchableOpacity
//           style={styles.fab}
//           onPress={() => setIsModalVisible(true)}
//         >
//           <Icon name="add" size={30} color={COLORS.white} />
//         </TouchableOpacity>
//       </Animatable.View>

//       {/* Modal pour ajouter un article */}
//       <AddStockModal
//         isVisible={isModalVisible}
//         onClose={() => setIsModalVisible(false)}
//         onSubmit={(stock) => {
//           console.log('Nouvel article:', stock);
//           setIsModalVisible(false);
//           // TODO: Envoyer au backend
//         }}
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
//   stockCard: {
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
//   fab: {
//     position: 'absolute',
//     bottom: SIZES.margin * 2,
//     right: SIZES.margin * 2,
//     backgroundColor: COLORS.accent,
//     borderRadius: 30,
//     width: 60,
//     height: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
// });

// export default StockManagementScreen;



import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import { COLORS } from '../styles/GlobalStyles';

// Assure-toi de remplacer 'animation.json' par le nom de ton fichier Lottie téléchargé  
const loadingAnimation = require('../../assets/empty.json');

const StockManagementScreen = () => {
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
          Les stocks seront bientôt disponibles
        </Text>

      </View>
    </SafeAreaView>
  );
};

export default StockManagementScreen;

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
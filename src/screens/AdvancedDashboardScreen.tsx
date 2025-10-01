// // src/screens/AdvancedDashboardScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { LineChart, BarChart } from 'react-native-chart-kit';
// import * as Animatable from 'react-native-animatable';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import CustomSelect from '../components/CustomSelect';
// import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
// import DateTimePicker from '@react-native-community/datetimepicker';

// // Données mock pour les graphiques et statistiques (à remplacer par API)
// const mockData = {
//   poulets: {
//     mortalites: {
//       labels: ['01/05', '02/05', '03/05', '04/05', '05/05'],
//       data: [20, 15, 30, 10, 25],
//     },
//     ventes: {
//       labels: ['01/05', '02/05', '03/05', '04/05', '05/05'],
//       data: [50000, 75000, 60000, 90000, 80000],
//     },
//   },
//   poissons: {
//     mortalites: {
//       labels: ['01/05', '02/05', '03/05', '04/05', '05/05'],
//       data: [10, 5, 15, 8, 12],
//     },
//     ventes: {
//       labels: ['01/05', '02/05', '03/05', '04/05', '05/05'],
//       data: [30000, 45000, 40000, 60000, 50000],
//     },
//   },
//   stats: {
//     poulets: { avgMortality: 20, totalSales: 350000 },
//     poissons: { avgMortality: 10, totalSales: 225000 },
//   },
// };

// const AdvancedDashboardScreen: React.FC = () => {
//   const [category, setCategory] = useState('poulets');
//   const [metric, setMetric] = useState('mortalites');
//   const [chartType, setChartType] = useState('line');
//   const [startDate, setStartDate] = useState(new Date('2025-05-01'));
//   const [endDate, setEndDate] = useState(new Date('2025-05-05'));
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // Options pour les filtres
//   const categories = [
//     { label: 'Poulets', value: 'poulets' },
//     { label: 'Poissons', value: 'poissons' },
//   ];
//   const metrics = [
//     { label: 'Mortalités', value: 'mortalites' },
//     { label: 'Ventes', value: 'ventes' },
//   ];
//   const chartTypes = [
//     { label: 'Courbes', value: 'line' },
//     { label: 'Histogrammes', value: 'bar' },
//   ];

//   // Données du graphique
//   const chartData = {
//     labels: mockData[category][metric].labels,
//     datasets: [
//       {
//         data: mockData[category][metric].data,
//         color: () => COLORS.accent,
//         strokeWidth: 2,
//       },
//     ],
//   };

//   // Générer le PDF
//   const generatePDF = async () => {
//     try {
//       const tableRows = chartData.labels
//         .map((label, index) => `
//           <tr>
//             <td style="border: 1px solid #ddd; padding: 8px;">${label}</td>
//             <td style="border: 1px solid #ddd; padding: 8px;">${chartData.datasets[0].data[index]}</td>
//           </tr>
//         `)
//         .join('');

//       const htmlContent = `
//         <html>
//           <head>
//             <meta charset="UTF-8">
//             <style>
//               body { font-family: Arial, sans-serif; margin: 20px; }
//               h1 { color: #0288D1; }
//               table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//               th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//               th { background-color: #f2f2f2; }
//               p { color: #666; }
//             </style>
//           </head>
//           <body>
//             <h1>Tableau de Bord Avancé - ${category} (${metric})</h1>
//             <p><strong>Période:</strong> ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}</p>
//             <table>
//               <tr>
//                 <th>Date</th>
//                 <th>Valeur</th>
//               </tr>
//               ${tableRows}
//             </table>
//             <h2>Statistiques</h2>
//             <p><strong>Mortalité moyenne:</strong> ${mockData.stats[category].avgMortality}</p>
//             <p><strong>Ventes totales:</strong> ${mockData.stats[category].totalSales} XAF</p>
//           </body>
//         </html>
//       `;

//       const { uri } = await Print.printToFileAsync({ html: htmlContent });
//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(uri, {
//           mimeType: 'application/pdf',
//           dialogTitle: 'Télécharger ou partager le rapport',
//         });
//       } else {
//         Alert.alert('Succès', `PDF sauvegardé à: ${uri}`);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la génération du PDF:', error);
//       Alert.alert('Erreur', 'Impossible de générer le PDF.');
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Filtres */}
//       <View style={styles.filtersContainer}>
//         <CustomSelect
//           options={categories}
//           value={category}
//           onChange={setCategory}
//           placeholder="Catégorie"
//         />
//         <CustomSelect
//           options={metrics}
//           value={metric}
//           onChange={setMetric}
//           placeholder="Métrique"
//         />
//         <CustomSelect
//           options={chartTypes}
//           value={chartType}
//           onChange={setChartType}
//           placeholder="Type de graphique"
//         />
//         <TouchableOpacity
//           style={styles.dateButton}
//           onPress={() => setShowStartPicker(true)}
//         >
//           <Text style={styles.dateButtonText}>
//             Début: {startDate.toLocaleDateString('fr-FR')}
//           </Text>
//         </TouchableOpacity>
//         {showStartPicker && (
//           <DateTimePicker
//             value={startDate}
//             mode="date"
//             display="default"
//             onChange={(event, date) => {
//               setShowStartPicker(false);
//               if (date) setStartDate(date);
//             }}
//           />
//         )}
//         <TouchableOpacity
//           style={styles.dateButton}
//           onPress={() => setShowEndPicker(true)}
//         >
//           <Text style={styles.dateButtonText}>
//             Fin: {endDate.toLocaleDateString('fr-FR')}
//           </Text>
//         </TouchableOpacity>
//         {showEndPicker && (
//           <DateTimePicker
//             value={endDate}
//             mode="date"
//             display="default"
//             onChange={(event, date) => {
//               setShowEndPicker(false);
//               if (date) setEndDate(date);
//             }}
//           />
//         )}
//       </View>

//       {/* Graphique */}
//       <View style={styles.chartContainer}>
//         <Text style={styles.sectionTitle}>
//           {metric === 'mortalites' ? 'Mortalités' : 'Ventes'} ({category})
//         </Text>
//         <Animatable.View animation="bounceIn" duration={1000}>
//           {chartType === 'line' ? (
//             <LineChart
//               data={chartData}
//               width={Dimensions.get('window').width - SIZES.padding * 2}
//               height={220}
//               chartConfig={{
//                 backgroundColor: COLORS.white,
//                 backgroundGradientFrom: COLORS.white,
//                 backgroundGradientTo: COLORS.white,
//                 decimalPlaces: 0,
//                 color: () => COLORS.textLight,
//                 labelColor: () => COLORS.text,
//                 style: { borderRadius: SIZES.radius },
//                 propsForDots: {
//                   r: '6',
//                   strokeWidth: '2',
//                   stroke: COLORS.accent,
//                 },
//               }}
//               bezier
//               style={styles.chart}
//             />
//           ) : (
//             <BarChart
//               data={chartData}
//               width={Dimensions.get('window').width - SIZES.padding * 2}
//               height={220}
//               chartConfig={{
//                 backgroundColor: COLORS.white,
//                 backgroundGradientFrom: COLORS.white,
//                 backgroundGradientTo: COLORS.white,
//                 decimalPlaces: 0,
//                 color: () => COLORS.textLight,
//                 labelColor: () => COLORS.text,
//                 style: { borderRadius: SIZES.radius },
//                 propsForBars: {
//                   strokeWidth: '2',
//                   stroke: COLORS.accent,
//                 },
//               }}
//               style={styles.chart}
//             />
//           )}
//         </Animatable.View>
//       </View>

//       {/* Statistiques */}
//       <View style={styles.statsContainer}>
//         <Text style={styles.sectionTitle}>Statistiques</Text>
//         <View style={styles.statsCard}>
//           <Text style={styles.statsLabel}>Mortalité moyenne:</Text>
//           <Text style={styles.statsValue}>{mockData.stats[category].avgMortality}</Text>
//         </View>
//         <View style={styles.statsCard}>
//           <Text style={styles.statsLabel}>Ventes totales:</Text>
//           <Text style={styles.statsValue}>{mockData.stats[category].totalSales} XAF</Text>
//         </View>
//       </View>

//       {/* Bouton d’exportation */}
//       <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
//         <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
//           <Icon name="picture-as-pdf" size={24} color={COLORS.white} />
//           <Text style={styles.exportButtonText}>Exporter en PDF</Text>
//         </TouchableOpacity>
//       </Animatable.View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   filtersContainer: {
//     padding: SIZES.padding,
//   },
//   dateButton: {
//     backgroundColor: COLORS.white,
//     padding: SIZES.padding,
//     borderRadius: SIZES.radius,
//     marginVertical: SIZES.margin / 2,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   dateButtonText: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.regular,
//     color: COLORS.text,
//   },
//   chartContainer: {
//     padding: SIZES.padding,
//   },
//   sectionTitle: {
//     fontSize: SIZES.fontTitle,
//     fontFamily: FONTS.bold,
//     color: COLORS.text,
//     marginBottom: SIZES.margin,
//   },
//   chart: {
//     borderRadius: SIZES.radius,
//     marginVertical: SIZES.margin,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   statsContainer: {
//     padding: SIZES.padding,
//   },
//   statsCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: SIZES.radius,
//     padding: SIZES.padding,
//     marginBottom: SIZES.margin,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   statsLabel: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.bold,
//     color: COLORS.text,
//   },
//   statsValue: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.regular,
//     color: COLORS.accent,
//   },
//   exportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.accent,
//     padding: SIZES.padding,
//     borderRadius: SIZES.radius,
//     margin: SIZES.margin,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   exportButtonText: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.bold,
//     color: COLORS.white,
//     marginLeft: SIZES.margin / 2,
//   },
// });

// export default AdvancedDashboardScreen;





import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import { COLORS } from '../styles/GlobalStyles';

// Assure-toi de remplacer 'animation.json' par le nom de ton fichier Lottie téléchargé  
const loadingAnimation = require('../../assets/empty.json');

const AdvancedDashboardScreen = () => {
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
          Les données seront bientôt disponibles
        </Text>

      </View>
    </SafeAreaView>
  );
};

export default AdvancedDashboardScreen;

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

// src/screens/ReportDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { RouteProp } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Données mock pour un rapport (à remplacer par API)
const mockReportDetails = {
  '1': {
    title: 'Mortalités Poulets',
    type: 'Poulets',
    period: 'Dernier mois',
    data: [
      { date: '2025-05-01', value: 20, note: 'Maladie' },
      { date: '2025-05-02', value: 15, note: 'Normal' },
      { date: '2025-05-03', value: 30, note: 'Chaleur' },
    ],
    chartData: {
      labels: ['01/05', '02/05', '03/05'],
      datasets: [
        {
          data: [20, 15, 30],
          color: () => COLORS.secondary,
          strokeWidth: 2,
        },
      ],
    },
  },
  '2': {
    title: 'Ventes Poissons',
    type: 'Poissons',
    period: 'Dernière semaine',
    data: [
      { date: '2025-05-06', value: 50000, note: 'Marché Local' },
      { date: '2025-05-07', value: 75000, note: 'Restaurant XYZ' },
    ],
    chartData: {
      labels: ['06/05', '07/05'],
      datasets: [
        {
          data: [50000, 75000],
          color: () => COLORS.accent,
          strokeWidth: 2,
        },
      ],
    },
  },
};

// Types pour les paramètres de navigation
type RootStackParamList = {
  ReportDetail: { reportId: string };
};

// Types pour les données du rapport
interface ReportData {
  date: string;
  value: number;
  note: string;
}

interface ReportDetail {
  title: string;
  type: string;
  period: string;
  data: ReportData[];
  chartData: {
    labels: string[];
    datasets: { data: number[]; color: () => string; strokeWidth: number }[];
  };
}

interface ReportDetailScreenProps {
  route: RouteProp<RootStackParamList, 'ReportDetail'>;
}

const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({ route }) => {
  const { reportId } = route.params;
  const report: ReportDetail | undefined = mockReportDetails[reportId];

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Rapport non trouvé</Text>
      </View>
    );
  }

  // Générer le HTML pour le PDF
  const generatePDF = async () => {
    try {
      const tableRows = report.data
        .map(
          (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.date}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.value}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.note}</td>
          </tr>
        `
        )
        .join('');

      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #0288D1; }
              h2 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <p><strong>Type:</strong> ${report.type}</p>
            <p><strong>Période:</strong> ${report.period}</p>
            <h2>Données Détaillées</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Valeur</th>
                <th>Note</th>
              </tr>
              ${tableRows}
            </table>
            <p><i>Note: Le graphique des tendances est disponible dans l'application mobile.</i></p>
          </body>
        </html>
      `;

      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Télécharger ou partager le PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger ou partager le rapport',
        });
      } else {
        console.log('Partage non disponible, PDF sauvegardé à:', uri);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // TODO: Afficher une alerte à l'utilisateur
    }
  };

  // Rendu de chaque ligne du tableau
  const renderTableRow = (item: ReportData, index: number) => (
    <Animatable.View
      key={index}
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      style={styles.tableRow}
    >
      <Text style={styles.tableCell}>{item.date}</Text>
      <Text style={styles.tableCell}>{item.value}</Text>
      <Text style={styles.tableCell}>{item.note}</Text>
    </Animatable.View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.subtitle}>Type: {report.type}</Text>
        <Text style={styles.subtitle}>Période: {report.period}</Text>
      </View>

      {/* Tableau */}
      <View style={styles.tableContainer}>
        <Text style={styles.sectionTitle}>Données Détaillées</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Valeur</Text>
          <Text style={styles.tableHeaderText}>Note</Text>
        </View>
        {report.data.map(renderTableRow)}
      </View>

      {/* Graphique */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Tendance</Text>
        <Animatable.View animation="bounceIn" duration={1000}>
          <LineChart
            data={report.chartData}
            width={Dimensions.get('window').width - SIZES.padding * 2}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: () => COLORS.textLight,
              labelColor: () => COLORS.text,
              style: {
                borderRadius: SIZES.radius,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Animatable.View>
      </View>

      {/* Bouton d'exportation */}
      <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={generatePDF}
          accessibilityLabel="Télécharger le rapport en PDF"
        >
          <Icon name="picture-as-pdf" size={24} color={COLORS.white} />
          <Text style={styles.exportButtonText}>Télécharger PDF</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  tableContainer: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin / 2,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin / 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableCell: {
    flex: 1,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  chartContainer: {
    padding: SIZES.padding,
  },
  chart: {
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  exportButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SIZES.margin / 2,
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default ReportDetailScreen;
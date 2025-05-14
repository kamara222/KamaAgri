// src/screens/BackupScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Données mock pour simuler les données de l'application (à remplacer par API)
const mockAppData = {
  lots: [
    { id: '1', name: 'Lot A1', count: 1000, date: '2025-05-01' },
    { id: '2', name: 'Lot B2', count: 1500, date: '2025-05-02' },
  ],
  bassins: [
    { id: '1', name: 'Bassin 1', capacity: 500, date: '2025-05-03' },
  ],
  stocks: [
    { id: '1', name: 'Aliments Poulets', quantity: 200, unit: 'kg' },
  ],
  rapports: [
    { id: '1', title: 'Mortalités Poulets', type: 'Poulets', period: 'Dernier mois' },
  ],
};

// Types pour une sauvegarde
interface Backup {
  id: string;
  date: string;
  size: string; // Taille en KB
  uri: string;
}

const BackupScreen: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les sauvegardes existantes au montage
  useEffect(() => {
    loadBackups();
  }, []);

  // Charger les fichiers de sauvegarde depuis le dossier de l'application
  const loadBackups = async () => {
    try {
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
      const files = await FileSystem.readDirectoryAsync(backupDir);
      const backupList = await Promise.all(
        files.map(async (file) => {
          const info = await FileSystem.getInfoAsync(`${backupDir}${file}`);
          return {
            id: file,
            date: new Date(info.modificationTime * 1000).toLocaleString('fr-FR'),
            size: ((info.size || 0) / 1024).toFixed(2) + ' KB',
            uri: `${backupDir}${file}`,
          };
        })
      );
      setBackups(backupList.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Erreur lors du chargement des sauvegardes:', error);
      Alert.alert('Erreur', 'Impossible de charger les sauvegardes.', [
        { text: 'OK', style: 'cancel' },
      ]);
    }
  };

  // Générer le contenu HTML pour le PDF
  const generatePDFContent = () => {
    const lotsTable = mockAppData.lots
      .map(
        (lot) => `
        <tr>
          <td>${lot.id}</td>
          <td>${lot.name}</td>
          <td>${lot.count}</td>
          <td>${lot.date}</td>
        </tr>`
      )
      .join('');
    const bassinsTable = mockAppData.bassins
      .map(
        (bassin) => `
        <tr>
          <td>${bassin.id}</td>
          <td>${bassin.name}</td>
          <td>${bassin.capacity}</td>
          <td>${bassin.date}</td>
        </tr>`
      )
      .join('');
    const stocksTable = mockAppData.stocks
      .map(
        (stock) => `
        <tr>
          <td>${stock.id}</td>
          <td>${stock.name}</td>
          <td>${stock.quantity}</td>
          <td>${stock.unit}</td>
        </tr>`
      )
      .join('');
    const rapportsTable = mockAppData.rapports
      .map(
        (rapport) => `
        <tr>
          <td>${rapport.id}</td>
          <td>${rapport.title}</td>
          <td>${rapport.type}</td>
          <td>${rapport.period}</td>
        </tr>`
      )
      .join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0288D1; text-align: center; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Sauvegarde des Données</h1>
          <h2>Lots</h2>
          <table>
            <tr><th>ID</th><th>Nom</th><th>Nombre</th><th>Date</th></tr>
            ${lotsTable}
          </table>
          <h2>Bassins</h2>
          <table>
            <tr><th>ID</th><th>Nom</th><th>Capacité</th><th>Date</th></tr>
            ${bassinsTable}
          </table>
          <h2>Stocks</h2>
          <table>
            <tr><th>ID</th><th>Nom</th><th>Quantité</th><th>Unité</th></tr>
            ${stocksTable}
          </table>
          <h2>Rapports</h2>
          <table>
            <tr><th>ID</th><th>Titre</th><th>Type</th><th>Période</th></tr>
            ${rapportsTable}
          </table>
        </body>
      </html>
    `;
  };

  // Exporter les données en PDF
  const exportData = async () => {
    setIsLoading(true);
    try {
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileUri = `${backupDir}backup_${timestamp}.pdf`;

      const { uri } = await Print.printToFileAsync({
        html: generatePDFContent(),
      });

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger ou partager la sauvegarde',
        });
        Alert.alert('Succès', 'Sauvegarde PDF exportée avec succès.', [
          { text: 'OK', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Succès', `Sauvegarde PDF créée à: ${fileUri}`, [
          { text: 'OK', style: 'cancel' },
        ]);
      }
      await loadBackups();
    } catch (error) {
      console.error('Erreur lors de l’exportation:', error);
      Alert.alert('Erreur', 'Impossible de créer la sauvegarde PDF.', [
        { text: 'OK', style: 'cancel' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Importer un fichier JSON
  const importData = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        setIsLoading(false);
        return;
      }

      const { uri } = result;
      const fileContent = await FileSystem.readAsStringAsync(uri);
      const importedData = JSON.parse(fileContent);

      // Validation basique des données importées
      if (
        !importedData.lots ||
        !importedData.bassins ||
        !importedData.stocks ||
        !importedData.rapports
      ) {
        throw new Error('Format de fichier invalide');
      }

      // TODO: Mettre à jour les données de l'application via API
      console.log('Données importées:', importedData);
      Alert.alert('Succès', 'Données JSON importées avec succès.', [
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Erreur lors de l’importation:', error);
      Alert.alert('Erreur', 'Impossible d’importer les données. Vérifiez le fichier JSON.', [
        { text: 'OK', style: 'cancel' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer l'importation
  const confirmImport = () => {
    Alert.alert(
      'Importer des données',
      'Cette action remplacera les données actuelles par un fichier JSON. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel', onPress: () => {} },
        {
          text: 'Confirmer',
          onPress: importData,
          style: 'default',
        },
      ]
    );
  };

  // Supprimer une sauvegarde (cliquez sur l’icône poubelle à droite de chaque carte)
  const deleteBackup = async (uri: string) => {
    Alert.alert(
      'Supprimer la sauvegarde',
      'Voulez-vous supprimer cette sauvegarde ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(uri);
              await loadBackups();
              Alert.alert('Succès', 'Sauvegarde supprimée.', [
                { text: 'OK', style: 'cancel' },
              ]);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la sauvegarde.', [
                { text: 'OK', style: 'cancel' },
              ]);
            }
          },
        },
      ]
    );
  };

  // Rendu de chaque sauvegarde
  const renderBackupItem = ({ item, index }: { item: Backup; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      style={styles.backupCard}
    >
      <View style={styles.cardHeader}>
        <Icon name="archive" size={30} color={COLORS.accent} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Sauvegarde du {item.date}</Text>
          <Text style={styles.cardDetail}>Taille: {item.size}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteBackup(item.uri)}
        accessibilityLabel="Supprimer la sauvegarde"
        accessibilityHint="Supprime cette sauvegarde de l’historique"
      >
        <Icon name="delete" size={26} color={COLORS.error} />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <Animatable.View animation="bounceIn" duration={1000} style={styles.header}>
        <Icon name="cloud" size={40} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Gestion des Sauvegardes</Text>
      </Animatable.View>

      {/* Boutons d’action */}
      <View style={styles.actionsContainer}>
        <Animatable.View animation="pulse" duration={2000} iterationCount="infinite">
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.disabledButton]}
            onPress={exportData}
            disabled={isLoading}
            accessibilityLabel="Exporter les données en PDF"
            accessibilityHint="Génère et partage un fichier PDF des données"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Icon name="cloud-download" size={24} color={COLORS.white} />
                <Text style={styles.actionButtonText} numberOfLines={1} ellipsizeMode="tail">
                  Exporter
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animatable.View>
        <Animatable.View animation="pulse" duration={2000} iterationCount="infinite" delay={200}>
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.disabledButton]}
            onPress={confirmImport}
            disabled={isLoading}
            accessibilityLabel="Importer des données JSON"
            accessibilityHint="Sélectionne un fichier JSON pour remplacer les données actuelles"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Icon name="cloud-upload" size={24} color={COLORS.white} />
                <Text style={styles.actionButtonText} numberOfLines={1} ellipsizeMode="tail">
                  Importer
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Liste des sauvegardes */}
      <Text style={styles.sectionTitle}>Historique des Sauvegardes</Text>
      <FlatList
        data={backups}
        renderItem={renderBackupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune sauvegarde disponible</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  headerTitle: {
    fontSize: SIZES.fontTitle + 2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: SIZES.margin,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius + 4,
    marginHorizontal: SIZES.margin / 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  actionButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SIZES.margin,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  backupCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius + 4,
    padding: SIZES.padding * 1.2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardText: {
    marginLeft: SIZES.margin,
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  cardDetail: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  deleteButton: {
    padding: SIZES.padding / 2,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default BackupScreen;
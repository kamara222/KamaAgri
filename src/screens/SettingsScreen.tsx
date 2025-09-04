// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import CustomSelect from '../components/CustomSelect';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';

// Données mock pour les utilisateurs et types (à remplacer par API)
const mockUsers = [
  { id: '1', name: 'Jean Dupont', email: 'jean@example.com', role: 'admin' },
  { id: '2', name: 'Marie Curie', email: 'marie@example.com', role: 'gestionnaire' },
  { id: '3', name: 'Paul Martin', email: 'paul@example.com', role: 'opérateur' },
];

const mockTypes = {
  aliments: ['Maïs', 'Soja'],
  races: ['Plymouth Rock', 'Rhode Island'],
  espèces: ['Tilapia', 'Carpe'],
};

// Types pour un utilisateur
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Types pour les paramètres généraux
interface GeneralSettings {
  stockAlertThreshold: number;
}

const SettingsScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filterRole, setFilterRole] = useState('');
  const [isAddUserModalVisible, setAddUserModalVisible] = useState(false);
  const [isAddTypeModalVisible, setAddTypeModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'opérateur',
    password: '',
  });
  const [newType, setNewType] = useState({ category: 'aliments', name: '' });
  const [settings, setSettings] = useState<GeneralSettings>({ stockAlertThreshold: 10 });
  const [thresholdInput, setThresholdInput] = useState(settings.stockAlertThreshold.toString());

  // Options pour les filtres de rôle
  const roles = [
    { label: 'Tous les rôles', value: '' },
    { label: 'Admin', value: 'admin' },
    { label: 'Gestionnaire', value: 'gestionnaire' },
    { label: 'Opérateur', value: 'opérateur' },
  ];

  // Options pour les catégories de types
  const typeCategories = [
    { label: 'Aliments', value: 'aliments' },
    { label: 'Races', value: 'races' },
    { label: 'Espèces', value: 'espèces' },
  ];

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(
    (user) => !filterRole || user.role === filterRole
  );

  // Ajouter ou modifier un utilisateur
  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email || (!editingUser && !newUser.password)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!editingUser && newUser.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (
      !editingUser &&
      users.some((user) => user.email === newUser.email)
    ) {
      Alert.alert('Erreur', 'Cet email est déjà utilisé.');
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...newUser, id: user.id } : user
        )
      );
    } else {
      setUsers([
        ...users,
        {
          id: (users.length + 1).toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      ]);
    }
    setAddUserModalVisible(false);
    setNewUser({ name: '', email: '', role: 'opérateur', password: '' });
    setEditingUser(null);
  };

  // Supprimer un utilisateur
  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter((user) => user.id !== userId));
          },
        },
      ]
    );
  };

  // Ajouter un type
  const handleAddType = () => {
    if (!newType.name) {
      Alert.alert('Erreur', 'Veuillez entrer un nom.');
      return;
    }
    // Simuler l’ajout (à remplacer par API)
    Alert.alert('Succès', `Type ${newType.name} ajouté à ${newType.category}.`);
    setAddTypeModalVisible(false);
    setNewType({ category: 'aliments', name: '' });
  };

  // Modifier le seuil d’alerte
  const handleSaveThreshold = () => {
    const threshold = parseInt(thresholdInput);
    if (isNaN(threshold) || threshold < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un seuil valide.');
      return;
    }
    setSettings({ stockAlertThreshold: threshold });
    Alert.alert('Succès', 'Seuil d’alerte mis à jour.');
  };

  // Rendu de chaque utilisateur
  const renderUserItem = ({ item }: { item: User }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.userCard}
    >
      <View style={styles.cardHeader}>
        <Icon name="person" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <Text style={styles.cardDetail}>Email: {item.email}</Text>
      <Text style={styles.cardDetail}>Rôle: {item.role}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingUser(item);
            setNewUser({
              name: item.name,
              email: item.email,
              role: item.role,
              password: '',
            });
            setAddUserModalVisible(true);
          }}
          accessibilityLabel={`Modifier l’utilisateur ${item.name}`}
          accessibilityHint="Ouvre un formulaire pour modifier les détails de l’utilisateur"
        >
          <Icon name="edit" size={24} color={COLORS.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item.id)}
          accessibilityLabel={`Supprimer l’utilisateur ${item.name}`}
          accessibilityHint="Supprime l’utilisateur de la liste"
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Gestion des utilisateurs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
        <CustomSelect
          options={roles}
          value={filterRole}
          onChange={setFilterRole}
          placeholder="Filtrer par rôle"
          style={styles.filterSelect}
        />
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun utilisateur</Text>
          }
          scrollEnabled={false} // Désactive le défilement de la FlatList
        />
        <Animatable.View animation="bounceIn" duration={1000}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditingUser(null);
              setNewUser({ name: '', email: '', role: 'opérateur', password: '' });
              setAddUserModalVisible(true);
            }}
            accessibilityLabel="Ajouter un nouvel utilisateur"
            accessibilityHint="Ouvre un formulaire pour ajouter un utilisateur"
          >
            <Icon name="person-add" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ajouter Utilisateur</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Paramètres généraux */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres Généraux</Text>
        {/* Modifier seuil d’alerte */}
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Seuil d’alerte des stocks (quantité)</Text>
          <TextInput
            style={styles.input}
            value={thresholdInput}
            onChangeText={setThresholdInput}
            keyboardType="numeric"
            placeholder="Entrez le seuil"
            accessibilityLabel="Seuil d’alerte des stocks"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveThreshold}
            accessibilityLabel="Enregistrer le seuil d’alerte"
          >
            <Text style={styles.saveButtonText}>Enregistrer Seuil</Text>
          </TouchableOpacity>
        </View>
        {/* Ajouter type */}
        <Animatable.View animation="bounceIn" duration={1000} delay={200}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setAddTypeModalVisible(true)}
            accessibilityLabel="Ajouter un nouveau type"
            accessibilityHint="Ouvre un formulaire pour ajouter un type (aliment, race, espèce)"
          >
            <Icon name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ajouter Type</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Modal pour ajouter/modifier utilisateur */}
      <Modal
        isVisible={isAddUserModalVisible}
        onBackdropPress={() => setAddUserModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
          </Text>
          <TextInput
            style={styles.input}
            value={newUser.name}
            onChangeText={(text) => setNewUser({ ...newUser, name: text })}
            placeholder="Nom"
            accessibilityLabel="Nom de l’utilisateur"
          />
          <TextInput
            style={styles.input}
            value={newUser.email}
            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            placeholder="Email/Identifiant"
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email de l’utilisateur"
          />
          <Picker
            selectedValue={newUser.role}
            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            style={styles.picker}
            accessibilityLabel="Rôle de l’utilisateur"
          >
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="Gestionnaire" value="gestionnaire" />
            <Picker.Item label="Opérateur" value="opérateur" />
          </Picker>
          <TextInput
            style={styles.input}
            value={newUser.password}
            onChangeText={(text) => setNewUser({ ...newUser, password: text })}
            placeholder={editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            secureTextEntry
            accessibilityLabel="Mot de passe de l’utilisateur"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAddUserModalVisible(false)}
              accessibilityLabel="Annuler"
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleSaveUser}
              accessibilityLabel="Enregistrer l’utilisateur"
            >
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour ajouter un type */}
      <Modal
        isVisible={isAddTypeModalVisible}
        onBackdropPress={() => setAddTypeModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter Type</Text>
          <Picker
            selectedValue={newType.category}
            onValueChange={(value) => setNewType({ ...newType, category: value })}
            style={styles.picker}
            accessibilityLabel="Catégorie du type"
          >
            <Picker.Item label="Aliments" value="aliments" />
            <Picker.Item label="Races" value="races" />
            <Picker.Item label="Espèces" value="espèces" />
          </Picker>
          <TextInput
            style={styles.input}
            value={newType.name}
            onChangeText={(text) => setNewType({ ...newType, name: text })}
            placeholder="Nom du type"
            accessibilityLabel="Nom du type"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAddTypeModalVisible(false)}
              accessibilityLabel="Annuler"
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleAddType}
              accessibilityLabel="Enregistrer le type"
            >
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 2,
  },
  section: {
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  listContainer: {
    paddingBottom: SIZES.padding,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: SIZES.margin / 2,
    flex: 1,
  },
  cardDetail: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SIZES.margin / 2,
  },
  editButton: {
    padding: SIZES.padding / 2,
    marginRight: SIZES.margin / 2,
  },
  deleteButton: {
    padding: SIZES.padding / 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SIZES.margin / 2,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  formLabel: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  filterSelect: {
    marginBottom: SIZES.margin,
  },
  modal: {
    justifyContent: 'center',
    margin: SIZES.margin,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  modalTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin / 2,
    backgroundColor: COLORS.textLight,
  },
  modalButtonSave: {
    backgroundColor: COLORS.accent,
  },
  modalButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default SettingsScreen;
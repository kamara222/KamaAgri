// // src/screens/SettingsScreen.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as Animatable from 'react-native-animatable';
// import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
// import CustomSelect from '../components/CustomSelect';
// import AddUserModal from '../components/AddUserModal';

// // Données mock pour le profil et les utilisateurs (à remplacer par API)
// const mockUser = {
//   name: 'Jean Dupont',
//   email: 'jean.dupont@example.com',
//   role: 'Admin',
// };

// const mockUsers = [
//   { id: '1', name: 'Marie Curie', email: 'marie.curie@example.com', role: 'Utilisateur' },
//   { id: '2', name: 'Pierre Martin', email: 'pierre.martin@example.com', role: 'Admin' },
// ];

// // Types pour un utilisateur
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// const SettingsScreen: React.FC = () => {
//   const [currency, setCurrency] = useState('XAF');
//   const [language, setLanguage] = useState('fr');
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   // Options pour les préférences
//   const currencies = [
//     { label: 'XAF', value: 'XAF' },
//     { label: 'EUR', value: 'EUR' },
//     { label: 'USD', value: 'USD' },
//   ];
//   const languages = [
//     { label: 'Français', value: 'fr' },
//     { label: 'Anglais', value: 'en' },
//   ];

//   // Rendu de chaque utilisateur
//   const renderUserItem = ({ item }: { item: User }) => (
//     <Animatable.View animation="fadeInUp" duration={500} style={styles.userCard}>
//       <View style={styles.cardHeader}>
//         <Icon name="person" size={28} color={COLORS.accent} />
//         <Text style={styles.cardTitle}>{item.name}</Text>
//       </View>
//       <Text style={styles.cardDetail}>Email: {item.email}</Text>
//       <Text style={styles.cardDetail}>Rôle: {item.role}</Text>
//       <TouchableOpacity
//         style={styles.deleteButton}
//         onPress={() => console.log('Supprimer utilisateur', item.id)}
//       >
//         <Icon name="delete" size={24} color={COLORS.error} />
//       </TouchableOpacity>
//     </Animatable.View>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       {/* Profil utilisateur */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Profil Utilisateur</Text>
//         <Animatable.View animation="fadeInUp" duration={500}>
//           <View style={styles.card}>
//             <Text style={styles.cardDetail}>Nom: {mockUser.name}</Text>
//             <Text style={styles.cardDetail}>Email: {mockUser.email}</Text>
//             <Text style={styles.cardDetail}>Rôle: {mockUser.role}</Text>
//           </View>
//         </Animatable.View>
//       </View>

//       {/* Préférences */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Préférences</Text>
//         <View style={styles.card}>
//           <Text style={styles.cardDetail}>Devise</Text>
//           <CustomSelect
//             options={currencies}
//             value={currency}
//             onChange={setCurrency}
//             placeholder="Choisir une devise"
//           />
//           <Text style={styles.cardDetail}>Langue</Text>
//           <CustomSelect
//             options={languages}
//             value={language}
//             onChange={setLanguage}
//             placeholder="Choisir une langue"
//           />
//         </View>
//       </View>

//       {/* Gestion des utilisateurs (pour admins) */}
//       {mockUser.role === 'Admin' && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
//           <FlatList
//             data={mockUsers}
//             renderItem={renderUserItem}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContainer}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>Aucun utilisateur</Text>
//             }
//           />
//           <Animatable.View animation="bounceIn" duration={1000}>
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() => setIsModalVisible(true)}
//             >
//               <Icon name="add" size={24} color={COLORS.white} />
//               <Text style={styles.addButtonText}>Ajouter Utilisateur</Text>
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>
//       )}

//       {/* Modal pour ajouter un utilisateur */}
//       <AddUserModal
//         isVisible={isModalVisible}
//         onClose={() => setIsModalVisible(false)}
//         onSubmit={(user) => {
//           console.log('Nouvel utilisateur:', user);
//           setIsModalVisible(false);
//           // TODO: Envoyer au backend
//         }}
//       />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   section: {
//     padding: SIZES.padding,
//   },
//   sectionTitle: {
//     fontSize: SIZES.fontTitle,
//     fontFamily: FONTS.bold,
//     color: COLORS.text,
//     marginBottom: SIZES.margin,
//   },
//   card: {
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
//   userCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: SIZES.radius,
//     padding: SIZES.padding,
//     marginBottom: SIZES.margin,
//     shadowColor: COLORS.text,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     position: 'relative',
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
//     marginBottom: 8,
//   },
//   deleteButton: {
//     position: 'absolute',
//     top: SIZES.padding,
//     right: SIZES.padding,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.accent,
//     padding: SIZES.padding,
//     borderRadius: SIZES.radius,
//     marginTop: SIZES.margin,
//   },
//   addButtonText: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.bold,
//     color: COLORS.white,
//     marginLeft: SIZES.margin / 2,
//   },
//   listContainer: {
//     paddingBottom: SIZES.padding,
//   },
//   emptyText: {
//     fontSize: SIZES.fontMedium,
//     fontFamily: FONTS.regular,
//     color: COLORS.textLight,
//     textAlign: 'center',
//     marginTop: SIZES.margin,
//   },
// });

// export default SettingsScreen;






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
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newUser.password.length < 8) {
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
      >
        <Icon name="edit" size={24} color={COLORS.accent} />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Gestion des utilisateurs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
        <CustomSelect
          options={roles}
          value={filterRole}
          onChange={setFilterRole}
          placeholder="Filtrer par rôle"
        />
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun utilisateur</Text>
          }
        />
        <Animatable.View animation="bounceIn" duration={1000}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditingUser(null);
              setNewUser({ name: '', email: '', role: 'opérateur', password: '' });
              setAddUserModalVisible(true);
            }}
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
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveThreshold}
          >
            <Text style={styles.saveButtonText}>Enregistrer Seuil</Text>
          </TouchableOpacity>
        </View>
        {/* Ajouter type */}
        <Animatable.View animation="bounceIn" duration={1000} delay={200}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setAddTypeModalVisible(true)}
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
          />
          <TextInput
            style={styles.input}
            value={newUser.email}
            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            placeholder="Email/Identifiant"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Picker
            selectedValue={newUser.role}
            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            style={styles.picker}
          >
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="Gestionnaire" value="gestionnaire" />
            <Picker.Item label="Opérateur" value="opérateur" />
          </Picker>
          <TextInput
            style={styles.input}
            value={newUser.password}
            onChangeText={(text) => setNewUser({ ...newUser, password: text })}
            placeholder="Mot de passe"
            secureTextEntry
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAddUserModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleSaveUser}
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
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAddTypeModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleAddType}
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
    position: 'relative',
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
  },
  cardDetail: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4,
  },
  editButton: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
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
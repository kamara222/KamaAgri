import React, { useState, useEffect } from 'react';
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
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useUsers, useCreateUser, useDeleteUser, useRoleServices, useAssignRoleServices } from '../services';
import Toast from 'react-native-toast-message';

// Interfaces
interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  numeroTelephone: string;
  role: {
    code: string;
    nom: string;
  };
}

interface Service {
  code: string;
  name: string;
}

interface RoleServiceData {
  roleServices: string[];
  services: Service[];
}

const SettingsScreen: React.FC = () => {
  // États pour les onglets
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  // États pour la gestion des utilisateurs
  const [isAddUserModalVisible, setAddUserModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'OPER',
    numeroTelephone: '',
  });
  const [lastCreatedUserId, setLastCreatedUserId] = useState<string | null>(null);

  // États pour la gestion des rôles et services
  const [isRoleServiceModalVisible, setRoleServiceModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Hooks React Query
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();
  const assignRoleServicesMutation = useAssignRoleServices();
  const { data: roleServicesData, isLoading: isServicesLoading } = useRoleServices(
    selectedUser?.role.code || '',
    !!selectedUser
  );

  // Synchroniser selectedServices avec roleServicesData.roleServices, sauf pour les nouveaux utilisateurs
  useEffect(() => {
    if (roleServicesData?.roleServices && !isServicesLoading && selectedUser?.id !== lastCreatedUserId) {
      console.log('Mise à jour de selectedServices pour le rôle', selectedUser?.role.code, ':', roleServicesData.roleServices);
      setSelectedServices(roleServicesData.roleServices);
    } else if (selectedUser?.id === lastCreatedUserId) {
      console.log('Nouvel utilisateur détecté, selectedServices reste vide:', []);
      setSelectedServices([]);
    }
  }, [roleServicesData, isServicesLoading, selectedUser?.id, selectedUser?.role.code, lastCreatedUserId]);

  // Options des rôles
  const roles = [
    { code: 'ADMIN', nom: 'Administrateur', description: "Administrateur de l'application" },
    { code: 'GEST', nom: 'Gestionnaire', description: "Gestionnaire de l'application" },
    { code: 'OPER', nom: 'Opérateur', description: "Opérateur de l'application" },
  ];

  // Créer un utilisateur
  const handleCreateUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.password || !newUser.numeroTelephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newUser.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      const response = await createUserMutation.mutateAsync({
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        numeroTelephone: newUser.numeroTelephone,
      });

      // Supposons que l'API renvoie l'ID du nouvel utilisateur dans response.id
      setLastCreatedUserId(response.id);
      console.log('Nouvel utilisateur créé avec ID:', response.id);

      Toast.show({
        type: 'successToast',
        props: { message: 'Utilisateur créé avec succès.' },
      });
      setAddUserModalVisible(false);
      setNewUser({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'OPER',
        numeroTelephone: '',
      });
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      Toast.show({
        type: 'errorToast',
        props: { message: error.response?.data?.message || 'Échec de la création.' },
      });
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous vraiment supprimer l'utilisateur ${user.prenom} ${user.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserMutation.mutateAsync(user.id);
              Toast.show({
                type: 'successToast',
                props: { message: 'Utilisateur supprimé avec succès.' },
              });
              if (user.id === lastCreatedUserId) {
                setLastCreatedUserId(null);
              }
            } catch (error: any) {
              console.error('Erreur lors de la suppression:', error);
              Toast.show({
                type: 'errorToast',
                props: { message: error.response?.data?.message || 'Échec de la suppression.' },
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Attribuer des services à un utilisateur
  const handleAssignServices = async () => {
    if (!selectedUser) return;

    try {
      await assignRoleServicesMutation.mutateAsync({
        roleId: selectedUser.role.code,
        services: selectedServices,
      });

      Toast.show({
        type: 'successToast',
        props: { message: 'Services attribués avec succès.' },
      });
      setRoleServiceModalVisible(false);
      setSelectedUser(null);
      setSelectedServices([]);
      if (selectedUser.id === lastCreatedUserId) {
        setLastCreatedUserId(null);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'attribution:', error);
      Toast.show({
        type: 'errorToast',
        props: { message: error.response?.data?.message || 'Échec de l\'attribution.' },
      });
    }
  };

  // Toggle service selection
  const toggleServiceSelection = (serviceCode: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceCode)
        ? prev.filter((code) => code !== serviceCode)
        : [...prev, serviceCode]
    );
  };

  // Rendu de chaque utilisateur
  const renderUserItem = ({ item }: { item: User }) => (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.userCard}>
      <View style={styles.cardHeader}>
        <Icon name="person" size={28} color={COLORS.accent} />
        <Text style={styles.cardTitle}>{`${item.prenom} ${item.nom}`}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item)}
          accessibilityLabel={`Supprimer ${item.prenom} ${item.nom}`}
          accessibilityHint="Ouvre une modale pour confirmer la suppression de l'utilisateur"
        >
          <Icon name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDetail}>Email: {item.email}</Text>
      <Text style={styles.cardDetail}>Téléphone: {item.numeroTelephone}</Text>
      <Text style={styles.cardDetail}>Rôle: {item.role?.nom || 'N/A'}</Text>
      
      {activeTab === 'roles' && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => {
            setSelectedUser(item);
            setSelectedServices([]); // Réinitialiser les services sélectionnés
            setRoleServiceModalVisible(true);
            console.log('Utilisateur sélectionné pour attribution de services:', item.id, item.role.code);
          }}
        >
          <Icon name="settings" size={20} color={COLORS.white} />
          <Text style={styles.assignButtonText}>Attribuer Services</Text>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Icon name="person-add" size={24} color={activeTab === 'users' ? COLORS.accent : COLORS.textLight} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Créer Utilisateur
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'roles' && styles.activeTab]}
          onPress={() => setActiveTab('roles')}
        >
          <Icon name="security" size={24} color={activeTab === 'roles' ? COLORS.accent : COLORS.textLight} />
          <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>
            Rôles & Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu selon l'onglet actif */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'users' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
            
            <Animatable.View animation="bounceIn" duration={1000}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setAddUserModalVisible(true)}
              >
                <Icon name="person-add" size={24} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Ajouter Utilisateur</Text>
              </TouchableOpacity>
            </Animatable.View>

            {isUsersLoading ? (
              <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
            ) : (
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucun utilisateur</Text>}
                scrollEnabled={false}
              />
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attribution des Rôles et Services</Text>
            <Text style={styles.sectionSubtitle}>
              Sélectionnez un utilisateur pour lui attribuer des services
            </Text>

            {isUsersLoading ? (
              <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
            ) : (
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucun utilisateur</Text>}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal pour ajouter un utilisateur */}
      <Modal
        isVisible={isAddUserModalVisible}
        onBackdropPress={() => setAddUserModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter Utilisateur</Text>
          
          <TextInput
            style={styles.input}
            value={newUser.nom}
            onChangeText={(text) => setNewUser({ ...newUser, nom: text })}
            placeholder="Nom"
          />
          
          <TextInput
            style={styles.input}
            value={newUser.prenom}
            onChangeText={(text) => setNewUser({ ...newUser, prenom: text })}
            placeholder="Prénom"
          />
          
          <TextInput
            style={styles.input}
            value={newUser.email}
            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            value={newUser.numeroTelephone}
            onChangeText={(text) => setNewUser({ ...newUser, numeroTelephone: text })}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
          />
          
          <Picker
            selectedValue={newUser.role}
            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            style={styles.picker}
          >
            {roles.map((role) => (
              <Picker.Item key={role.code} label={role.nom} value={role.code} />
            ))}
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
              onPress={handleCreateUser}
            >
              <Text style={styles.modalButtonText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour attribuer des services */}
      <Modal
        isVisible={isRoleServiceModalVisible}
        onBackdropPress={() => setRoleServiceModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Attribuer Services</Text>
          
          {selectedUser && (
            <Text style={styles.modalSubtitle}>
              Utilisateur: {selectedUser.prenom} {selectedUser.nom} (Rôle: {selectedUser.role.nom})
            </Text>
          )}

          {isServicesLoading ? (
            <Text style={styles.loadingText}>Chargement des services pour le rôle {selectedUser?.role.code}...</Text>
          ) : (
            <ScrollView style={styles.servicesContainer}>
              {(roleServicesData?.services || []).map((service) => (
                <TouchableOpacity
                  key={service.code}
                  style={styles.serviceItem}
                  onPress={() => toggleServiceSelection(service.code)}
                >
                  <Icon
                    name={selectedServices.includes(service.code) ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={selectedServices.includes(service.code) ? COLORS.accent : COLORS.textLight}
                  />
                  <Text style={styles.serviceName}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setRoleServiceModalVisible(false);
                setSelectedUser(null);
                setSelectedServices([]);
              }}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleAssignServices}
              disabled={isServicesLoading}
            >
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  activeTabText: {
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 2,
  },
  section: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  sectionSubtitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: SIZES.margin,
  },
  listContainer: {
    paddingTop: SIZES.padding,
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
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin / 2,
    justifyContent: 'center',
  },
  assignButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SIZES.margin / 2,
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
    marginBottom: SIZES.margin,
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
  modal: {
    justifyContent: 'center',
    margin: SIZES.margin,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: SIZES.margin,
    textAlign: 'center',
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
  picker: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  servicesContainer: {
    maxHeight: 300,
    marginBottom: SIZES.margin,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  serviceName: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: SIZES.margin / 2,
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
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
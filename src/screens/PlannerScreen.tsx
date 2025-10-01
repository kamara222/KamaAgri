import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomSelect from '../components/CustomSelect';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import { useEvents, useCreateEvent, useDeleteEvent } from '../services';
import Toast from 'react-native-toast-message';

// Interface pour un événement
interface Event {
  id: string;
  type: string;
  detail: string;
  date: string;
}

const PlannerScreen: React.FC = () => {
  const { data: events, isLoading, isError } = useEvents();
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();
  const [filterType, setFilterType] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    type: 'vaccination',
    date: new Date(),
    detail: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Options pour les filtres
  const eventTypes = [
    { label: 'Tous les types', value: '' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Traitement', value: 'traitement' },
    { label: 'Vente', value: 'vente' },
  ];

  // Filtrer les événements
  const filteredEvents = events?.filter(
    (event) => !filterType || event.type === filterType
  ) || [];

  // Ajouter ou modifier un événement
  const handleSaveEvent = () => {
    if (!newEvent.detail) {
      Alert.alert('Erreur', 'Veuillez remplir le champ détails.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    const eventData = {
      type: newEvent.type,
      detail: newEvent.detail,
      date: newEvent.date.toISOString().split('T')[0],
    };

    createEvent(eventData, {
      onSuccess: () => {
        Toast.show({
          type: 'successToast',
          props: { message: editingEvent ? 'Événement modifié avec succès' : 'Événement créé avec succès' },
        });
        setModalVisible(false);
        setNewEvent({
          type: 'vaccination',
          date: new Date(),
          detail: '',
        });
        setEditingEvent(null);
      },
      onError: (error: any) => {
        Toast.show({
          type: 'errorToast',
          props: { message: 'Erreur lors de l\'enregistrement de l\'événement' },
        });
        console.error('Erreur lors de l\'enregistrement:', error);
      },
    });
  };

  // Supprimer un événement
  const handleDeleteEvent = (id: string) => {
    Alert.alert(
      'Supprimer l’événement',
      'Voulez-vous supprimer cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteEvent(id, {
              onSuccess: () => {
                Toast.show({
                  type: 'successToast',
                  props: { message: 'Événement supprimé avec succès' },
                });
              },
              onError: (error: any) => {
                Toast.show({
                  type: 'errorToast',
                  props: { message: 'Erreur lors de la suppression de l\'événement' },
                });
                console.error('Erreur lors de la suppression:', error);
              },
            });
          },
        },
      ]
    );
  };

  // Couleur du badge selon le type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return COLORS.accent;
      case 'traitement':
        return COLORS.secondary;
      case 'vente':
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  // Rendu de chaque événement
  const renderEventItem = ({ item, index }: { item: Event; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      style={styles.eventCard}
    >
      <View style={styles.cardHeader}>
        <Icon
          name={
            item.type === 'vaccination'
              ? 'medical-services'
              : item.type === 'traitement'
              ? 'healing'
              : 'shopping-cart'
          }
          size={30}
          color={COLORS.accent}
        />
        <View style={styles.cardText}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.type.toUpperCase()}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeBadgeColor(item.type) },
              ]}
            >
              <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.cardDetail}>Date: {item.date}</Text>
          <Text style={styles.cardDetail}>Détails: {item.detail}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingEvent(item);
            setNewEvent({
              type: item.type,
              date: new Date(item.date),
              detail: item.detail,
            });
            setModalVisible(true);
          }}
          accessibilityLabel="Modifier l’événement"
          accessibilityHint="Ouvre le formulaire pour modifier cet événement"
        >
          <Icon name="edit" size={24} color={COLORS.accent} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteEvent(item.id)}
          accessibilityLabel="Supprimer l’événement"
          accessibilityHint="Supprime cet événement du planificateur"
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <Animatable.View animation="bounceIn" duration={1000} style={styles.header}>
        <Icon name="event" size={40} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Planificateur</Text>
      </Animatable.View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <CustomSelect
          options={eventTypes}
          value={filterType}
          onChange={setFilterType}
          placeholder="Filtrer par type"
        />
      </View>

      {/* Liste des événements */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur lors du chargement des événements.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun événement planifié</Text>
          }
        />
      )}

      {/* Bouton d’ajout */}
      <Animatable.View animation="pulse" duration={2000} iterationCount="infinite">
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingEvent(null);
            setNewEvent({
              type: 'vaccination',
              date: new Date(),
              detail: '',
            });
            setModalVisible(true);
          }}
          accessibilityLabel="Ajouter un événement"
          accessibilityHint="Ouvre le formulaire pour ajouter un nouvel événement"
        >
          <Icon name="add-circle" size={28} color={COLORS.white} />
          <Text style={styles.addButtonText}>Ajouter Événement</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Modal pour ajouter/modifier */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingEvent ? 'Modifier Événement' : 'Ajouter Événement'}
          </Text>
          <Picker
            selectedValue={newEvent.type}
            onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
            style={styles.picker}
          >
            <Picker.Item label="Vaccination" value="vaccination" />
            <Picker.Item label="Traitement" value="traitement" />
            <Picker.Item label="Vente" value="vente" />
          </Picker>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              Date: {newEvent.date.toLocaleDateString('fr-FR')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newEvent.date}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setNewEvent({ ...newEvent, date });
              }}
            />
          )}
          <TextInput
            style={styles.input}
            value={newEvent.detail}
            onChangeText={(text) => setNewEvent({ ...newEvent, detail: text })}
            placeholder="Détails"
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleSaveEvent}
            >
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filtersContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius + 4,
    padding: SIZES.padding * 1.2,
    paddingRight: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: SIZES.margin,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius,
  },
  typeBadgeText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  cardDetail: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: SIZES.padding / 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius + 4,
    margin: SIZES.padding,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginLeft: SIZES.margin / 1.5,
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
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  dateButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    minHeight: 100,
    textAlignVertical: 'top',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default PlannerScreen;
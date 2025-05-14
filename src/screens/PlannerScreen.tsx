// src/screens/PlannerScreen.tsx
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

// Données mock pour les événements et lots/bassins (à remplacer par API)
const mockEvents = [
  {
    id: '1',
    type: 'vaccination',
    date: '2025-05-15',
    details: 'Vaccination contre la grippe aviaire',
    target: 'Lot A1',
  },
  {
    id: '2',
    type: 'traitement',
    date: '2025-05-16',
    details: 'Traitement antibiotique',
    target: 'Bassin 1',
  },
];

const mockTargets = [
  { label: 'Lot A1', value: 'Lot A1' },
  { label: 'Lot B2', value: 'Lot B2' },
  { label: 'Bassin 1', value: 'Bassin 1' },
];

// Types pour un événement
interface Event {
  id: string;
  type: string;
  date: string;
  details: string;
  target: string;
}

const PlannerScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filterType, setFilterType] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    type: 'vaccination',
    date: new Date(),
    details: '',
    target: mockTargets[0].value,
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
  const filteredEvents = events.filter(
    (event) => !filterType || event.type === filterType
  );

  // Ajouter ou modifier un événement
  const handleSaveEvent = () => {
    if (!newEvent.details || !newEvent.target) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.', [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    const eventData = {
      id: editingEvent ? editingEvent.id : (events.length + 1).toString(),
      type: newEvent.type,
      date: newEvent.date.toISOString().split('T')[0],
      details: newEvent.details,
      target: newEvent.target,
    };

    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? eventData : e)));
    } else {
      setEvents([...events, eventData]);
    }
    setModalVisible(false);
    setNewEvent({
      type: 'vaccination',
      date: new Date(),
      details: '',
      target: mockTargets[0].value,
    });
    setEditingEvent(null);
  };

  // Supprimer un événement
  const deleteEvent = (id: string) => {
    Alert.alert(
      'Supprimer l’événement',
      'Voulez-vous supprimer cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setEvents(events.filter((e) => e.id !== id));
            Alert.alert('Succès', 'Événement supprimé.', [
              { text: 'OK', style: 'cancel' },
            ]);
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
            <Text style={styles.cardTitle}>{item.target}</Text>
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
          <Text style={styles.cardDetail}>Détails: {item.details}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingEvent(item);
            setNewEvent({
              type: item.type,
              date: new Date(item.date),
              details: item.details,
              target: item.target,
            });
            setModalVisible(true);
          }}
          accessibilityLabel="Modifier l’événement"
          accessibilityHint="Ouvre le formulaire pour modifier cet événement"
        >
          <Icon name="edit" size={24} color={COLORS.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteEvent(item.id)}
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
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun événement planifié</Text>
        }
      />

      {/* Bouton d’ajout */}
      <Animatable.View animation="pulse" duration={2000} iterationCount="infinite">
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingEvent(null);
            setNewEvent({
              type: 'vaccination',
              date: new Date(),
              details: '',
              target: mockTargets[0].value,
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
          <Picker
            selectedValue={newEvent.target}
            onValueChange={(value) => setNewEvent({ ...newEvent, target: value })}
            style={styles.picker}
          >
            {mockTargets.map((target) => (
              <Picker.Item
                key={target.value}
                label={target.label}
                value={target.value}
              />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            value={newEvent.details}
            onChangeText={(text) => setNewEvent({ ...newEvent, details: text })}
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
});

export default PlannerScreen;
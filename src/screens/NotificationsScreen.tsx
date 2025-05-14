// src/screens/NotificationsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import CustomSelect from '../components/CustomSelect';

// Données mock pour les notifications (à remplacer par API)
const mockNotifications = [
  {
    id: '1',
    type: 'Stocks',
    message: 'Stock d’aliments pour poulets en dessous du seuil (50 kg).',
    date: '2025-05-12',
    read: false,
  },
  {
    id: '2',
    type: 'Mortalités',
    message: 'Taux de mortalité élevé dans le lot A1 (5%).',
    date: '2025-05-11',
    read: true,
  },
  {
    id: '3',
    type: 'Ventes',
    message: 'Hausse inhabituelle des ventes de poissons (+30%).',
    date: '2025-05-10',
    read: false,
  },
  {
    id: '4',
    type: 'Tâches',
    message: 'Rappel : Maintenance des bassins prévue demain.',
    date: '2025-05-09',
    read: false,
  },
];

// Types pour une notification
interface Notification {
  id: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

const NotificationsScreen: React.FC = () => {
  const [filterType, setFilterType] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);

  // Options pour les filtres
  const types = [
    { label: 'Tous les types', value: '' },
    { label: 'Stocks', value: 'Stocks' },
    { label: 'Mortalités', value: 'Mortalités' },
    { label: 'Ventes', value: 'Ventes' },
    { label: 'Tâches', value: 'Tâches' },
  ];

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(
    (notification) => !filterType || notification.type === filterType
  );

  // Marquer comme lu/non lu
  const toggleReadStatus = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification
      )
    );
  };

  // Rendu de chaque notification
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
    >
      <View style={styles.cardHeader}>
        <Icon
          name={
            item.type === 'Stocks'
              ? 'inventory'
              : item.type === 'Mortalités'
              ? 'warning'
              : item.type === 'Ventes'
              ? 'shopping-cart'
              : 'event'
          }
          size={28}
          color={COLORS.accent}
        />
        <Text style={styles.cardTitle}>{item.type}</Text>
      </View>
      <Text style={styles.cardMessage}>{item.message}</Text>
      <Text style={styles.cardDate}>Date: {item.date}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => toggleReadStatus(item.id)}
      >
        <Icon
          name={item.read ? 'mark-email-unread' : 'mark-email-read'}
          size={24}
          color={COLORS.accent}
        />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <CustomSelect
          options={types}
          value={filterType}
          onChange={setFilterType}
          placeholder="Filtrer par type"
        />
      </View>

      {/* Liste des notifications */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune notification</Text>
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
  filterContainer: {
    padding: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  notificationCard: {
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
  unreadCard: {
    borderLeftWidth: 5,
    borderLeftColor: COLORS.accent,
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
  cardMessage: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  actionButton: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});

export default NotificationsScreen;
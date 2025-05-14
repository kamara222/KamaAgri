// src/screens/PhotoGalleryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSelect from '../components/CustomSelect';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import uuid from 'react-native-uuid';

// Interface pour une photo
interface Photo {
  id: string;
  uri: string;
  category: string;
  date: string;
}

const PhotoGalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newPhotoCategory, setNewPhotoCategory] = useState('');
  const [newPhotoUri, setNewPhotoUri] = useState(''); // Stocke l'URI temporairement

  // Options pour le filtre et la catégorie
  const categoryOptions = [
    { label: 'Tous', value: '' },
    { label: 'Poulets', value: 'Poulets' },
    { label: 'Poissons', value: 'Poissons' },
    { label: 'Autre', value: 'Autre' },
  ];

  // Charger les photos depuis AsyncStorage
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const storedPhotos = await AsyncStorage.getItem('photos');
        if (storedPhotos) {
          setPhotos(JSON.parse(storedPhotos));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des photos:', error);
      }
    };
    loadPhotos();
  }, []);

  // Sauvegarder les photos dans AsyncStorage
  const savePhotos = async (updatedPhotos: Photo[]) => {
    try {
      await AsyncStorage.setItem('photos', JSON.stringify(updatedPhotos));
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des photos:', error);
    }
  };

  // Demander les permissions pour la caméra et la galerie
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  // Ajouter une photo
  const addPhoto = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Erreur', 'Permissions caméra ou galerie non accordées.');
      return;
    }

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets?.[0]?.uri) {
      setNewPhotoUri(result.assets[0].uri);
      setIsAddModalVisible(true);
    }
  };

  // Confirmer l’ajout de la photo
  const confirmAddPhoto = async () => {
    if (!newPhotoCategory) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie.');
      return;
    }

    const newPhoto: Photo = {
      id: uuid.v4() as string,
      uri: newPhotoUri,
      category: newPhotoCategory,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedPhotos = [...photos, newPhoto];
    await savePhotos(updatedPhotos);
    setIsAddModalVisible(false);
    setNewPhotoCategory('');
    setNewPhotoUri('');
  };

  // Supprimer une photo
  const deletePhoto = (id: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedPhotos = photos.filter((photo) => photo.id !== id);
            await savePhotos(updatedPhotos);
          },
        },
      ]
    );
  };

  // Filtrer les photos
  const filteredPhotos = photos.filter(
    (photo) => !filterCategory || photo.category === filterCategory
  );

  // Rendu de chaque photo
  const renderPhotoItem = ({ item, index }: { item: Photo; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      style={styles.photoCard}
    >
      <TouchableOpacity
        onPress={() => setSelectedPhoto(item)}
        onLongPress={() => deletePhoto(item.id)}
        accessibilityLabel={`Voir la photo ${item.category} du ${item.date}`}
        accessibilityHint="Appuyez pour voir en plein écran, appuyez longtemps pour supprimer"
      >
        <Image source={{ uri: item.uri }} style={styles.photoImage} />
        <View style={styles.photoInfo}>
          <Text style={styles.photoCategory}>{item.category}</Text>
          <Text style={styles.photoDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* En-tête */}
      <Animatable.View animation="bounceIn" duration={1000} style={styles.header}>
        <Icon name="photo-camera" size={28} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Galerie Photo</Text>
      </Animatable.View>

      {/* Filtre */}
      <Animatable.View animation="bounceIn" duration={1000} style={styles.filterContainer}>
        <CustomSelect
          options={categoryOptions}
          value={filterCategory}
          onChange={setFilterCategory}
          placeholder="Filtrer par catégorie"
          style={styles.filterSelect}
        />
      </Animatable.View>

      {/* Boutons d’ajout */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addPhoto('camera')}
          accessibilityLabel="Prendre une photo"
          accessibilityHint="Ouvre la caméra pour ajouter une photo"
        >
          <Icon name="camera-alt" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addPhoto('library')}
          accessibilityLabel="Choisir une photo"
          accessibilityHint="Ouvre la galerie pour sélectionner une photo"
        >
          <Icon name="photo-library" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Galerie</Text>
        </TouchableOpacity>
      </View>

      {/* Grille de photos */}
      <FlatList
        data={filteredPhotos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.photoList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune photo disponible</Text>
        }
        scrollEnabled={false}
        nestedScrollEnabled
      />

      {/* Modal pour visualiser la photo */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPhoto(null)}
            accessibilityLabel="Fermer la photo"
            accessibilityHint="Ferme la visualisation en plein écran"
          >
            <Icon name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Modal pour sélectionner la catégorie */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsAddModalVisible(false);
          setNewPhotoUri('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une photo</Text>
            <CustomSelect
              options={categoryOptions.slice(1)} // Exclure "Tous"
              value={newPhotoCategory}
              onChange={setNewPhotoCategory}
              placeholder="Sélectionner une catégorie"
              style={styles.modalSelect}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.textLight }]}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewPhotoUri('');
                }}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.accent }]}
                onPress={confirmAddPhoto}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.white }]}>
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight,
  },
  headerTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.margin,
  },
  filterContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  filterSelect: {
    padding: SIZES.padding / 2,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginVertical: SIZES.margin,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin / 2,
  },
  addButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginLeft: SIZES.margin / 2,
  },
  photoList: {
    paddingHorizontal: SIZES.padding,
  },
  photoCard: {
    flex: 1,
    margin: SIZES.margin / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
  },
  photoInfo: {
    padding: SIZES.padding / 2,
  },
  photoCategory: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  photoDate: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
  },
  emptyText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.padding * 2,
    right: SIZES.padding,
    padding: SIZES.padding / 2,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    width: Dimensions.get('window').width * 0.8,
  },
  modalTitle: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  modalSelect: {
    marginBottom: SIZES.margin,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SIZES.margin / 2,
  },
  modalButtonText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
  },
});

export default PhotoGalleryScreen;
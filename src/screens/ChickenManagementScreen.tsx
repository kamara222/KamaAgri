// src/screens/ChickenManagementScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, FONTS } from '../styles/GlobalStyles';
import AddLotModal from '../components/AddLotModal';
import { useNavigation } from '@react-navigation/native';

// Données mock pour la liste des lots (à remplacer par API)
const mockLots = [
    {
        id: '1',
        dateArrivee: '2025-05-01',
        nombrePoulets: 500,
        poidsMoyen: 1.5,
        batiment: 'Bâtiment A',
        race: 'Ross 308',
    },
    {
        id: '2',
        dateArrivee: '2025-04-15',
        nombrePoulets: 750,
        poidsMoyen: 1.7,
        batiment: 'Bâtiment B',
        race: 'Cobb 500',
    },
];

// Types pour un lot
interface Lot {
    id: string;
    dateArrivee: string;
    nombrePoulets: number;
    poidsMoyen: number;
    batiment: string;
    race: string;
}

const ChickenManagementScreen: React.FC = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);


    // Filtrer les lots en fonction de la recherche
    const filteredLots = mockLots.filter(
        (lot) =>
            lot.race.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lot.batiment.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Rendu de chaque carte de lot
    const renderLotItem = ({ item }: { item: Lot }) => (
        <TouchableOpacity
            style={styles.lotCard}
            onPress={() => {
                // TODO: Naviguer vers la modification du lot
                console.log('Modifier lot', item.id);
            }}
        >
            <View style={styles.lotHeader}>
                <Icon name="egg" size={24} color={COLORS.primary} />
                <Text style={styles.lotTitle}>{item.race}</Text>
            </View>
            <Text style={styles.lotDetail}>Arrivée: {item.dateArrivee}</Text>
            <Text style={styles.lotDetail}>Poulets: {item.nombrePoulets}</Text>
            <Text style={styles.lotDetail}>Poids moyen: {item.poidsMoyen} kg</Text>
            <Text style={styles.lotDetail}>Bâtiment: {item.batiment}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color={COLORS.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par race ou bâtiment"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Boutons de navigation */}
            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Mortality')}
                >
                    <Text style={styles.navButtonText}>Suivi des Mortalités</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('FeedTracking')}
                >
                    <Text style={styles.navButtonText}>Suivi de l’Alimentation</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('WeightTracking')}
                >
                    <Text style={styles.navButtonText}>Suivi des Poids</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('SalesTracking')}
                >
                    <Text style={styles.navButtonText}>Suivi des Ventes</Text>
                </TouchableOpacity>
            </View>

            {/* Liste des lots */}
            <FlatList
                data={filteredLots}
                renderItem={renderLotItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Aucun lot trouvé</Text>
                }
            />

            {/* Bouton flottant pour ajouter un lot */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsModalVisible(true)}
            >
                <Icon name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>

            {/* Modal pour ajouter un lot */}
            <AddLotModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={(lot) => {
                    console.log('Nouveau lot:', lot);
                    setIsModalVisible(false);
                    // TODO: Envoyer au backend
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        margin: SIZES.margin,
        paddingHorizontal: SIZES.padding,
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.fontMedium,
        fontFamily: FONTS.regular,
        color: COLORS.text,
        padding: SIZES.padding / 2,
    },
    navigationButtons: {
        flexDirection: 'column',
        marginHorizontal: SIZES.margin,
    },
    navButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.margin,
        alignItems: 'center',
    },
    navButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: SIZES.fontMedium,
    },
    listContainer: {
        padding: SIZES.padding,
    },
    lotCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.margin,
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.margin / 2,
    },
    lotTitle: {
        fontSize: SIZES.fontLarge,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginLeft: SIZES.margin / 2,
    },
    lotDetail: {
        fontSize: SIZES.fontMedium,
        fontFamily: FONTS.regular,
        color: COLORS.text,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: SIZES.fontMedium,
        fontFamily: FONTS.regular,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SIZES.margin,
    },
    fab: {
        position: 'absolute',
        bottom: SIZES.margin * 2,
        right: SIZES.margin * 2,
        backgroundColor: COLORS.secondary,
        borderRadius: 30,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
});

export default ChickenManagementScreen;
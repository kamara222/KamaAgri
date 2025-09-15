// // Importations principales
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import * as React from 'react';
// import Home from '../screens/Home';

// // Création du stack de navigation
// const Stack = createStackNavigator();

// // TypeScript : Définition des types pour la navigation
// export type RootStackParamList = {
//   Home: undefined;
// };

// // Composant principal
// export default function Navigation() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
//         <Stack.Screen
//           name="Home"
//           component={Home}
//           options={{ title: 'Accueil' }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



// src/navigation/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ChickenManagementScreen from '../screens/ChickenManagementScreen';
import MortalityScreen from '../screens/MortalityScreen';
import FeedTrackingScreen from '../screens/FeedTrackingScreen';
import WeightTrackingScreen from '../screens/WeightTrackingScreen';
import VaccinationTrackingScreen from '../screens/VaccinationTrackingScreen';
import SalesTrackingScreen from '../screens/SalesTrackingScreen';
import FishManagementScreen from '../screens/FishManagementScreen';
import FishMortalityScreen from '../screens/FishMortalityScreen';
import FishFeedTrackingScreen from '../screens/FishFeedTrackingScreen';
import FishSalesTrackingScreen from '../screens/FishSalesTrackingScreen';
import StockManagementScreen from '../screens/StockManagementScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BackupScreen from '../screens/BackupScreen';
import AdvancedDashboardScreen from '../screens/AdvancedDashboardScreen';
import PlannerScreen from '../screens/PlannerScreen';
import SalesTrackingGeneralScreen from '../screens/SalesTrackingGeneralScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import LoginScreen from '../auth/LoginScreen';
import SplashScreen from '../screens/SplashScreen';

// Définir les types pour la navigation
export type RootStackParamList = {
    Home: undefined;
    LoginScreen: undefined;
    SplashScreen: undefined;
    ChickenManagement: undefined;
    Mortality: undefined;
    FeedTracking: undefined;
    WeightTracking: undefined;
    VaccinationTracking: undefined;
    SalesTracking: undefined;
    SalesTrackingGeneral: undefined;
    FishManagement: undefined;
    FishMortality: undefined;
    FishFeedTracking: undefined;
    FishSalesTracking: undefined;
    StockManagement: undefined;
    Reports: undefined;
    ReportDetail: { reportId: string };
    Settings: undefined;
    Notifications: undefined;
    Backup: undefined;
    AdvancedDashboard: undefined;
    Planner: undefined;
    PhotoGallery: undefined;
    // Ajouter d'autres écrans plus tard
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="SplashScreen"
                screenOptions={{
                    headerStyle: { backgroundColor: '#2E7D32' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontFamily: 'Roboto-Bold' },
                    headerTitleAlign: 'center',
                    headerBackTitleVisible: false,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Tableau de Bord' }}
                />

                <Stack.Screen
                    name="ChickenManagement"
                    component={ChickenManagementScreen}
                    options={{ title: 'Gestion des Poulets' }}
                />

                <Stack.Screen
                    name="Mortality"
                    component={MortalityScreen}
                    options={{ title: 'Suivi des Mortalités' }}
                />

                <Stack.Screen
                    name="FeedTracking"
                    component={FeedTrackingScreen}
                    options={{ title: 'Suivi de l’Alimentation' }}
                />

                <Stack.Screen
                    name="WeightTracking"
                    component={WeightTrackingScreen}
                    options={{ title: 'Suivi des Poids' }}
                />

                <Stack.Screen
                    name="VaccinationTracking"
                    component={VaccinationTrackingScreen}
                    options={{ title: 'Suivi des Vaccinations' }}
                />

                <Stack.Screen
                    name="SalesTracking"
                    component={SalesTrackingScreen}
                    options={{ title: 'Suivi des Ventes (Poulets)' }}
                />

                <Stack.Screen
                    name="SalesTrackingGeneral"
                    component={SalesTrackingGeneralScreen}
                    options={{ title: 'Suivi des Ventes (Général)' }}
                />

                <Stack.Screen
                    name="FishManagement"
                    component={FishManagementScreen}
                    options={{ title: 'Gestion des Poissons' }}
                />

                <Stack.Screen
                    name="FishMortality"
                    component={FishMortalityScreen}
                    options={{ title: 'Suivi des Mortalités (Poissons)' }}
                />

                <Stack.Screen
                    name="FishFeedTracking"
                    component={FishFeedTrackingScreen}
                    options={{ title: 'Suivi de l’Alimentation (Poissons)' }}
                />

                <Stack.Screen
                    name="FishSalesTracking"
                    component={FishSalesTrackingScreen}
                    options={{ title: 'Suivi des Ventes (Poissons)' }}
                />

                <Stack.Screen
                    name="StockManagement"
                    component={StockManagementScreen}
                    options={{ title: 'Gestion des Stocks' }}
                />

                <Stack.Screen
                    name="Reports"
                    component={ReportsScreen}
                    options={{ title: 'Rapports' }}
                />
                <Stack.Screen
                    name="ReportDetail"
                    component={ReportDetailScreen}
                    options={{ title: 'Détails du Rapport' }}
                />

                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: 'Paramètres' }}
                />

                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ title: 'Notifications' }}
                />

                <Stack.Screen
                    name="Backup"
                    component={BackupScreen}
                    options={{ title: 'Sauvegarde' }}
                />

                <Stack.Screen
                    name="AdvancedDashboard"
                    component={AdvancedDashboardScreen}
                    options={{ title: 'Tableau de Bord Avancé' }}
                />

                <Stack.Screen
                    name="Planner"
                    component={PlannerScreen}
                    options={{ title: 'Planificateur' }}
                />

                <Stack.Screen
                    name="PhotoGallery"
                    component={PhotoGalleryScreen}
                    options={{ title: 'Galerie Photo' }}
                />

                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ title: 'Connexion', headerShown: false }}
                />

                <Stack.Screen
                    name="SplashScreen"
                    component={SplashScreen}
                    options={{ title: 'SplashScreen', headerShown: false }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;
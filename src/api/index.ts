import { AxiosResponse } from 'axios';
import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string | null;
  race: string | null;
  date: string;
  nombre: number;
  poids_moyen: number;
}

// Interface pour une mortalité
interface Mortality {
  id: string;
  date: string;
  batiment: string;
  race: string;
  nombre: number;
  cause: string;
}

// Interface pour une distribution d'aliment
interface FeedDistribution {
  id: string;
  date: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre?: number;
}

// Interface pour un bassin
interface Basin {
  id: string;
  nom_bassin: string;
  espece: string | { code: string; nom: string } | null;
  date?: string;
  nombre?: number;
}

// Interface pour une espèce
interface Espece {
  label: string;
  value: string;
}

// Interface pour une mortalité de poisson
interface FishMortality {
  id: string;
  date?: string;
  bassin: string;
  nombre?: number;
  cause: string;
  espece: string | { code: string; nom: string } | null;
}

// Interface pour une distribution d'aliment de poisson
interface FishFeedDistribution {
  id: string;
  date?: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre?: number;
}

// Interface pour une vente (générique pour poissons et poulets)
interface Sale {
  id: string;
  date: string;
  type_de_vente: string;
  bassin?: string;
  batiment?: string;
  espece_poisson?: string;
  race_poulet?: string;
  kg_poisson?: number;
  nombre_poulet?: number;
  nombre_poisson?: number;
  prix_kg_poisson?: number;
  prix_unitaitre?: number;
  prix_total: number;
  nom_complet_client?: string;
  mode_paiement: string;
}

// Interface pour un utilisateur
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

// Interface pour un service
interface Service {
  code: string;
  name: string;
}

// Interface pour les données des rôles et services
interface RoleServiceData {
  roleServices: string[];
  services: Service[];
}

// Interface pour la réponse de login
interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    services: boolean;
    id: string;
    email: string;
    nom: string;
    prenom: string;
    numeroTelephone: string;
    role: {
      code: string;
      nom: string;
      description: string;
    };
  };
}

export const getEleves = async () => {
  const endpoint = '/eleves';
  try {
    const res = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des bassins
export const getBassins = async (especeFilter?: string) => {
  const endpoint = especeFilter
    ? `/poisson?espece=${encodeURIComponent(especeFilter)}`
    : '/poisson';
  try {
    const res: AxiosResponse<Basin[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer un nouveau bassin
export const createBassin = async (bassin: {
  nom_bassin: string;
  espece: string;
  date?: string;
  nombre?: number;
}) => {
  const endpoint = '/poisson';
  try {
    const res: AxiosResponse<Basin> = await api.post(endpoint, bassin);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer un bassin
export const deleteBassin = async (id: string) => {
  const endpoint = `/poisson/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des espèces
export const getEspeces = async () => {
  const staticEspeces: Espece[] = [
    { label: 'Tilapia', value: 'tilapia' },
    { label: 'Silure', value: 'silure' },
    { label: 'Carpe', value: 'carpe' },
  ];
  return staticEspeces;
};

// Récupérer la liste des races de poulets
export const getRaces = async () => {
  const endpoint = '/race-poulet';
  try {
    const res: AxiosResponse<Espece[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des lots de poulets
export const getLots = async (raceFilter?: string) => {
  const endpoint = raceFilter ? `/poulet?race=${encodeURIComponent(raceFilter)}` : '/poulet';
  try {
    const res: AxiosResponse<Lot[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer un nouveau lot de poulets
export const createLot = async (lot: {
  batiment: string;
  race: string;
  date: string;
  nombre: number;
  poids_moyen: number;
}) => {
  const endpoint = '/poulet';
  try {
    const res: AxiosResponse<Lot> = await api.post(endpoint, lot);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Mettre à jour un lot de poulets
export const updateLot = async (lot: {
  id: string;
  batiment: string;
  race: string;
  date: string;
  nombre: number;
  poids_moyen: number;
}) => {
  const endpoint = `/poulet/${lot.id}`;
  try {
    const res: AxiosResponse<Lot> = await api.put(endpoint, {
      batiment: lot.batiment,
      race: lot.race,
      date: lot.date,
      nombre: lot.nombre,
      poids_moyen: lot.poids_moyen,
    });
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer un lot de poulets
export const deleteLot = async (id: string) => {
  const endpoint = `/poulet/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des mortalités
export const getMortalities = async (raceFilter?: string) => {
  const endpoint = raceFilter ? `/mortalite-poulet?race=${encodeURIComponent(raceFilter)}` : '/mortalite-poulet';
  try {
    const res: AxiosResponse<Mortality[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle mortalité
export const createMortality = async (mortality: {
  date?: string;
  batiment: string;
  race: string;
  nombre?: number;
  cause: string;
}) => {
  const endpoint = '/mortalite-poulet';
  try {
    const res: AxiosResponse<Mortality> = await api.post(endpoint, mortality);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une mortalité
export const deleteMortality = async (id: string) => {
  const endpoint = `/mortalite-poulet/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des distributions d'aliments
export const getFeedDistributions = async (typeFilter?: string) => {
  const endpoint = typeFilter ? `/alimentation-poulet?type=${encodeURIComponent(typeFilter)}` : '/alimentation-poulet';
  try {
    const res: AxiosResponse<FeedDistribution[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle distribution d'aliment
export const createFeedDistribution = async (distribution: {
  date?: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre?: number;
}) => {
  const endpoint = '/alimentation-poulet';
  try {
    const res: AxiosResponse<FeedDistribution> = await api.post(endpoint, distribution);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une distribution d'aliment
export const deleteFeedDistribution = async (id: string) => {
  const endpoint = `/alimentation-poulet/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une distribution d'aliment pour poissons
export const deleteFishFeedDistribution = async (id: string) => {
  const endpoint = `/alimentation-poisson/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des mortalités de poissons
export const getFishMortalities = async (especeFilter?: string) => {
  const endpoint = especeFilter
    ? `/mortalite-poisson?espece=${encodeURIComponent(especeFilter)}`
    : '/mortalite-poisson';
  try {
    const res: AxiosResponse<FishMortality[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle mortalité de poisson
export const createFishMortality = async (mortality: {
  date?: string;
  bassin: string;
  nombre?: number;
  cause: string;
  espece: string;
}) => {
  const endpoint = '/mortalite-poisson';
  try {
    const res: AxiosResponse<FishMortality> = await api.post(endpoint, mortality);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une mortalité de poisson
export const deleteFishMortality = async (id: string) => {
  const endpoint = `/mortalite-poisson/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des distributions d'aliments pour poissons
export const getFishFeedDistributions = async (typeFilter?: string) => {
  const endpoint = typeFilter
    ? `/alimentation-poisson?type=${encodeURIComponent(typeFilter)}`
    : '/alimentation-poisson';
  try {
    const res: AxiosResponse<FishFeedDistribution[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle distribution d'aliment pour poissons
export const createFishFeedDistribution = async (distribution: {
  date?: string;
  nom_alimentation: string;
  type: string;
  poids: number;
  nombre?: number;
}) => {
  const endpoint = '/alimentation-poisson';
  try {
    const res: AxiosResponse<FishFeedDistribution> = await api.post(endpoint, distribution);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des ventes de poissons
export const getFishSales = async (filters?: {
  type_de_vente?: string;
  espece_poisson?: string;
  bassin?: string;
}) => {
  let endpoint = '/ventes';
  if (filters) {
    const queryParams = new URLSearchParams();
    if (filters.type_de_vente) queryParams.append('type_de_vente', filters.type_de_vente);
    if (filters.espece_poisson) queryParams.append('espece_poisson', filters.espece_poisson);
    if (filters.bassin) queryParams.append('bassin', filters.bassin);
    endpoint += `?${queryParams.toString()}`;
  }
  try {
    const res: AxiosResponse<Sale[]> = await api.get(endpoint);
    return res.data.filter((sale) => sale.kg_poisson !== undefined && sale.kg_poisson !== null);
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle vente de poisson
export const createFishSale = async (sale: {
  date: string;
  type_de_vente: string;
  bassin: string;
  espece_poisson?: string;
  kg_poisson: number;
  prix_total: number;
  nom_complet_client?: string;
  mode_paiement: string;
}) => {
  const endpoint = '/ventes';
  try {
    const res: AxiosResponse<Sale> = await api.post(endpoint, sale);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer la liste des ventes de poulets
export const getChickenSales = async (filters?: {
  type_de_vente?: string;
  race_poulet?: string;
  batiment?: string;
}) => {
  let endpoint = '/ventes';
  if (filters) {
    const queryParams = new URLSearchParams();
    if (filters.type_de_vente) queryParams.append('type_de_vente', filters.type_de_vente);
    if (filters.race_poulet) queryParams.append('race_poulet', filters.race_poulet);
    if (filters.batiment) queryParams.append('batiment', filters.batiment);
    endpoint += `?${queryParams.toString()}`;
  }
  try {
    const res: AxiosResponse<Sale[]> = await api.get(endpoint);
    return res.data.filter((sale) => sale.nombre_poulet !== undefined && sale.nombre_poulet !== null);
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer une nouvelle vente de poulet
export const createChickenSale = async (sale: {
  date: string;
  type_de_vente: string;
  batiment: string;
  race_poulet?: string;
  nombre_poulet: number;
  prix_unitaitre: number;
  prix_total: number;
  nom_complet_client: string;
  mode_paiement: string;
}) => {
  const endpoint = '/ventes';
  try {
    const res: AxiosResponse<Sale> = await api.post(endpoint, sale);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une vente de poulet
export const deleteChickenSale = async (id: string) => {
  const endpoint = `/ventes/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Supprimer une vente de poisson
export const deleteFishSale = async (id: string) => {
  const endpoint = `/ventes/${id}`;
  try {
    const res: AxiosResponse = await api.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Authentification
export const login = async (credentials: {
  identifiant: string;
  password: string;
}) => {
  const endpoint = '/auth/login';
  try {
    const res: AxiosResponse<LoginResponse> = await api.post(endpoint, credentials);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Déconnexion
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userInfo');
    return { message: 'Déconnexion réussie' };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

// Récupérer la liste des utilisateurs
export const getUsers = async () => {
  const endpoint = '/utilisateurs';
  try {
    const res: AxiosResponse<User[]> = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Créer un utilisateur
export const createUser = async (user: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  numeroTelephone: string;
}) => {
  const endpoint = '/auth/register';
  try {
    const res: AxiosResponse<User> = await api.post(endpoint, user);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};

// Récupérer les services pour un rôle
export const getRoleServices = async (roleId: string) => {
  const endpoint = `/role-servive?roleId=${roleId}`;
  try {
    const res: AxiosResponse<any> = await api.get(endpoint);
    const data = res.data;

    // Extraire et parser les services de roleServices
    let roleServices: string[] = [];
    if (data.roleServices && Array.isArray(data.roleServices)) {
      roleServices = data.roleServices
        .filter((item: any) => item.services)
        .map((item: any) => {
          try {
            // Remplacer les accolades par des crochets pour corriger le format
            const correctedServices = item.services.replace(/^{/, "[").replace(/}$/, "]");
            return JSON.parse(correctedServices);
          } catch (error) {
            console.error("Erreur lors du parsing des services:", item.services, error);
            return [];
          }
        })
        .flat(); // Aplatir le tableau de tableaux en un seul tableau
    }

    console.log("Services parsés:", roleServices);

    return {
      roleServices,
      services: Array.isArray(data.services) ? data.services : [],
    } as RoleServiceData;
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${endpoint}:`, error);
    throw error;
  }
};

// Attribuer des services à un rôle
export const assignRoleServices = async (data: {
  roleId: string;
  services: string[];
}) => {
  const endpoint = '/role-servive';
  try {
    console.log('Envoi des services à l\'API:', data);
    const res: AxiosResponse = await api.post(endpoint, data);
    console.log('Réponse de l\'API:', res.data);
    return res.data;
  } catch (error) {
    console.error('API error:', endpoint, error);
    throw error;
  }
};
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
  espece: string;
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
  espece: string;
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
  prix_unitaire?: number;
  prix_total: number;
  nom_complet_client?: string;
  mode_paiement: string;
}

// Interface pour la réponse de login
interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
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

// Récupérer la liste des espèces
export const getEspeces = async () => {
  const staticEspeces: Espece[] = [
    { label: 'Tilapia', value: 'Tilapia' },
    { label: 'Carpe', value: 'Carpe' },
    { label: 'Silure', value: 'Silure' },
    { label: 'Capitaine', value: 'Capitaine' },
  ];
  return staticEspeces;
};

// Récupérer la liste des races de poulets
export const getRaces = async () => {
  const staticRaces: Espece[] = [
    { label: 'Ross 308', value: 'Ross 308' },
    { label: 'Cobb 500', value: 'Cobb 500' },
  ];
  return staticRaces;
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
  prix_unitaire: number;
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
    return { message: 'Déconnexion réussie' };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};
import { AxiosResponse } from 'axios';
import api from './axiosConfig';

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
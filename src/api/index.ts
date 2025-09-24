import { AxiosResponse } from 'axios';
import api from './axiosConfig';

// Interface pour un lot
interface Lot {
  id: string;
  batiment: string;
  race: string;
  date: string;
  nombre: number;
  poids_moyen: number;
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
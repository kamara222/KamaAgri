import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEleves, getLots, createLot, getMortalities, createMortality, getFeedDistributions, createFeedDistribution } from '../api';

export const useEleves = () => {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: () => getEleves().then((res: any) => res),
  });
};

// Hook pour récupérer les lots de poulets
export const useLots = (raceFilter?: string) => {
  return useQuery({
    queryKey: ['lots', raceFilter],
    queryFn: () => getLots(raceFilter).then((res) => res),
  });
};

// Hook pour créer un lot de poulets
export const useCreateLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
};

// Hook pour récupérer les mortalités
export const useMortalities = (raceFilter?: string) => {
  return useQuery({
    queryKey: ['mortalities', raceFilter],
    queryFn: () => getMortalities(raceFilter).then((res) => res),
  });
};

// Hook pour créer une mortalité
export const useCreateMortality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMortality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortalities'] });
    },
  });
};

// Hook pour récupérer les distributions d'aliments
export const useFeedDistributions = (typeFilter?: string) => {
  return useQuery({
    queryKey: ['feedDistributions', typeFilter],
    queryFn: () => getFeedDistributions(typeFilter).then((res) => res),
  });
};

// Hook pour créer une distribution d'aliment
export const useCreateFeedDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedDistributions'] });
    },
  });
};
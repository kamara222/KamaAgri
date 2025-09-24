import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEleves, getLots, createLot, getMortalities, createMortality } from '../api';

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
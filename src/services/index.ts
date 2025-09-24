import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEleves, getLots, createLot } from '../api';

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
      // Invalider le cache pour rafraîchir la liste des lots
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
};
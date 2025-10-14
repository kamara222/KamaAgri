import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEleves,
  getLots,
  createLot,
  deleteLot,
  getMortalities,
  createMortality,
  deleteMortality,
  getFeedDistributions,
  createFeedDistribution,
  deleteFeedDistribution,
  getBassins,
  createBassin,
  deleteBassin,
  getEspeces,
  getFishMortalities,
  createFishMortality,
  deleteFishMortality,
  getFishFeedDistributions,
  createFishFeedDistribution,
  deleteFishFeedDistribution,
  getFishSales,
  createFishSale,
  getChickenSales,
  createChickenSale,
  deleteChickenSale,
  deleteFishSale,
  getRaces,
  login,
  logout,
  getUsers,
  createUser,
  deleteUser,
  getRoleServices,
  assignRoleServices,
  getStats,
  getEvents,
  createEvent,
  deleteEvent,
  updateUserFcmToken,
} from '../api';

// Hook pour récupérer les élevages
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

// Hook pour mettre à jour un lot de poulets
export const useUpdateLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetch(`http://161.97.103.214:3002/poulet/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
};

// Hook pour supprimer un lot de poulets
export const useDeleteLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
    },
  });
};

// Hook pour récupérer les mortalités (poulets)
export const useMortalities = (raceFilter?: string) => {
  return useQuery({
    queryKey: ['mortalities', raceFilter],
    queryFn: () => getMortalities(raceFilter).then((res) => res),
  });
};

// Hook pour créer une mortalité (poulets)
export const useCreateMortality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMortality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortalities'] });
    },
  });
};

// Hook pour supprimer une mortalité (poulets)
export const useDeleteMortality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMortality,
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

// Hook pour supprimer une distribution d'aliment
export const useDeleteFeedDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedDistributions'] });
    },
  });
};

// Hook pour supprimer une distribution d'aliment pour poissons
export const useDeleteFishFeedDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFishFeedDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishFeedDistributions'] });
    },
  });
};

// Hook pour récupérer les bassins
export const useBassins = (especeFilter?: string) => {
  return useQuery({
    queryKey: ['bassins', especeFilter],
    queryFn: () => getBassins(especeFilter).then((res) => res),
  });
};

// Hook pour créer un bassin
export const useCreateBassin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBassin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bassins'] });
    },
  });
};

// Hook pour supprimer un bassin
export const useDeleteBassin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBassin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bassins'] });
    },
  });
};

// Hook pour récupérer les espèces
export const useEspeces = () => {
  return useQuery({
    queryKey: ['especes'],
    queryFn: () => getEspeces().then((res) => res),
  });
};

// Hook pour récupérer les races de poulets
export const useRaces = () => {
  return useQuery({
    queryKey: ['races'],
    queryFn: () => getRaces().then((res) => res),
  });
};

// Hook pour récupérer les mortalités de poissons
export const useFishMortalities = (especeFilter?: string) => {
  return useQuery({
    queryKey: ['fishMortalities', especeFilter],
    queryFn: () => getFishMortalities(especeFilter).then((res) => res),
  });
};

// Hook pour créer une mortalité de poisson
export const useCreateFishMortality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFishMortality,
    onSuccess: () => {
      console.log('Invalidation des queries fishMortalities');
      queryClient.invalidateQueries({ queryKey: ['fishMortalities'] });
    },
  });
};

// Hook pour supprimer une mortalité de poisson
export const useDeleteFishMortality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFishMortality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishMortalities'] });
    },
  });
};

// Hook pour récupérer les distributions d'aliments pour poissons
export const useFishFeedDistributions = (typeFilter?: string) => {
  return useQuery({
    queryKey: ['fishFeedDistributions', typeFilter],
    queryFn: () => getFishFeedDistributions(typeFilter).then((res) => res),
  });
};

// Hook pour créer une distribution d'aliment pour poissons
export const useCreateFishFeedDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFishFeedDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishFeedDistributions'] });
    },
  });
};

// Hook pour récupérer les ventes de poissons
export const useFishSales = (filters?: {
  type_de_vente?: string;
  espece_poisson?: string;
  bassin?: string;
}) => {
  return useQuery({
    queryKey: ['fishSales', filters],
    queryFn: () => getFishSales(filters).then((res) => res),
  });
};

// Hook pour créer une vente de poisson
export const useCreateFishSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFishSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishSales'] });
    },
  });
};

// Hook pour supprimer une vente de poisson
export const useDeleteFishSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFishSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishSales'] });
    },
  });
};

// Hook pour récupérer les ventes de poulets
export const useChickenSales = (filters?: {
  type_de_vente?: string;
  race_poulet?: string;
  batiment?: string;
}) => {
  return useQuery({
    queryKey: ['chickenSales', filters],
    queryFn: () => getChickenSales(filters).then((res) => res),
  });
};

// Hook pour créer une vente de poulet
export const useCreateChickenSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChickenSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chickenSales'] });
    },
  });
};

// Hook pour supprimer une vente de poulet
export const useDeleteChickenSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChickenSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chickenSales'] });
    },
  });
};

// Hook pour l'authentification
export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log('Connexion réussie:', data);
    },
    onError: (error: any) => {
      console.error('Erreur de connexion:', error);
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      console.log('Déconnexion réussie');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la déconnexion:', error);
    },
  });
};

// Hook pour mettre à jour le FCM token de l'utilisateur
export const useUpdateUserFcmToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fcmtoken }: { id: string; fcmtoken: string }) =>
      updateUserFcmToken(id, fcmtoken),
    onSuccess: () => {
      console.log('FCM token mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour du FCM token:', error);
    },
  });
};

// Hook pour récupérer les utilisateurs
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers().then((res) => res),
  });
};

// Hook pour créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      console.log('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error.response?.data || error);
    },
  });
};

// Hook pour récupérer les services d'un rôle
export const useRoleServices = (roleId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['roleServices', roleId],
    queryFn: () => getRoleServices(roleId).then((res) => res),
    enabled,
  });
};

// Hook pour attribuer des services à un rôle
export const useAssignRoleServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRoleServices,
    onSuccess: (data) => {
      console.log('Services attribués avec succès:', data);
      queryClient.invalidateQueries({ queryKey: ['roleServices'] });
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'attribution des services:', error.response?.data || error);
    },
  });
};

// Hook pour récupérer les statistiques
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => getStats().then((res) => res),
  });
};

// Hook pour récupérer les événements
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents().then((res) => res),
  });
};

// Hook pour créer un événement
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook pour supprimer un événement
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
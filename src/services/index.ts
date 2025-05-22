import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { getEleves, getEmploieTemps, getNotes, getScolarite, getHistoriquePayement } from '../api';
import { postPermission, getPermissions, deletePermission } from '../api';

export const useEleves = () => {
    return useQuery({
        queryKey: ['consultations'],
        queryFn: () => getEleves().then((res: any) => res),
        /*enabled: racine !== '',*/
    });
};

export const useEmploieTemps = (annee, mois, classeId) => {
    return useQuery({
        queryKey: ['emploieTemps'],
        queryFn: () => getEmploieTemps(annee, mois, classeId).then((res: any) => res),
        /*enabled: racine !== '',*/
    });
};

// //Note: this function is used to get notes of a student
// export const useNotes = (eleveId, anneeScolaire,decoupageAnnee ) => {
//     return useQuery({
//         queryKey: ['notes'],
//         queryFn: () => getNotes(eleveId, anneeScolaire,decoupageAnnee).then((res: any) => res),
//         /*enabled: racine !== '',*/
//     });
// };


// Hook personnalisé useNotes modifié
export const useNotes = (eleveId, anneeScolaire, decoupageAnnee) => {
    return useQuery({
        queryKey: ['notes', eleveId, anneeScolaire, decoupageAnnee],
        queryFn: () => getNotes(eleveId, anneeScolaire, decoupageAnnee).then((res: any) => res),
        // Désactive la récupération automatique au montage
        enabled: !!eleveId && !!anneeScolaire && !!decoupageAnnee,
        // Gestion des erreurs
        retry: 2,
        staleTime: 5 * 60 * 1000, // Cache les données pendant 5 minutes
    });
};


//export personnaliser de la scolarite
export const useScolarite = (eleveId) => {
    return useQuery({
        queryKey: ['scolarite', eleveId],
        queryFn: () => getScolarite(eleveId).then((res: any) => res),
        // Désactive la récupération automatique au montage
        enabled: !!eleveId,
        // Gestion des erreurs
        retry: 2,
        staleTime: 5 * 60 * 1000, // Cache les données pendant 5 minutes
    });
};


//export personnaliser de l'historique de payement de la scolarité
export const useHistoriquePayement = (eleveId) => {
    return useQuery({
        queryKey: ['historiquePayement', eleveId],
        queryFn: () => getHistoriquePayement(eleveId).then((res: any) => res),
        // Désactive la récupération automatique au montage
        enabled: !!eleveId,
        // Gestion des erreurs
        retry: 2,
        staleTime: 5 * 60 * 1000, // Cache les données pendant 5 minutes
    });
};


// Hook pour supprimer une permission
export const useDeletePermission = () => {
    return useMutation({
        mutationFn: (id: string) => deletePermission(id),
        onError: (error) => {
            console.error('Erreur lors de la suppression de la permission:', error);
        },
    });
};
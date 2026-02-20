/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/features/commandes/hooks/useCommandeQueries.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { mapFrontendStatusToApi } from '../services/commande.service';
import { 
  commandeService, 
  Commande, 
  CommandesResponse,
  CreateCommandeDto,
  QueryCommandesDto
} from '../services/commande.service';
import { useCommandeStore } from '../store/commandeStore';
import { useAuthStore } from '../../../store/authStore';
import { useEffect } from 'react';
import React from 'react';

// ============================================
// QUERY KEYS
// ============================================

export const commandeKeys = {
  all: ['commandes'] as const,
  lists: () => [...commandeKeys.all, 'list'] as const,
  list: (filters: QueryCommandesDto) => [...commandeKeys.lists(), filters] as const,
  details: () => [...commandeKeys.all, 'detail'] as const,
  detail: (id: string) => [...commandeKeys.details(), id] as const,
  myCommandes: (filters?: QueryCommandesDto) => 
    [...commandeKeys.all, 'my', filters] as const,
  boutiqueCommandes: (filters?: QueryCommandesDto) => 
    [...commandeKeys.all, 'boutique', filters] as const,
  stats: () => [...commandeKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES - CLIENT
// ============================================

/**
 * 📋 Hook pour récupérer mes commandes (Client)
 */
export function useMyCommandes(
  query?: QueryCommandesDto,
  options?: Omit<UseQueryOptions<CommandesResponse>, 'queryKey' | 'queryFn'>
) {
  // Sélectionner uniquement selectedStatus pour éviter les re-renders inutiles
  const selectedStatus = useCommandeStore((state) => state.selectedStatus);
  
  const filters: QueryCommandesDto = {
    ...query,
    status: selectedStatus !== 'ALL' 
      ? mapFrontendStatusToApi(selectedStatus as 'en attente' | 'confirmée' | 'annulée') 
      : query?.status,
  };

  return useQuery({
    queryKey: commandeKeys.myCommandes(filters),
    queryFn: () => commandeService.getMyCommandes(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * 🆕 Hook pour récupérer mes commandes récentes (Client)
 */
export function useRecentCommandes(limit: number = 5) {
  return useQuery({
    queryKey: commandeKeys.myCommandes({ limit }),
    queryFn: () => commandeService.getMyCommandes({ limit }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================
// QUERIES - CEO
// ============================================

/**
 * 🏪 Hook pour récupérer les commandes de ma boutique (CEO)
 */
export function useBoutiqueCommandes(
  query?: QueryCommandesDto,
  options?: Omit<UseQueryOptions<CommandesResponse>, 'queryKey' | 'queryFn'>
) {
  // Sélectionner uniquement selectedStatus pour éviter les re-renders inutiles
  const selectedStatus = useCommandeStore((state) => state.selectedStatus);
  const { user } = useAuthStore();
  
  const filters: QueryCommandesDto = {
    ...query,
    status: selectedStatus !== 'ALL' 
      ? mapFrontendStatusToApi(selectedStatus as 'en attente' | 'confirmée' | 'annulée')
      : query?.status,
  };

  return useQuery({
    queryKey: commandeKeys.boutiqueCommandes(filters),
    queryFn: () => commandeService.getBoutiqueCommandes(filters),
    enabled: user?.isCEO === true,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * ⏳ Hook pour récupérer les commandes en attente (CEO)
 */
export function usePendingCommandes() {
  const { user } = useAuthStore();
  const { updatePendingCount } = useCommandeStore();

  const status = 'en attente' as const;
  
  const query = useQuery({
    queryKey: commandeKeys.boutiqueCommandes({ status: mapFrontendStatusToApi(status) }),
    queryFn: () => commandeService.getBoutiqueCommandes({ status: mapFrontendStatusToApi(status) }),
    enabled: user?.isCEO === true,
    staleTime: 1 * 60 * 1000,
  });

  // Mettre à jour le compteur quand les données changent
  React.useEffect(() => {
    if (query.data) {
      updatePendingCount(query.data.data.length);
    }
  }, [query.data, updatePendingCount]);

  return query;
}

/**
 * 📊 Hook pour les statistiques de commandes (CEO)
 */
export function useCommandeStats() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: commandeKeys.stats(),
    queryFn: () => commandeService.getCommandeStats(),
    enabled: user?.isCEO === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// QUERIES - DÉTAILS
// ============================================

/**
 * 🔍 Hook pour récupérer une commande par ID
 */
export function useCommandeById(
  id: string,
  options?: Omit<UseQueryOptions<Commande>, 'queryKey' | 'queryFn'>
) {
  const { setCurrentCommande } = useCommandeStore();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: commandeKeys.detail(id),
    queryFn: () => commandeService.getCommandeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });

  useEffect(() => {
    if (queryResult.data) {
      setCurrentCommande(queryResult.data);
    }
  }, [queryResult.data, setCurrentCommande]);

  return queryResult;
}

// ============================================
// MUTATIONS
// ============================================

/**
 * 🛍️ Hook pour créer une commande
 */
export function useCreateCommande() {
  const queryClient = useQueryClient();
  const { setLastOrderNumber } = useCommandeStore();

  return useMutation({
    mutationFn: (dto: CreateCommandeDto) => commandeService.createCommande(dto),
    onSuccess: (data) => {
      console.log('✅ [Mutation] Commande créée:', data.orderNumber);
      
      // Invalider les queries de commandes
      queryClient.invalidateQueries({ queryKey: commandeKeys.myCommandes() });
      
      // Enregistrer le numéro de commande
      setLastOrderNumber(data.orderNumber);
      
      // Vider le panier (à implémenter dans votre cartStore)
      // useCartStore.getState().clearCart();
    },
    onError: (error: Error) => {
      console.error('❌ [Mutation] Erreur création commande:', error.message);
    },
  });
}

/**
 * ✅ Hook pour confirmer une commande (CEO)
 */
export function useConfirmerCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      commandeService.confirmerCommande(id, notes),
    onSuccess: (data) => {
      console.log('✅ [Mutation] Commande confirmée:', data.orderNumber);
      
      // Invalider et refetch
      queryClient.invalidateQueries({ queryKey: commandeKeys.boutiqueCommandes() });
      queryClient.invalidateQueries({ queryKey: commandeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: commandeKeys.stats() });
    },
    onError: (error: Error) => {
      console.error('❌ [Mutation] Erreur confirmation:', error.message);
    },
  });
}

/**
 * ❌ Hook pour annuler une commande
 */
export function useAnnulerCommande() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      commandeService.annulerCommande(id, notes),
    onSuccess: (data) => {
      console.log('✅ [Mutation] Commande annulée:', data.orderNumber);
      
      // Invalider selon le rôle
      if (user?.isCEO) {
        queryClient.invalidateQueries({ queryKey: commandeKeys.boutiqueCommandes() });
        queryClient.invalidateQueries({ queryKey: commandeKeys.stats() });
      } else {
        queryClient.invalidateQueries({ queryKey: commandeKeys.myCommandes() });
      }
      
      queryClient.invalidateQueries({ queryKey: commandeKeys.detail(data.id) });
    },
    onError: (error: Error) => {
      console.error('❌ [Mutation] Erreur annulation:', error.message);
    },
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * 🔄 Hook pour rafraîchir les commandes
 */
export function useRefreshCommandes() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return () => {
    console.log('🔄 [Commandes] Rafraîchissement...');
    
    if (user?.isCEO) {
      queryClient.invalidateQueries({ queryKey: commandeKeys.boutiqueCommandes() });
      queryClient.invalidateQueries({ queryKey: commandeKeys.stats() });
    } else {
      queryClient.invalidateQueries({ queryKey: commandeKeys.myCommandes() });
    }
  };
}

/**
 * 🎯 Hook pour précharger une commande
 */
export function usePrefetchCommande() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: commandeKeys.detail(id),
      queryFn: () => commandeService.getCommandeById(id),
      staleTime: 2 * 60 * 1000,
    });
  };
}

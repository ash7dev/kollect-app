// src/features/commandes/store/commandeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { Commande } from '../services/commande.service';

// ============================================
// TYPES
// ============================================

// ✅ Définir un type local pour les statuts frontend
type FrontendCommandeStatus = 'en attente' | 'confirmée' | 'annulée';

interface CommandeState {
  // État local
  currentCommande: Commande | null;
  pendingOrderCount: number;
  lastOrderNumber: string | null;
  
  // Filtres et pagination (non persistés)
  selectedStatus: FrontendCommandeStatus | 'ALL';
  currentPage: number;
  
  // Actions
  setCurrentCommande: (commande: Commande | null) => void;
  updatePendingCount: (count: number) => void;
  setLastOrderNumber: (orderNumber: string) => void;
  
  // Filtres
  setSelectedStatus: (status: FrontendCommandeStatus | 'ALL') => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  
  // Helpers
  getStatusBadgeColor: (status: FrontendCommandeStatus) => string;
  getStatusLabel: (status: FrontendCommandeStatus) => string;
  getStatusIcon: (status: FrontendCommandeStatus) => string;
  
  // Clear
  clearCommandeData: () => void;
}

// ============================================
// STORE
// ============================================

export const useCommandeStore = create<CommandeState>()(
  persist(
    (set, get) => ({
      // État initial
      currentCommande: null,
      pendingOrderCount: 0,
      lastOrderNumber: null,
      selectedStatus: 'ALL',
      currentPage: 1,

      // ============================================
      // ACTIONS DE BASE
      // ============================================

      /**
       * 💾 Définir la commande courante
       */
      setCurrentCommande: (commande) => {
        set({ currentCommande: commande });
        console.log('💾 [Commande Store] Commande définie:', commande?.orderNumber);
      },

      /**
       * 🔢 Mettre à jour le compteur de commandes en attente
       */
      updatePendingCount: (count) => {
        set({ pendingOrderCount: count });
        console.log('🔢 [Commande Store] Commandes en attente:', count);
      },

      /**
       * 📝 Enregistrer le dernier numéro de commande
       */
      setLastOrderNumber: (orderNumber) => {
        set({ lastOrderNumber: orderNumber });
        console.log('📝 [Commande Store] Dernière commande:', orderNumber);
      },

      // ============================================
      // FILTRES & PAGINATION
      // ============================================

      /**
       * 🎯 Définir le statut sélectionné
       */
      setSelectedStatus: (status) => {
        set({ selectedStatus: status, currentPage: 1 });
        console.log('🎯 [Commande Store] Filtre statut:', status);
      },

      /**
       * 📄 Définir la page courante
       */
      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      /**
       * 🔄 Réinitialiser les filtres
       */
      resetFilters: () => {
        set({ selectedStatus: 'ALL', currentPage: 1 });
        console.log('🔄 [Commande Store] Filtres réinitialisés');
      },

      // ============================================
      // HELPERS
      // ============================================

      /**
       * 🎨 Obtenir la couleur du badge selon le statut
       */
      getStatusBadgeColor: (status) => {
        const colors: Record<FrontendCommandeStatus, string> = {
          'en attente': '#FFA500',
          'confirmée': '#2ac00fff',
          'annulée': '#DC143C',
        };
        return colors[status] || '#808080';
      },

      /**
       * 📝 Obtenir le label du statut
       */
      getStatusLabel: (status) => {
        const labels: Record<FrontendCommandeStatus, string> = {
          'en attente': 'En attente',
          'confirmée': 'Confirmée',
          'annulée': 'Annulée',
        };
        return labels[status] || status;
      },

      /**
       * 🎭 Obtenir l'icône du statut
       */
      getStatusIcon: (status) => {
        const icons: Record<FrontendCommandeStatus, string> = {
          'en attente': '⏳',
          'confirmée': '✅',
          'annulée': '❌',
        };
        return icons[status] || '📋';
      },

      // ============================================
      // CLEAR
      // ============================================

      /**
       * 🗑️ Effacer les données de commande
       */
      clearCommandeData: () => {
        set({
          currentCommande: null,
          pendingOrderCount: 0,
          lastOrderNumber: null,
          selectedStatus: 'ALL',
          currentPage: 1,
        });
        console.log('🗑️ [Commande Store] Données effacées');
      },
    }),
    {
      name: 'commande-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastOrderNumber: state.lastOrderNumber,
        pendingOrderCount: state.pendingOrderCount,
      }),
    }
  )
);

// ============================================
// HOOKS UTILITAIRES
// ============================================

export const useCurrentCommande = () => 
  useCommandeStore((state) => state.currentCommande);

export const usePendingOrderCount = () => 
  useCommandeStore((state) => state.pendingOrderCount);

export const useLastOrderNumber = () => 
  useCommandeStore((state) => state.lastOrderNumber);

export const useCommandeFilters = () => 
  useCommandeStore((state) => ({
    selectedStatus: state.selectedStatus,
    currentPage: state.currentPage,
    setSelectedStatus: state.setSelectedStatus,
    setCurrentPage: state.setCurrentPage,
    resetFilters: state.resetFilters,
  }));

// Helper functions sélectionnées individuellement pour éviter les boucles infinies
// Utilise useMemo pour mémoriser l'objet retourné et éviter les re-renders inutiles
export const useCommandeHelpers = () => {
  const getStatusBadgeColor = useCommandeStore((state) => state.getStatusBadgeColor);
  const getStatusLabel = useCommandeStore((state) => state.getStatusLabel);
  const getStatusIcon = useCommandeStore((state) => state.getStatusIcon);
  
  return useMemo(
    () => ({
      getStatusBadgeColor,
      getStatusLabel,
      getStatusIcon,
    }),
    [getStatusBadgeColor, getStatusLabel, getStatusIcon]
  );
};
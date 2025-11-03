// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// ============================================
// CONFIGURATION DU QUERY CLIENT
// ============================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache
      staleTime: 5 * 60 * 1000, // 5 minutes - Les données restent "fraîches" pendant 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - Anciennement "cacheTime"
      
      // Retry
      retry: (failureCount, error: any) => {
        // Ne pas retry les erreurs 4xx (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry max 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Délai exponentiel: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Network
      networkMode: 'offlineFirst', // Continue à fonctionner offline avec cache
      
      // Refetch
      refetchOnWindowFocus: false, // Pas de refetch au focus sur mobile
      refetchOnReconnect: true, // Refetch à la reconnexion
      refetchOnMount: true, // Refetch au montage du composant
    },
    mutations: {
      retry: false, // Pas de retry automatique pour les mutations
      networkMode: 'online', // Les mutations nécessitent le réseau
    },
  },
});

// ============================================
// GESTION DU MODE OFFLINE
// ============================================

let isOnline = true;

// Écouter les changements de connexion
NetInfo.addEventListener(state => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? false;

  console.log(`📡 [Network] ${isOnline ? 'Online' : 'Offline'}`);

  // Refetch toutes les queries actives lors de la reconnexion
  if (!wasOnline && isOnline) {
    console.log('🔄 [Network] Reconnexion - Refetch des queries');
    queryClient.refetchQueries({ type: 'active' });
  }
});

// Export pour utilisation dans les hooks
export const getIsOnline = () => isOnline;
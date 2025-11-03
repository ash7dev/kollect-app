// src/store/authStore.ts - VERSION AMÉLIORÉE
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService, BackendUser } from '@/src/features/auth/services/auth.service';

// ============================================
// TYPES
// ============================================

interface AuthState {
  // État
  user: BackendUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions principales
  login: (kindeUser: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  initAuth: () => Promise<void>;
  
  // Actions internes (ne pas utiliser directement dans les composants)
  _setAuth: (user: BackendUser, token: string) => Promise<void>;
  _clearAuth: () => Promise<void>;
  _setError: (error: string | null) => void;
  _setLoading: (isLoading: boolean) => void;
  
  // Helpers
  hasRole: (role: 'isAdmin' | 'isCEO' | 'isClient') => boolean;
}

// ============================================
// STORE ZUSTAND
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ============================================
      // ACTIONS PUBLIQUES
      // ============================================

      /**
       * 🔐 Login complet (Kinde + Backend)
       */
      login: async (kindeUser) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('🔐 [AuthStore] Début du login...', kindeUser.email);

          // Synchroniser avec le backend
          const authData = await authService.syncWithBackend({
            id: kindeUser.id,
            email: kindeUser.email || '',
            given_name: kindeUser.givenName || null,
            family_name: kindeUser.familyName || null,
            picture: kindeUser.picture || null,
          });

          // Stocker les données
          await get()._setAuth(authData.user, authData.access_token);

          console.log('✅ [AuthStore] Login réussi');
        } catch (error: any) {
          console.error('❌ [AuthStore] Erreur login:', error);
          const message = error?.response?.data?.message || error?.message || 'Erreur de connexion';
          set({ error: message, isLoading: false });
          throw error; // Propager l'erreur pour que le composant puisse la gérer
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 🚪 Logout complet
       */
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('🚪 [AuthStore] Début du logout...');

          // Logout du backend
          try {
            await authService.logout();
          } catch (error) {
            // On continue même si le backend répond pas
            console.warn('⚠️ [AuthStore] Erreur backend logout (ignorée):', error);
          }

          // Effacer l'état local
          await get()._clearAuth();

          console.log('✅ [AuthStore] Logout réussi');
        } catch (error: any) {
          console.error('❌ [AuthStore] Erreur logout:', error);
          // On force la déconnexion locale même en cas d'erreur
          await get()._clearAuth();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 🔄 Rafraîchir l'authentification
       */
      refreshAuth: async () => {
        const { token } = get();

        if (!token) {
          console.warn('⚠️ [AuthStore] Pas de token pour rafraîchir');
          return;
        }

        try {
          set({ isLoading: true, error: null });
          
          console.log('🔄 [AuthStore] Rafraîchissement...');

          const authData = await authService.refreshProfile();

          await get()._setAuth(authData.user, authData.access_token);

          console.log('✅ [AuthStore] Rafraîchissement réussi');
        } catch (error: any) {
          console.error('❌ [AuthStore] Erreur refresh:', error);
          
          // Si 401, déconnecter l'utilisateur
          if (error?.response?.status === 401) {
            console.warn('🔒 [AuthStore] Session expirée, déconnexion...');
            await get().logout();
            throw new Error('Session expirée');
          }
          
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 🚀 Initialiser l'authentification au démarrage
       */
      initAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('🚀 [AuthStore] Initialisation...');

          // Récupérer le JWT backend
          const jwtToken = await SecureStore.getItemAsync('JWT_TOKEN');
          
          if (!jwtToken) {
            console.log('ℹ️ [AuthStore] Pas de token, utilisateur non authentifié');
            set({ isAuthenticated: false, isLoading: false });
            return;
          }

          // Récupérer les données utilisateur
          const userData = await authService.getUserData();

          if (!userData) {
            console.warn('⚠️ [AuthStore] Token présent mais pas de données utilisateur');
            await get()._clearAuth();
            return;
          }

          // Restaurer la session
          set({
            user: userData,
            token: jwtToken,
            isAuthenticated: true,
          });

          console.log('✅ [AuthStore] Session restaurée');

          // Vérifier si on doit rafraîchir
          const shouldRefresh = await authService.shouldRefreshToken();
          if (shouldRefresh) {
            console.log('🔄 [AuthStore] Token ancien, rafraîchissement...');
            await get().refreshAuth();
          }
        } catch (error: any) {
          console.error('❌ [AuthStore] Erreur init:', error);
          
          // En cas d'erreur, on efface tout
          await get()._clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      // ============================================
      // ACTIONS INTERNES
      // ============================================

      /**
       * 💾 Définir l'authentification (interne)
       */
      _setAuth: async (user, token) => {
        try {
          // Stocker le JWT backend en SecureStore
          await SecureStore.setItemAsync('JWT_TOKEN', token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
          });

          console.log('✅ [AuthStore] Auth établie', {
            userId: user.id,
            roles: { isAdmin: user.isAdmin, isCEO: user.isCEO, isClient: user.isClient },
          });
        } catch (error) {
          console.error('❌ [AuthStore] Erreur _setAuth:', error);
          throw error;
        }
      },

      /**
       * 🗑️ Effacer l'authentification (interne)
       */
      _clearAuth: async () => {
        try {
          // Supprimer tous les tokens
          await Promise.all([
            SecureStore.deleteItemAsync('ACCESS_TOKEN').catch(() => {}), // Token Kinde
            SecureStore.deleteItemAsync('JWT_TOKEN').catch(() => {}),    // JWT Backend
          ]);
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          console.log('✅ [AuthStore] Auth effacée');
        } catch (error) {
          console.error('❌ [AuthStore] Erreur _clearAuth:', error);
          throw error;
        }
      },

      /**
       * 🔴 Définir une erreur
       */
      _setError: (error) => {
        set({ error });
      },

      /**
       * ⏳ Définir l'état de chargement
       */
      _setLoading: (isLoading) => {
        set({ isLoading });
      },

      // ============================================
      // HELPERS
      // ============================================

      /**
       * 🎭 Vérifier si l'utilisateur a un rôle spécifique
       */
      hasRole: (role) => {
        const { user } = get();
        return user ? user[role] : false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // On persiste uniquement les données non sensibles
        user: state.user,
        // Le token est géré par SecureStore
      }),
    }
  )
);

// ============================================
// HOOKS UTILITAIRES
// ============================================

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export const useHasRole = (role: 'isAdmin' | 'isCEO' | 'isClient') => {
  return useAuthStore((state) => state.hasRole(role));
};

/**
 * Hook pour obtenir l'utilisateur actuel
 */
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

/**
 * Hook pour obtenir l'état d'authentification
 */
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};
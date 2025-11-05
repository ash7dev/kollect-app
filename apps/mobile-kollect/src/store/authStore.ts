/* eslint-disable no-unused-labels */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService, BackendUser, AuthResponse } from '../features/auth/services/auth.service';

const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_DATA: 'user_data',
  REFRESH_TIME: 'token_refresh_time',
};

// ============================================
// TYPES
// ============================================

export interface AuthState {
  user: BackendUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (kindeUser: any, fcmToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  initAuth: () => Promise<void>;
  updateUserRole: (role: 'client' | 'vendeur') => Promise<AuthResponse>;

  _setAuth: (user: BackendUser, token: string) => Promise<void>;
  _clearAuth: () => Promise<void>;
  _setError: (error: string | null) => void;
  _setLoading: (isLoading: boolean) => void;

  hasRole: (role: 'isAdmin' | 'isCEO' | 'isClient') => boolean;
}

// ============================================
// STORE ZUSTAND
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // ============================================
      // ACTIONS PUBLIQUES
      // ============================================

      updateUserRole: async (role) => {
        const { user, _setAuth } = get();
        if (!user) throw new Error("Aucun utilisateur connecté");

        try {
          set({ isLoading: true, error: null });
          const updatedData = await authService.updateUserRole(user.id, role, true);
          await _setAuth(updatedData.user, updatedData.access_token);
          return updatedData;
        } catch (error: any) {
          set({ error: error?.message || "Erreur lors de la mise à jour du rôle" });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (kindeUser, fcmToken?: string) => {
        try {
          set({ isLoading: true, error: null });
          const authData = await authService.syncWithBackend({
            id: kindeUser.id,
            email: kindeUser.email || '',
            given_name: kindeUser.givenName || null,
            family_name: kindeUser.familyName || null,
            picture: kindeUser.picture || null,
          }, fcmToken);

          await get()._setAuth(authData.user, authData.access_token);
        } catch (error: any) {
          set({ error: error?.message || 'Erreur de connexion' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await authService.logout();
          await get()._clearAuth();
        } catch (error) {
          await get()._clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      refreshAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          set({ isLoading: true, error: null });
          const authData = await authService.refreshProfile();
          await get()._setAuth(authData.user, authData.access_token);
        } catch (error: any) {
          if (error?.response?.status === 401) {
            await get().logout();
          }
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      initAuth: async (options?: { silent?: boolean }) => {
  const state = get();
  if (state.isInitialized) return;

  try {
    if (!options?.silent) {
      set({ isLoading: true });
    }
    
    const jwtToken = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);

    if (!jwtToken) {
      // ✅ Pas de token = CLEAR complet du store
      await get()._clearAuth();
      set({ 
        isAuthenticated: false, 
        user: null,
        token: null,
        isInitialized: true, 
        isLoading: false 
      });
      return;
    }

    // ✅ Si token existe, valider avec le backend
    const userData = await authService.getUserData();
    if (!userData) {
      await get()._clearAuth();
      return;
    }

    set({
      user: userData,
      token: jwtToken,
      isAuthenticated: true,
      isInitialized: true,
    });
  } catch (error) {
    console.error('[initAuth] Erreur:', error);
    await get()._clearAuth();
  } finally {
    set({ isLoading: false, isInitialized: true });
  }
},
      // ============================================
      // ACTIONS INTERNES
      // ============================================

      _setAuth: async (user, token) => {
        await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, token);
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true,
          error: null,
        });
      },

      _clearAuth: async () => {
        // ✅ 1. Supprimer le token SecureStore
        await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN).catch(() => {});
        
        // ✅ 2. Nettoyer AsyncStorage (persistence Zustand)
        await AsyncStorage.removeItem('auth-storage').catch(() => {});
        
        // ✅ 3. Reset complet du state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
          error: null,
        });
        
        console.log('🧹 [Auth] State complètement nettoyé');
      },

      _setError: (error) => set({ error }),
      _setLoading: (isLoading) => set({ isLoading }),

      hasRole: (role) => {
        const { user } = get();
        return user ? user[role] : false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
         user: state.user,
  token: state.token,  // ⬅️ Ajout critique
  isAuthenticated: state.isAuthenticated, 
       
      }),
    }
  )
);

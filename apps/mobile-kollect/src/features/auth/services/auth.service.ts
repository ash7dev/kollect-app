// services/auth.service.ts
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { apiUrl } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storage';
import { supabase } from './supabaseConfig';

// ============================================
// TYPES
// ============================================

interface BackendUser {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar?: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    isVerified: boolean;
  } | null;
  country?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface AuthResponse {
  access_token: string;
  user: BackendUser;
}

// ============================================
// CONFIGURATION
// ============================================

const API_URL = apiUrl;

// ============================================
// SERVICE D'AUTHENTIFICATION
// ============================================

class AuthService {
  // ============================================
  // SUPABASE AUTH METHODS
  // ============================================

  /**
   * 📧 Inscription par email + mot de passe
   */
  async signUpWithEmail(
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string },
  ): Promise<AuthResponse> {
    console.log('📧 [AUTH] Inscription Supabase email...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          given_name: metadata?.firstName,
          family_name: metadata?.lastName,
          full_name: [metadata?.firstName, metadata?.lastName].filter(Boolean).join(' '),
        },
      },
    });

    if (error) {
      console.error('❌ [AUTH] Erreur inscription Supabase:', error.message);
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error("Vérifiez votre email pour confirmer votre inscription");
    }

    // Synchroniser avec notre backend
    return this.syncWithBackend(data.session.access_token);
  }

  /**
   * 🔐 Connexion par email + mot de passe
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 [AUTH] Connexion Supabase email...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Erreur connexion Supabase:', error.message);
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error('Session non créée');
    }

    // Synchroniser avec notre backend
    return this.syncWithBackend(data.session.access_token);
  }

  /**
   * 🌐 Connexion via Google OAuth
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    console.log('🌐 [AUTH] Connexion Google via Supabase...');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'kollect://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ [AUTH] Erreur Google Supabase:', error.message);
      throw new Error(error.message);
    }

    // Pour OAuth, on attend le callback et la session
    // La session sera récupérée via onAuthStateChange dans le store
    throw new Error('OAUTH_REDIRECT');
  }

  // ============================================
  // SYNC AVEC BACKEND
  // ============================================

  /**
   * 🔐 Synchronise avec le backend après login Supabase
   */
  async syncWithBackend(supabaseAccessToken: string, fcmToken?: string): Promise<AuthResponse> {
    try {
      console.log('📤 [AUTH] Synchronisation avec backend...');

      const response = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseAccessToken,
          fcmToken: fcmToken || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }

      const data: AuthResponse = await response.json();

      console.log('✅ [AUTH] Synchronisation réussie', {
        userId: data.user.id,
        roles: {
          isAdmin: data.user.isAdmin,
          isCEO: data.user.isCEO,
          isClient: data.user.isClient,
        },
      });

      // Stocker le JWT backend et les données utilisateur
      await this.storeAuthData(data);

      return data;
    } catch (error) {
      console.error('❌ [AUTH] Erreur de synchronisation:', error);
      throw new Error(
        `Impossible de se connecter au serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  // ============================================
  // GESTION DES RÔLES
  // ============================================

  /**
   * 🧭 Mettre à jour le rôle utilisateur et marquer le prompt comme vu
   */
  async updateUserRole(
    userId: string,
    role: 'client' | 'vendeur',
    hasSeenCreatorPrompt = true,
  ): Promise<AuthResponse> {
    try {
      console.log('🧭 [AUTH] Mise à jour du rôle utilisateur...', { userId, role });

      const token = await this.getToken();
      if (!token) throw new Error('No JWT token found');

      const response = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choice: role,
          hasSeenCreatorPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      const data: AuthResponse = await response.json();

      // Stocker les nouvelles données et le nouveau token
      await this.storeAuthData(data);

      console.log('✅ [AUTH] Rôle mis à jour avec succès');
      return data;
    } catch (error) {
      console.error('❌ [AUTH] Erreur updateUserRole:', error);
      throw error;
    }
  }

  // ============================================
  // STOCKAGE SÉCURISÉ
  // ============================================

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, authData.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TIME, Date.now().toString());

      console.log('💾 [AUTH] Données stockées en sécurité');
    } catch (error) {
      console.error('❌ [AUTH] Erreur stockage:', error);
      throw new Error('Impossible de sauvegarder les données de connexion');
    }
  }

  // ============================================
  // REFRESH & PROFIL
  // ============================================

  /**
   * 🔄 Rafraîchir le profil utilisateur
   */
  async refreshProfile(): Promise<AuthResponse> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error('No token found');
      }

      console.log('🔄 [AUTH] Rafraîchissement du profil...');

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.clearAuthData();
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      // Mettre à jour les données stockées
      await this.storeAuthData(data);

      console.log('✅ [AUTH] Profil rafraîchi', {
        roles: {
          isAdmin: data.user.isAdmin,
          isCEO: data.user.isCEO,
          isClient: data.user.isClient,
        },
      });

      return data;
    } catch (error) {
      console.error('❌ [AUTH] Erreur rafraîchissement:', error);
      throw error;
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * 🔑 Récupérer le token JWT backend
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    } catch (error) {
      console.error('❌ [AUTH] Erreur récupération token:', error);
      return null;
    }
  }

  /**
   * 👤 Récupérer les données utilisateur stockées
   */
  async getUserData(): Promise<BackendUser | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ [AUTH] Erreur récupération user:', error);
      return null;
    }
  }

  /**
   * ✅ Vérifier si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * 🕐 Vérifier si le token doit être rafraîchi (> 6 heures)
   */
  async shouldRefreshToken(): Promise<boolean> {
    try {
      const refreshTime = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TIME);
      if (!refreshTime) return true;

      const lastRefresh = parseInt(refreshTime, 10);
      const sixHoursInMs = 6 * 60 * 60 * 1000;
      const now = Date.now();

      return now - lastRefresh > sixHoursInMs;
    } catch {
      return true;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  /**
   * 🚪 Déconnexion complète (Supabase + backend)
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 [AUTH] Déconnexion...');

      // 1. Déconnecter Supabase
      await supabase.auth.signOut().catch(() => { });

      // 2. Nettoyer les données locales
      await this.clearAuthData();

      console.log('✅ [AUTH] Déconnexion réussie');
    } catch (error) {
      console.error('❌ [AUTH] Erreur déconnexion:', error);
    }
  }

  /**
   * 🗑️ Supprimer toutes les données d'authentification
   */
  private async clearAuthData(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TIME);
  }

  // ============================================
  // REQUÊTES AUTHENTIFIÉES
  // ============================================

  /**
   * 📡 Faire une requête API authentifiée
   */
  async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 🎭 Vérifier si l'utilisateur a un rôle spécifique
   */
  async hasRole(role: 'isAdmin' | 'isCEO' | 'isClient'): Promise<boolean> {
    const user = await this.getUserData();
    return user ? user[role] : false;
  }

  /**
   * 📊 Obtenir les statistiques d'authentification
   */
  async getAuthStats() {
    const isAuth = await this.isAuthenticated();
    const user = await this.getUserData();
    const shouldRefresh = await this.shouldRefreshToken();

    return {
      isAuthenticated: isAuth,
      user: user,
      shouldRefresh,
      roles: user
        ? {
          isAdmin: user.isAdmin,
          isCEO: user.isCEO,
          isClient: user.isClient,
        }
        : null,
    };
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const authService = new AuthService();

// ============================================
// HELPER: Afficher les erreurs à l'utilisateur
// ============================================

export const showAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Une erreur est survenue';

  Alert.alert("Erreur d'authentification", message);
};

// ============================================
// TYPES EXPORTS
// ============================================

export type { BackendUser, AuthResponse };

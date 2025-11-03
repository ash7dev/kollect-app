// services/auth.service.ts
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

interface KindeUser {
  id: string;
  email: string;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
}

interface BackendUser {
  id: string;
  kindeId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar?: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
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

const API_URL = __DEV__
  ? 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api'
  : 'https://votre-api-production.com/api';

const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_DATA: 'user_data',
  REFRESH_TIME: 'token_refresh_time',
};

// ============================================
// SERVICE D'AUTHENTIFICATION
// ============================================

class AuthService {
  /**
   * 🔐 Étape principale : Synchroniser avec le backend après login Kinde
   */
  async syncWithBackend(kindeUser: KindeUser): Promise<AuthResponse> {
    try {
      console.log('📤 [AUTH] Synchronisation avec backend...', {
        kindeId: kindeUser.id,
        email: kindeUser.email,
      });
      console.log('URL de la requête:', `${API_URL}/auth/sync`);
      console.log('Données envoyées:', {
  kindeId: kindeUser.id,
  email: kindeUser.email,
  // ... autres champs
});
      const response = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kindeId: kindeUser.id,
          email: kindeUser.email,
          firstName: kindeUser.given_name,
          lastName: kindeUser.family_name,
          avatar: kindeUser.picture,
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
        `Impossible de se connecter au serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  /**
   * 💾 Stocker les données d'authentification de manière sécurisée
   */
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

  /**
   * 🔄 Rafraîchir le profil utilisateur (récupère les rôles à jour)
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré ou invalide
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

  /**
   * 🔑 Récupérer le token JWT
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

  /**
   * 🚪 Déconnexion complète
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 [AUTH] Déconnexion...');
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

  /**
   * 📡 Faire une requête API authentifiée
   */
  async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
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
      roles: user ? {
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        isClient: user.isClient,
      } : null,
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
  const message = error instanceof Error 
    ? error.message 
    : 'Une erreur est survenue';
    
  Alert.alert('Erreur d\'authentification', message);
};

// ============================================
// TYPES EXPORTS
// ============================================

export type { KindeUser, BackendUser, AuthResponse };
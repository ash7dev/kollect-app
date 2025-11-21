/* eslint-disable import/no-named-as-default-member */
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// ============================================
// CONFIGURATION DE BASE
// ============================================

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';

const API_TIMEOUT = 30000; // 30 secondes

// ============================================
// CRÉATION DU CLIENT AXIOS
// ============================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================
// INTERCEPTEUR DE REQUÊTE (Ajouter le JWT)
// ============================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Récupérer le JWT backend
      const token = await SecureStore.getItemAsync('JWT_TOKEN');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 [API] Token ajouté à la requête:', config.url);
      }
      
      // Log de la requête en développement
      if (__DEV__) {
        console.log('📤 [API Request]', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }
      
      return config;
    } catch (error) {
      console.error('❌ [API] Erreur intercepteur requête:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ [API] Erreur configuration requête:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTEUR DE RÉPONSE (Gestion des erreurs)
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    // Log de la réponse en développement
    if (__DEV__) {
      console.log('📥 [API Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log de l'erreur
    console.error('❌ [API Error]', {
      status: error.response?.status,
      url: originalRequest?.url,
      message: error.message,
      data: error.response?.data,
    });

    // ============================================
    // GESTION DES ERREURS SPÉCIFIQUES
    // ============================================

    // 401 - Non autorisé (token expiré ou invalide)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token via /auth/me
        console.log('🔄 [API] Tentative de rafraîchissement du token...');
        
        const token = await SecureStore.getItemAsync('JWT_TOKEN');
        
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Stocker le nouveau token
        const newToken = response.data.access_token;
        await SecureStore.setItemAsync('JWT_TOKEN', newToken);

        // Réessayer la requête originale avec le nouveau token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        console.log('✅ [API] Token rafraîchi, nouvelle tentative...');
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ [API] Échec du rafraîchissement, déconnexion...');
        
        // Supprimer les tokens
        await SecureStore.deleteItemAsync('JWT_TOKEN');
        await SecureStore.deleteItemAsync('ACCESS_TOKEN');
        
        // Rediriger vers la page de connexion
        router.replace('/(auth)/login');
        
        return Promise.reject(refreshError);
      }
    }

    // 403 - Accès interdit
    if (error.response?.status === 403) {
      console.warn('🚫 [API] Accès refusé');
      // Vous pouvez afficher une alerte ou rediriger
    }

    // 404 - Ressource non trouvée
    if (error.response?.status === 404) {
      console.warn('🔍 [API] Ressource non trouvée');
    }

    // 500 - Erreur serveur
    if (error.response?.status === 500) {
      console.error('💥 [API] Erreur serveur');
    }

    // Pas de connexion réseau
    if (error.message === 'Network Error') {
      console.error('📡 [API] Pas de connexion réseau');
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER: Vérifier la connexion API
// ============================================

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/auth/health`, {
      timeout: 5000,
    });
    
    console.log('✅ [API] Health check OK:', response.data);
    return response.status === 200;
  } catch (error) {
    console.error('❌ [API] Health check failed:', error);
    return false;
  }
};

// ============================================
// HELPER: Logger la configuration
// ============================================

export const logApiConfig = () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 [API] Configuration:');
  console.log(`   Base URL: ${API_URL}`);
  console.log(`   Timeout: ${API_TIMEOUT}ms`);
  console.log(`   Environment: ${__DEV__ ? 'Development' : 'Production'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// ============================================
// TYPES POUR LES ERREURS API
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error);
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inconnue est survenue';
};
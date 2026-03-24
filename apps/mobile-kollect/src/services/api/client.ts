/* eslint-disable import/no-named-as-default-member */
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { apiUrl } from '@/config/env';
import { applyInterceptors } from './interceptors';

// ============================================
// CONFIGURATION DE BASE
// ============================================

const API_TIMEOUT = 30000; // 30 secondes

// ============================================
// CRÉATION DU CLIENT AXIOS
// ============================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Bypasse la page d'avertissement ngrok en développement
    'ngrok-skip-browser-warning': 'true',
  },
});

// Appliquer les intercepteurs depuis le fichier dédié
applyInterceptors(apiClient);


// ============================================
// HELPER: Vérifier la connexion API
// ============================================

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${apiUrl}/auth/health`, {
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
  console.log(`   Base URL: ${apiUrl}`);
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

// src/services/api/client.ts
// Client Axios pour les appels client-side authentifiés
'use client';

import axios, {
    type AxiosInstance,
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';

// ============================================
// POURQUOI PLUS DE TOKEN CÔTÉ JS ?
// ============================================
//
// Le JWT backend est désormais dans un cookie httpOnly "kollect_jwt".
// httpOnly = inaccessible à JavaScript → protégé contre le vol via XSS.
// Le browser l'envoie automatiquement grâce à withCredentials: true.
// On n'a plus besoin de lire, stocker, ou injecter quoi que ce soit.

// ============================================
// CONFIGURATION
// ============================================

const API_TIMEOUT = 30_000; // 30s

// ============================================
// CRÉATION DU CLIENT
// ============================================

export const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl,
    timeout: API_TIMEOUT,
    // withCredentials: true → le browser joint automatiquement le cookie kollect_jwt
    // à chaque requête vers le backend. Obligatoire pour les cookies cross-origin.
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// ============================================
// INTERCEPTEUR REQUEST — logging dev uniquement
// ============================================

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (env.isDev) {
            console.log('📤 [API Request]', {
                method: config.method?.toUpperCase(),
                url: config.url,
            });
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ============================================
// INTERCEPTEUR RESPONSE — gestion des erreurs
// ============================================

apiClient.interceptors.response.use(
    (response) => {
        if (env.isDev) {
            console.log('📥 [API Response]', {
                status: response.status,
                url: response.config.url,
            });
        }
        return response;
    },
    (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (env.isDev) {
            console.error('❌ [API Error]', {
                status: error.response?.status,
                url: originalRequest?.url,
                message: error.message,
            });
        }

        // 401 — Le cookie est expiré ou absent.
        // Le AuthProvider réagira via onAuthStateChange (TOKEN_REFRESHED de Supabase)
        // si la session Supabase est encore valide. Sinon → login.
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    },
);

// ============================================
// HELPERS
// ============================================

export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    error?: string;
}

export const isApiError = (
    error: unknown,
): error is AxiosError<ApiErrorResponse> => {
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

export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${env.apiUrl}/auth/health`, {
            timeout: 5000,
        });
        return response.status === 200;
    } catch {
        return false;
    }
};

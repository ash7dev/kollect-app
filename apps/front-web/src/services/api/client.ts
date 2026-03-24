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
// CONFIGURATION
// ============================================

const API_TIMEOUT = 30_000; // 30s

// ============================================
// CRÉATION DU CLIENT
// ============================================

export const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Required to bypass the ngrok browser warning page
        'ngrok-skip-browser-warning': 'true',
    },
});

// ============================================
// INTERCEPTEUR REQUEST — Inject Bearer token
// ============================================

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        try {
            const token =
                typeof window !== 'undefined'
                    ? localStorage.getItem('auth-token')
                    : null;

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (env.isDev) {
                console.log('📤 [API Request]', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                });
            }

            return config;
        } catch {
            return config;
        }
    },
    (error) => Promise.reject(error),
);

// ============================================
// INTERCEPTEUR RESPONSE — Gestion des erreurs
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
    async (error: AxiosError) => {
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

        // 401 — Token expiré ou invalide
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = localStorage.getItem('auth-token');
                if (!token) throw new Error('No token available');

                // Tenter de rafraîchir via /auth/me
                const response = await axios.get(`${env.apiUrl}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const newToken = response.data.access_token;
                localStorage.setItem('auth-token', newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                return apiClient(originalRequest);
            } catch {
                // Échec du refresh — déconnexion
                localStorage.removeItem('auth-token');
                localStorage.removeItem('auth-storage');

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }

                return Promise.reject(error);
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

// src/services/api/interceptors.ts
// Intercepteurs Axios pour le client API mobile

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { apiUrl } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storage';
import axios from 'axios';

export function applyInterceptors(client: AxiosInstance): void {
  // ── Request interceptor ──────────────────────────────────────────────────
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log('📤 [API]', config.method?.toUpperCase(), config.url);
        }
      } catch {
        // Ne pas bloquer la requête si SecureStore échoue
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ── Response interceptor ─────────────────────────────────────────────────
  client.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log('📥 [API]', response.status, response.config.url);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (__DEV__) {
        console.error('❌ [API]', error.response?.status, originalRequest?.url, error.message);
      }

      // 401 — token expiré, tentative de refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
          if (!token) throw new Error('No token');

          const res = await axios.get(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });

          const newToken: string = res.data.access_token;
          await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
          router.replace('/(auth)/login');
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );
}

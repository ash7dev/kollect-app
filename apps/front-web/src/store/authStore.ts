// src/store/authStore.ts
// Store Zustand d'authentification — Supabase Auth + sync backend
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/config/supabaseClient';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { BackendUser, AuthResponse } from '@/types/api';

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

    // Supabase auth actions
    signUpWithEmail: (
        email: string,
        password: string,
        metadata?: { firstName?: string; lastName?: string },
    ) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;

    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    initAuth: () => Promise<void>;
    updateUserRole: (role: 'client' | 'vendeur') => Promise<AuthResponse>;
    hasRole: (role: 'isAdmin' | 'isCEO' | 'isClient') => boolean;

    // Actions internes
    _setAuth: (user: BackendUser, token: string) => void;
    _clearAuth: () => void;
    _setError: (error: string | null) => void;
    _setLoading: (isLoading: boolean) => void;
}

// ============================================
// HELPER: Sync Supabase token with backend
// ============================================

async function syncSupabaseWithBackend(supabaseAccessToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SYNC,
        { supabaseAccessToken },
    );
    return response.data;
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
            // ACTIONS PUBLIQUES — SUPABASE AUTH
            // ============================================

            signUpWithEmail: async (email, password, metadata) => {
                try {
                    set({ isLoading: true, error: null });

                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                given_name: metadata?.firstName,
                                family_name: metadata?.lastName,
                                full_name: [metadata?.firstName, metadata?.lastName]
                                    .filter(Boolean)
                                    .join(' '),
                            },
                        },
                    });

                    if (error) throw new Error(error.message);

                    if (!data.session) {
                        throw new Error('Vérifiez votre email pour confirmer votre inscription');
                    }

                    // Sync avec backend
                    const authData = await syncSupabaseWithBackend(data.session.access_token);
                    get()._setAuth(authData.user, authData.access_token);
                } catch (error: unknown) {
                    const message =
                        error instanceof Error ? error.message : "Erreur lors de l'inscription";
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            signInWithEmail: async (email, password) => {
                try {
                    set({ isLoading: true, error: null });

                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) throw new Error(error.message);
                    if (!data.session) throw new Error('Session non créée');

                    // Sync avec backend
                    const authData = await syncSupabaseWithBackend(data.session.access_token);
                    get()._setAuth(authData.user, authData.access_token);
                } catch (error: unknown) {
                    const message =
                        error instanceof Error ? error.message : 'Erreur de connexion';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            signInWithGoogle: async () => {
                try {
                    set({ isLoading: true, error: null });

                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                        },
                    });

                    if (error) throw new Error(error.message);

                    // Supabase redirige vers Google — le callback sera géré via /auth/callback
                } catch (error: unknown) {
                    const message =
                        error instanceof Error ? error.message : 'Erreur de connexion Google';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // 1. Logout Supabase
                    await supabase.auth.signOut().catch(() => { });

                    // 2. Logout backend
                    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => { });
                } finally {
                    get()._clearAuth();
                    set({ isLoading: false });
                }
            },

            refreshAuth: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    set({ isLoading: true, error: null });

                    const response = await apiClient.get<AuthResponse>(
                        API_ENDPOINTS.AUTH.ME,
                    );

                    const { user, access_token } = response.data;
                    get()._setAuth(user, access_token);
                } catch (error: unknown) {
                    const axiosError = error as { response?: { status?: number } };
                    if (axiosError.response?.status === 401) {
                        await get().logout();
                    }
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            initAuth: async () => {
                const state = get();
                if (state.isInitialized) return;

                try {
                    set({ isLoading: true });

                    const token = localStorage.getItem('auth-token');

                    if (!token) {
                        // Vérifier si Supabase a une session (ex: retour OAuth callback)
                        const { data: { session } } = await supabase.auth.getSession();

                        if (session) {
                            // Sync avec backend si session Supabase existe
                            try {
                                const authData = await syncSupabaseWithBackend(session.access_token);
                                get()._setAuth(authData.user, authData.access_token);
                                set({ isInitialized: true, isLoading: false });
                                return;
                            } catch {
                                // Si sync échoue, continue without auth
                            }
                        }

                        get()._clearAuth();
                        set({ isInitialized: true, isLoading: false });
                        return;
                    }

                    const response = await apiClient.get<AuthResponse>(
                        API_ENDPOINTS.AUTH.ME,
                    );

                    const { user, access_token } = response.data;
                    set({
                        user,
                        token: access_token,
                        isAuthenticated: true,
                        isInitialized: true,
                    });
                } catch {
                    get()._clearAuth();
                } finally {
                    set({ isLoading: false, isInitialized: true });
                }
            },

            updateUserRole: async (role) => {
                const { user } = get();
                if (!user) throw new Error('Aucun utilisateur connecté');

                try {
                    set({ isLoading: true, error: null });

                    const response = await apiClient.patch<AuthResponse>(
                        `/auth/users/${user.id}/role`,
                        { choice: role, hasSeenCreatorPrompt: true },
                    );

                    const { user: updatedUser, access_token } = response.data;
                    get()._setAuth(updatedUser, access_token);
                    return response.data;
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : 'Erreur lors de la mise à jour du rôle';
                    set({ error: message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            hasRole: (role) => {
                const { user } = get();
                return user ? user[role] : false;
            },

            // ============================================
            // ACTIONS INTERNES
            // ============================================

            _setAuth: (user, token) => {
                localStorage.setItem('auth-token', token);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isInitialized: true,
                    error: null,
                });
            },

            _clearAuth: () => {
                localStorage.removeItem('auth-token');
                localStorage.removeItem('auth-storage');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isInitialized: true,
                    error: null,
                });
            },

            _setError: (error) => set({ error }),
            _setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);

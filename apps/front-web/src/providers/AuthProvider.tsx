'use client';

/**
 * AuthProvider
 *
 * Architecture de sécurité :
 * ┌─────────────────────────────────────────────────────────┐
 * │  Supabase session  →  cookie httpOnly (géré par @supabase/ssr)  │
 * │  Backend JWT       →  cookie httpOnly "kollect_jwt"             │
 * │  User data         →  React state (mémoire, pas de storage)     │
 * └─────────────────────────────────────────────────────────┘
 *
 * Le JWT backend n'est JAMAIS lu par JavaScript.
 * Le browser l'envoie automatiquement via withCredentials: true.
 * Le AuthProvider ne gère que les données utilisateur (user object).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/config/supabaseClient';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { AuthResponse, BackendUser } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Données utilisateur backend (null si non connecté) */
  user: BackendUser | null;
  /** true pendant l'initialisation ou une action en cours */
  isLoading: boolean;
  /** true dès que la session a été vérifiée au moins une fois */
  isInitialized: boolean;

  // ── Actions ──
  signUpWithEmail: (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  signInWithEmail: (params: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'client' | 'vendeur') => Promise<AuthResponse>;
  /** Applique directement une AuthResponse reçue d'un appel backend (ex: création de marque) */
  applyAuthResponse: (data: AuthResponse) => void;
  /** Recharge les données user depuis /auth/me */
  refreshUser: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Helper — sync avec le backend
// Le backend va set le cookie httpOnly "kollect_jwt" dans sa réponse Set-Cookie.
// Côté client on ne lit jamais ce cookie, on récupère juste le user object.
// ─────────────────────────────────────────────────────────────────────────────

async function syncWithBackend(supabaseAccessToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SYNC, {
    supabaseAccessToken,
  });
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Helpers internes ──────────────────────────────────────────────────────

  // applyAuthResponse : met à jour uniquement le user en mémoire.
  // Le token JWT est dans le cookie httpOnly → le backend l'a déjà set.
  const applyAuthResponse = useCallback((data: AuthResponse) => {
    if (!mountedRef.current) return;
    setUser(data.user);
  }, []);

  const clearAuth = useCallback(() => {
    if (!mountedRef.current) return;
    setUser(null);
  }, []);

  // ── Initialisation + écoute Supabase ─────────────────────────────────────

  useEffect(() => {
    let initialized = false;

    // 1. Restaure la session existante au chargement de la page
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mountedRef.current) {
          // syncWithBackend → le backend set le cookie ET retourne le user
          const authData = await syncWithBackend(session.access_token);
          if (mountedRef.current) applyAuthResponse(authData);
        }
      } catch {
        if (mountedRef.current) clearAuth();
      } finally {
        initialized = true;
        if (mountedRef.current) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initialize();

    // 2. Réagit aux changements Supabase (OAuth callback, refresh token, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        // Pendant l'init, getSession() s'en occupe — évite le double sync
        if (!initialized && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) return;

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          // TOKEN_REFRESHED : Supabase a refreshé son token → on re-sync le backend
          // pour que le cookie "kollect_jwt" soit aussi renouvelé
          try {
            const authData = await syncWithBackend(session.access_token);
            if (mountedRef.current) applyAuthResponse(authData);
          } catch {
            if (mountedRef.current) clearAuth();
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [applyAuthResponse, clearAuth]);

  // ── Actions publiques ────────────────────────────────────────────────────

  const signUpWithEmail = useCallback(async ({
    email, password, firstName, lastName,
  }: {
    email: string; password: string; firstName: string; lastName: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          given_name: firstName,
          family_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.session) {
      throw new Error('Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.');
    }
    // onAuthStateChange SIGNED_IN → syncWithBackend → cookie set par le backend
  }, []);

  const signInWithEmail = useCallback(async ({
    email, password,
  }: {
    email: string; password: string;
  }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect.');
      }
      throw new Error(error.message);
    }
    // onAuthStateChange SIGNED_IN prend le relais
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    // On vide l'état local immédiatement
    clearAuth();
    // Backend efface le cookie httpOnly + Supabase efface sa session
    await Promise.allSettled([
      apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
      supabase.auth.signOut(),
    ]);
  }, [clearAuth]);

  const updateUserRole = useCallback(async (role: 'client' | 'vendeur'): Promise<AuthResponse> => {
    if (!user) throw new Error('Aucun utilisateur connecté.');

    const { data } = await apiClient.patch<AuthResponse>(
      `/auth/users/${user.id}/role`,
      { choice: role, hasSeenCreatorPrompt: true },
    );

    // Le backend a set un nouveau cookie avec le rôle mis à jour
    applyAuthResponse(data);
    return data;
  }, [user, applyAuthResponse]);

  const refreshUser = useCallback(async () => {
    const { data } = await apiClient.get<AuthResponse>(API_ENDPOINTS.AUTH.ME);
    // Renouvelle aussi le cookie (sliding session)
    applyAuthResponse(data);
  }, [applyAuthResponse]);

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isInitialized,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      updateUserRole,
      applyAuthResponse,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() doit être utilisé à l\'intérieur de <AuthProvider>.');
  return ctx;
}

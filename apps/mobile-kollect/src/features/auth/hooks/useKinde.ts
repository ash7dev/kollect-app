// src/features/auth/hooks/useKinde.ts
import { useState, useCallback, useEffect } from 'react';
import { useKindeAuth } from '@kinde/expo';
import { getUserProfile } from '@kinde/expo/utils';
import type { UserProfile } from '@kinde/expo/utils';
import * as SecureStore from 'expo-secure-store';

const GOOGLE_CONN_ID = 'conn_019a3b44508a02e437ab4c788d780f20';
const EMAIL_CONN_ID  = 'conn_019a3a0e093513699f80ca5ad9af4df1';

export const useKinde = () => {
  const kinde = useKindeAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleResponse = async (resp: any) => {
    if (!resp?.access_token) throw new Error('No token');
    const profile = await getUserProfile();
    setUser(profile);
    setToken(resp.access_token);
    await SecureStore.setItemAsync('ACCESS_TOKEN', resp.access_token);
    return { user: profile, token: resp.access_token };
  };

  // ---------- EMAIL LOGIN ----------
  const loginWithEmail = useCallback(async (email?: string) => {
    setLoading(true); 
    setError(null);
    try {
      // ✅ Paramètres selon la doc React Native SDK
      const resp = await kinde.login({
        connectionId: EMAIL_CONN_ID,
        loginHint: email || undefined
      });
      return await handleResponse(resp);
    } catch (e: any) { 
      console.error('Erreur login email:', e);
      setError(e); 
      throw e; 
    } finally { 
      setLoading(false); 
    }
  }, [kinde]);

  // ---------- EMAIL REGISTER ----------
  const registerWithEmail = useCallback(async (email?: string) => {
    setLoading(true); 
    setError(null);
    try {
      // ✅ Paramètres selon la doc React Native SDK
      const resp = await kinde.register({
        connectionId: EMAIL_CONN_ID,
        loginHint: email || undefined
      });
      return await handleResponse(resp);
    } catch (e: any) { 
      console.error('Erreur register email:', e);
      setError(e); 
      throw e; 
    } finally { 
      setLoading(false); 
    }
  }, [kinde]);

  // ---------- SOCIAL LOGIN ----------
  const loginWithProvider = useCallback(async (provider: 'google' | 'apple') => {
    setLoading(true); 
    setError(null);
    try {
      const connectionId = provider === 'google' ? GOOGLE_CONN_ID : 'apple';
      const resp = await kinde.login({ connectionId });
      return await handleResponse(resp);
    } catch (e: any) { 
      console.error(`Erreur login ${provider}:`, e);
      setError(e); 
      throw e; 
    } finally { 
      setLoading(false); 
    }
  }, [kinde]);

  // ---------- LOGOUT ----------
  const logout = useCallback(async () => {
    setLoading(true); 
    setError(null);
    try {
      await kinde.logout({ revokeToken: true });
      setUser(null); 
      setToken(null);
      await SecureStore.deleteItemAsync('ACCESS_TOKEN');
    } catch (e: any) { 
      console.error('Erreur logout:', e);
      setError(e); 
      throw e; 
    } finally { 
      setLoading(false); 
    }
  }, [kinde]);

  // ---------- INIT ----------
  useEffect(() => {
    const init = async () => {
      if (kinde.isAuthenticated) {
        const profile = await getUserProfile();
        if (profile) {
          setUser(profile);
          const t = await SecureStore.getItemAsync('ACCESS_TOKEN');
          if (t) setToken(t);
        }
      }
    };
    init();
  }, [kinde.isAuthenticated]);

  return {
    ...kinde,
    user,
    token,
    loading,
    error,
    login: loginWithEmail,
    register: registerWithEmail,
    loginWithEmail,
    registerWithEmail,
    loginWithProvider,
    logout,
    isAuthenticated: kinde.isAuthenticated,
  };
};
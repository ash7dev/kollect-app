// src/features/auth/hooks/useKinde.ts
import { useState, useCallback, useEffect } from 'react';
import { useKindeAuth } from '@kinde/expo';
import { getUserProfile } from '@kinde/expo/utils';
import type { UserProfile } from '@kinde/expo/utils';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const GOOGLE_CONN_ID = 'conn_019a3b44508a02e437ab4c788d780f20';
const EMAIL_CONN_ID  = 'conn_019a3a0e093513699f80ca5ad9af4df1';

export const useKinde = () => {
  const kinde = useKindeAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleResponse = async (resp: any) => {
    // Afficher la réponse complète de Kinde dans la console
    console.log('🔑 Réponse complète de Kinde:', JSON.stringify(resp, null, 2));
    
    // Vérifier le token en utilisant la bonne casse (camelCase)
    const accessToken = resp?.accessToken || resp?.access_token;
    if (!accessToken) {
      console.error('❌ Aucun token trouvé dans la réponse');
      throw new Error('No token found in response');
    }
    
    // Récupérer le profil utilisateur
    const profile = await getUserProfile();
    console.log('👤 Profil utilisateur récupéré:', JSON.stringify(profile, null, 2));
    
    // Mettre à jour l'état
    setUser(profile);
    setToken(accessToken);
    
    // Stocker le token de manière sécurisée
    await SecureStore.setItemAsync('ACCESS_TOKEN', accessToken);
    console.log('✅ Token stocké avec succès');
    
    // Afficher le token (à des fins de débogage uniquement, à supprimer en production)
    console.log('🔐 Token d\'accès:', accessToken);
    
    return { user: profile, token: accessToken };
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
    // Rediriger vers la page de connexion après déconnexion réussie
    router.replace('/(auth)/login');
  } catch (e: any) { 
    console.error('Erreur logout:', e);
    setError(e); 
    throw e; 
  } finally { 
    setLoading(false); 
  }
}, [kinde]);  // Ajouter router aux dépendances

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
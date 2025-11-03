// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useKindeAuth } from '@kinde-oss/react-native-sdk-0-7x';
import { authService, showAuthError, type BackendUser } from '../services/auth.service';
import { useRouter } from 'expo-router'; // ou votre navigation

interface UseAuthReturn {
  // États
  isLoading: boolean;
  isAuthenticated: boolean;
  user: BackendUser | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Rôles
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const kinde = useKindeAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<BackendUser | null>(null);

  /**
   * 🔄 Charger l'état d'authentification au démarrage
   */
  const loadAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const userData = await authService.getUserData();
        setUser(userData);

        // Rafraîchir si nécessaire
        const shouldRefresh = await authService.shouldRefreshToken();
        if (shouldRefresh) {
          console.log('🔄 [useAuth] Rafraîchissement automatique du token...');
          await refreshProfile();
        }
      }
    } catch (error) {
      console.error('❌ [useAuth] Erreur chargement auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🚀 Charger au montage du composant
   */
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  /**
   * 🔐 Login avec Kinde + Sync Backend
   */
  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔐 [useAuth] Début du login Kinde...');

      // 1. Login Kinde
      await kinde.login();

      // 2. Récupérer le profil Kinde
      const kindeUser = await kinde.getUserProfile();
      
      if (!kindeUser) {
        throw new Error('Impossible de récupérer le profil Kinde');
      }

      console.log('✅ [useAuth] Login Kinde réussi:', kindeUser.email);

      // 3. 🎯 SYNCHRONISATION AVEC LE BACKEND (ÉTAPE CRITIQUE)
      const authData = await authService.syncWithBackend({
        id: kindeUser.id,
        email: kindeUser.email,
        given_name: kindeUser.given_name,
        family_name: kindeUser.family_name,
        picture: kindeUser.picture,
      });

      // 4. Mettre à jour l'état local
      setIsAuthenticated(true);
      setUser(authData.user);

      console.log('✅ [useAuth] Connexion complète réussie');

      // 5. Navigation selon les rôles
      if (authData.user.isAdmin) {
        router.replace('/(admin)/dashboard');
      } else if (authData.user.isCEO) {
        router.replace('/(ceo)/dashboard');
      } else {
        router.replace('/(client)/home');
      }
    } catch (error) {
      console.error('❌ [useAuth] Erreur login:', error);
      showAuthError(error);
      
      // Nettoyage en cas d'erreur
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [kinde, router]);

  /**
   * 🔄 Rafraîchir le profil utilisateur
   */
  const refreshProfile = useCallback(async () => {
    try {
      console.log('🔄 [useAuth] Rafraîchissement du profil...');
      
      const authData = await authService.refreshProfile();
      setUser(authData.user);
      
      console.log('✅ [useAuth] Profil rafraîchi');
    } catch (error) {
      console.error('❌ [useAuth] Erreur refresh:', error);
      
      // Si le refresh échoue (token expiré), déconnecter
      if (error instanceof Error && error.message.includes('Session expirée')) {
        await logout();
      }
    }
  }, []);

  /**
   * 🚪 Logout complet (Kinde + Backend)
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚪 [useAuth] Déconnexion...');

      // 1. Logout Kinde
      await kinde.logout();

      // 2. Supprimer les données locales
      await authService.logout();

      // 3. Réinitialiser l'état
      setIsAuthenticated(false);
      setUser(null);

      console.log('✅ [useAuth] Déconnexion réussie');

      // 4. Rediriger vers login
      router.replace('/login');
    } catch (error) {
      console.error('❌ [useAuth] Erreur logout:', error);
      showAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [kinde, router]);

  return {
    // États
    isLoading,
    isAuthenticated,
    user,
    
    // Actions
    login,
    logout,
    refreshProfile,
    
    // Rôles (helpers)
    isAdmin: user?.isAdmin ?? false,
    isCEO: user?.isCEO ?? false,
    isClient: user?.isClient ?? false,
  };
};

// ============================================
// HOOK POUR VÉRIFIER LES RÔLES
// ============================================

export const useRequireRole = (
  requiredRole: 'isAdmin' | 'isCEO' | 'isClient'
) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user[requiredRole]) {
      // Rediriger si l'utilisateur n'a pas le bon rôle
      console.warn(`⚠️ [useRequireRole] Accès refusé: ${requiredRole} requis`);
      router.replace('/unauthorized');
    }
  }, [user, isLoading, requiredRole, router]);

  return { hasRole: user?.[requiredRole] ?? false, isLoading };
};
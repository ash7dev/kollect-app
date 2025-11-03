// src/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { router } from 'expo-router';

interface ErrorHandlerOptions {
  showAlert?: boolean;
  logoutOn401?: boolean;
  customMessage?: string;
}

export const useErrorHandler = () => {
  const clearAuth = useAuthStore((state) => state._clearAuth);

  const handleError = useCallback(
    (error: any, options: ErrorHandlerOptions = {}) => {
      const {
        showAlert = true,
        logoutOn401 = true,
        customMessage,
      } = options;

      console.error('❌ [Error]', error);

      // Extraire le message d'erreur
      let message = customMessage || 'Une erreur est survenue';
      let shouldLogout = false;

      if (error?.response) {
        // Erreur HTTP
        const status = error.response.status;
        
        switch (status) {
          case 401:
            message = 'Session expirée. Veuillez vous reconnecter.';
            shouldLogout = logoutOn401;
            break;
          case 403:
            message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
            break;
          case 404:
            message = 'Ressource introuvable.';
            break;
          case 422:
            message = 'Données invalides. Veuillez vérifier vos informations.';
            break;
          case 429:
            message = 'Trop de requêtes. Veuillez patienter quelques instants.';
            break;
          case 500:
            message = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            message = error.response.data?.message || message;
        }
      } else if (error?.message) {
        // Erreur JavaScript
        if (error.message.includes('Network request failed')) {
          message = 'Erreur de connexion. Vérifiez votre internet.';
        } else if (error.message.includes('timeout')) {
          message = 'La requête a expiré. Veuillez réessayer.';
        } else {
          message = error.message;
        }
      }

      // Afficher l'alerte si demandé
      if (showAlert) {
        Alert.alert('Erreur', message);
      }

      // Déconnecter si nécessaire
      if (shouldLogout) {
        // Appel asynchrone sans attendre le résultat
        // car nous ne voulons pas bloquer le flux d'erreur
        (async () => {
          try {
            await clearAuth();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Error during logout:', error);
          }
        })();
      }

      return message;
    },
    [clearAuth]
  );

  return { handleError };
};

// Hook pour les erreurs de mutation
export const useMutationError = () => {
  const { handleError } = useErrorHandler();

  return useCallback(
    (error: any, customMessage?: string) => {
      return handleError(error, {
        showAlert: true,
        customMessage,
      });
    },
    [handleError]
  );
};

// Hook pour les erreurs de query
export const useQueryError = () => {
  const { handleError } = useErrorHandler();

  return useCallback(
    (error: any) => {
      return handleError(error, {
        showAlert: false, // Ne pas afficher d'alerte pour les queries (on affiche dans l'UI)
        logoutOn401: true,
      });
    },
    [handleError]
  );
};
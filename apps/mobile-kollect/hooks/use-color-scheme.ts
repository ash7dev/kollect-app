import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Hook pour obtenir le schéma de couleur du système
 * Wrapper autour de useColorScheme de React Native pour la compatibilité
 */
export function useColorScheme(): 'light' | 'dark' | null {
  return useRNColorScheme();
}


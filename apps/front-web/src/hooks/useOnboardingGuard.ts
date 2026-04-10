'use client';

/**
 * useOnboardingGuard
 *
 * Indicateur de chargement utilisé dans les pages du dashboard CEO.
 * Retourne `checking: true` pendant l'hydratation initiale du client.
 *
 * IMPORTANT : Ce hook NE gère PAS les redirections.
 * C'est le rôle exclusif du middleware (middleware.ts).
 *
 * Usage :
 *   const { checking } = useOnboardingGuard();
 *   if (checking) return <Spinner />;
 */

import { useAuth } from '@/providers/AuthProvider';

export function useOnboardingGuard() {
  const { isInitialized } = useAuth();

  // `checking` est true uniquement pendant l'hydratation initiale
  return { checking: !isInitialized };
}

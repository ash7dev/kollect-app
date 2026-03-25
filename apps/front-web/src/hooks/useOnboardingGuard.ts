'use client';

/**
 * useOnboardingGuard
 *
 * À appeler dans les layouts/pages post-login (dashboard, feed…).
 * Si l'utilisateur est connecté mais n'a pas encore vu le prompt de rôle,
 * redirige automatiquement vers /onboarding.
 *
 * Usage :
 *   const { checking } = useOnboardingGuard();
 *   if (checking) return <Spinner />;
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export function useOnboardingGuard() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Attend que l'AuthProvider ait fini d'initialiser la session
    if (!isInitialized) return;

    if (!user) {
      // Non authentifié → le middleware s'en charge côté serveur
      setChecking(false);
      return;
    }

    if (!user.has_seen_creator_prompt) {
      // Nouvel utilisateur → doit choisir son rôle
      router.replace('/onboarding');
      return; // checking reste true pour éviter un flash de contenu
    }

    setChecking(false);
  }, [user, isInitialized, router]);

  return { checking };
}

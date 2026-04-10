'use client';

import { useAuth } from '@/providers/AuthProvider';

/**
 * DashboardGuard — Structure de l'espace CEO.
 *
 * Responsabilités :
 * - Montrer un spinner pendant l'hydratation initiale (isInitialized: false)
 *
 * Ce composant NE gère PAS les redirections.
 * C'est le rôle exclusif du middleware (middleware.ts).
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();

  // Spinner uniquement pendant l'hydratation initiale du client
  if (!isInitialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #F0F0F0', borderTopColor: '#E63329', animation: 'spin 0.75s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}


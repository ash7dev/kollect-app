'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

type AdminShellProps = {
  children: React.ReactNode;
};

/**
 * AdminShell — Structure de l'espace Admin.
 *
 * Responsabilités :
 * - Afficher la sidebar + header + contenu de l'admin
 * - Montrer un spinner pendant l'hydratation initiale (isInitialized: false)
 *
 * Ce composant NE gère PAS les redirections.
 * C'est le rôle exclusif du middleware (middleware.ts).
 */
export function AdminShell({ children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isInitialized } = useAuth();

  // Spinner uniquement pendant l'hydratation initiale du client
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#040405' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#040405' }}>
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


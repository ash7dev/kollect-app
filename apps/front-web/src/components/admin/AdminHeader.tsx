'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  menu:    'M4 6h16M4 12h16M4 18h16',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell:    'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9',
  logout:  'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
};

const ROUTES_MAP: Record<string, string> = {
  '/admin':               'Vue Globale Plateforme',
  '/admin/brands':        'Marques & Vendeurs',
  '/admin/users':         'Utilisateurs',
  '/admin/orders':        'Commandes Globales',
  '/admin/moderation':    'Modération des Avis',
  '/admin/communications':'Communications & Push',
  '/admin/system':        'Santé Système (BullMQ)',
  '/admin/routes':        'Schéma des Routes',
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const pageTitle = ROUTES_MAP[pathname || '/admin'] || 'Administration';

  return (
    <header style={{
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(4,4,5,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* ── Gauche : Menu Mobile & Titre ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuClick}
          className="admin-mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, color: '#111'
          }}
          aria-label="Ouvrir le menu"
        >
          <Icon d={ICONS.menu} size={24} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            {pageTitle}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Kollect Super Admin
          </p>
        </div>
      </div>

      {/* ── Droite : Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.05)', width: 240,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}><Icon d={ICONS.search} size={16} /></span>
          <input
            type="text"
            placeholder="Rechercher une commande, ID..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', color: '#fff' }}
          />
        </div>

        {/* Notifs */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', color: '#fff', padding: 4
        }}>
          <Icon d={ICONS.bell} size={20} />
          <div style={{
            position: 'absolute', top: 4, right: 4, width: 8, height: 8,
            background: '#FF3B30', borderRadius: '50%', border: '2px solid #fff'
          }} />
        </button>

        {/* Déconnexion */}
        <button
          onClick={() => signOut()}
          title="Se déconnecter"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#fff',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.1)'; e.currentTarget.style.color = '#FF3B30'; e.currentTarget.style.borderColor = 'rgba(255,59,48,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <Icon d={ICONS.logout} size={16} />
          Se déconnecter
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

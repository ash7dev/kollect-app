'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminSidebarSection =
  | 'overview'
  | 'brands'
  | 'users'
  | 'orders'
  | 'moderation'
  | 'communications'
  | 'system'
  | 'routes';

type AdminSidebarProps = {
  adminName?: string;
  adminRole?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 18 }: { d: string | string[]; size?: number }) {
  const paths = Array.isArray(d) ? d : [d];
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
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

const ICONS: Record<string, string | string[]> = {
  overview: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  brands: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  orders: ['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z'],
  moderation: ['M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'],
  communications: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4 20-7z'],
  system: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  routes: ['M4 6h16', 'M4 12h16', 'M4 18h10', 'M18 17l2 2 4-4'],
  collapse: 'M15 18l-6-6 6-6',
  expand: 'M9 18l6-6-6-6',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
};

const ITEMS: { id: AdminSidebarSection; label: string; href: string }[] = [
  { id: 'overview', label: 'Plateforme', href: '/admin' },
  { id: 'brands', label: 'Marques (Vendeurs)', href: '/admin/brands' },
  { id: 'users', label: 'Utilisateurs', href: '/admin/users' },
  { id: 'orders', label: 'Commandes Globales', href: '/admin/orders' },
  { id: 'moderation', label: 'Modération Avis', href: '/admin/moderation' },
  { id: 'communications', label: 'Communications', href: '/admin/communications' },
  { id: 'system', label: 'Santé Système', href: '/admin/system' },
  { id: 'routes', label: 'Schéma des Routes', href: '/admin/routes' },
];

const CSS = `
  .admin-sidebar {
    background: #0A0A0B;
    border-right: 1px solid rgba(255,255,255,0.08);
    color: #fff;
    box-shadow: 4px 0 32px rgba(0,0,0,0.5);
  }
  .admin-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 10px;
    padding: 10px 12px;
    color: rgba(255,255,255,0.55);
    transition: all 0.2s ease;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
  }
  .admin-nav-item:hover:not(.active) {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
  }
  .admin-nav-item.active {
    background: rgba(255,255,255,0.12);
    color: #fff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.2);
  }
  .admin-nav-item.active::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 3px;
    border-radius: 4px;
    background: #FF3B30;
    box-shadow: 0 0 10px rgba(255,59,48,0.6);
  }
  .admin-icon-wrap {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .admin-nav-item.active .admin-icon-wrap {
    color: #FF3B30;
    background: rgba(255,59,48,0.1);
  }
  .admin-toggle-btn {
    width: 100%;
    padding: 10px 0;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.4);
    transition: all 0.2s ease;
  }
  .admin-toggle-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
  .admin-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .admin-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #111 0%, #333 100%);
    border: 1px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
  }
`;

export function AdminSidebar({
  adminName = 'Super Admin',
  adminRole = 'System',
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const W = collapsed ? 72 : 260;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside
        className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: W,
          minWidth: W,
          padding: '24px 14px 20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          zIndex: 200,
        }}
      >
        {/* LOGO ADMIN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 4px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #FF3B30 0%, #990000 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 18,
            boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
            flexShrink: 0
          }}>
            K
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', lineHeight: 1.1 }}>
                Kollect
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#FF3B30', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Admin Portal
              </span>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {!collapsed && <p style={{ margin: '0 8px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Principal</p>}
          {ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '10px 12px',
                }}
                title={collapsed ? item.label : undefined}
                onClick={() => mobileOpen && onMobileClose?.()}
              >
                <div className="admin-icon-wrap">
                  <Icon d={ICONS[item.id]} size={16} />
                </div>
                {!collapsed && (
                  <span style={{ marginLeft: 10, whiteSpace: 'nowrap' }}>{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* BOTTOM SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* User Card */}
          <div className="admin-user-card" style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '10px' : '12px' }}>
            <div className="admin-avatar">SA</div>
            {!collapsed && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{adminName}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{adminRole}</div>
              </div>
            )}
          </div>
          
          <button onClick={onToggleCollapse} className="admin-toggle-btn">
            <Icon d={collapsed ? ICONS.expand : ICONS.collapse} size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

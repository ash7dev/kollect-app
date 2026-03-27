'use client';

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarSection =
  | 'overview'
  | 'drops'
  | 'products'
  | 'orders'
  | 'clients'
  | 'analytics'
  | 'settings'
  | 'notifications';

type SidebarProps = {
  brandName?: string;
  userInitials?: string;
  userEmail?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  active?: SidebarSection;
  onNavigate?: (section: SidebarSection) => void;
  notificationCount?: number;
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
      strokeWidth="1.6"
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
  drops: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  products: ['M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  orders: ['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z', 'M9 14l2 2 4-4'],
  clients: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  analytics: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  notifications: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  collapse: 'M15 18l-6-6 6-6',
  expand: 'M9 18l6-6-6-6',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
};

// ─── Nav items ────────────────────────────────────────────────────────────────

const MAIN_ITEMS: { id: SidebarSection; label: string }[] = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'drops', label: 'Drops' },
  { id: 'products', label: 'Produits' },
  { id: 'orders', label: 'Commandes' },
  { id: 'clients', label: 'Clients' },
  { id: 'analytics', label: 'Analytiques' },
];

const BOTTOM_ITEMS: { id: SidebarSection; label: string }[] = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Paramètres' },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .kollect-sidebar * {
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .kollect-sidebar {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(0,0,0,0.07);
    box-shadow:
      1px 0 0 rgba(255,255,255,0.8),
      4px 0 32px rgba(0,0,0,0.05);
  }

  .kollect-nav-item {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    border: none;
    cursor: pointer;
    background: transparent;
    border-radius: 11px;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    outline: none;
    overflow: hidden;
  }

  .kollect-nav-item:hover:not(.active) {
    background: rgba(0,0,0,0.04);
  }

  .kollect-nav-item.active {
    background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
    box-shadow:
      0 4px 16px rgba(255,59,48,0.25),
      0 1px 4px rgba(255,59,48,0.2),
      inset 0 1px 0 rgba(255,255,255,0.18);
    color: #fff;
  }

  .kollect-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.18s, color 0.18s;
  }

  .kollect-icon-wrap.default {
    background: transparent;
    color: rgba(0,0,0,0.38);
  }

  .kollect-nav-item:hover:not(.active) .kollect-icon-wrap.default {
    background: rgba(255,59,48,0.08);
    color: #FF3B30;
  }

  .kollect-icon-wrap.active-icon {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  .kollect-badge {
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    flex-shrink: 0;
    transition: background 0.18s, color 0.18s;
  }

  .kollect-divider {
    height: 1px;
    background: rgba(0,0,0,0.06);
    margin: 8px 0;
  }

  .kollect-section-label {
    margin: 0 6px 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: rgba(0,0,0,0.25);
  }

  .kollect-toggle-btn {
    width: 100%;
    padding: 8px 0;
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.07);
    background: rgba(0,0,0,0.03);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0,0,0,0.32);
    transition: background 0.15s, color 0.15s;
    margin-top: 10px;
  }

  .kollect-toggle-btn:hover {
    background: rgba(255,59,48,0.06);
    color: #FF3B30;
    border-color: rgba(255,59,48,0.15);
  }

  .kollect-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(255,59,48,0.22);
    border: 2px solid rgba(255,255,255,0.9);
  }

  .kollect-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 12px;
    background: rgba(0,0,0,0.03);
    border: 1px solid rgba(0,0,0,0.06);
    transition: background 0.15s, border-color 0.15s;
    cursor: default;
  }
  .kollect-user-card:hover {
    background: rgba(0,0,0,0.045);
    border-color: rgba(0,0,0,0.09);
  }

  .kollect-user-dots {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: rgba(0,0,0,0.28);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  .kollect-user-dots:hover {
    background: rgba(0,0,0,0.06);
    color: rgba(0,0,0,0.55);
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .kollect-label-reveal {
    animation: fadeSlideIn 0.18s ease forwards;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardSidebar({
  brandName,
  userInitials = 'C',
  userEmail,
  collapsed = false,
  onToggleCollapse,
  active = 'overview',
  onNavigate,
  notificationCount = 0,
}: SidebarProps) {
  const W = collapsed ? 68 : 256;

  function NavItem({ id, label, badge }: { id: SidebarSection; label: string; badge?: number }) {
    const isActive = active === id;
    return (
      <button
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate?.(id)}
        className={`kollect-nav-item${isActive ? ' active' : ''}`}
        style={{
          gap: collapsed ? 0 : 10,
          padding: collapsed ? '8px' : '9px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: isActive ? '#fff' : '#111',
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          letterSpacing: '-0.1px',
        }}
        title={collapsed ? label : undefined}
      >
        <span className={`kollect-icon-wrap ${isActive ? 'active-icon' : 'default'}`}>
          <Icon d={ICONS[id]} size={15} />
        </span>

        {!collapsed && (
          <span
            className="kollect-label-reveal"
            style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {label}
          </span>
        )}

        {badge && badge > 0 ? (
          <span
            className="kollect-badge"
            style={{
              background: isActive ? 'rgba(255,255,255,0.28)' : '#FF3B30',
              color: '#fff',
              ...(collapsed ? { position: 'absolute', top: 3, right: 3, minWidth: 16, height: 16, fontSize: 9 } : {}),
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <aside
        className="kollect-sidebar"
        style={{
          width: W,
          minWidth: W,
          padding: '18px 10px 14px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: 24,
            justifyContent: collapsed ? 'center' : 'flex-start',
            minHeight: 44,
            padding: '0 2px',
          }}
        >
          <Logo href="/dashboard" />
          {!collapsed && (
            <span className="kollect-label-reveal" style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#000',
              fontStyle: 'italic',
              fontFamily: "'Snell Roundhand', 'Dancing Script', 'Brush Script MT', cursive",
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              {/* Kollect */}
            </span>
          )}
        </div>

        {/* ── Main nav ── */}
        <nav
          aria-label="Navigation principale"
          style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}
        >
          {!collapsed && <p className="kollect-section-label">Navigation</p>}
          {MAIN_ITEMS.map((item) => (
            <NavItem key={item.id} id={item.id} label={item.label} />
          ))}
        </nav>

        {/* ── Bottom nav ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="kollect-divider" />
          {!collapsed && <p className="kollect-section-label">Général</p>}
          {BOTTOM_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              badge={item.id === 'notifications' ? notificationCount : undefined}
            />
          ))}
        </div>

        {/* ── User profile card ── */}
        <div style={{ marginTop: 10 }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
              <div className="kollect-avatar">{userInitials}</div>
            </div>
          ) : (
            <div className="kollect-label-reveal kollect-user-card">
              <div className="kollect-avatar">{userInitials}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {brandName || 'CEO'}
                </p>
                {userEmail && (
                  <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(0,0,0,0.36)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userEmail}
                  </p>
                )}
              </div>
              <button type="button" className="kollect-user-dots" title="Options">
                <Icon d={ICONS.dots} size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Toggle collapse ── */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
          className="kollect-toggle-btn"
        >
          <Icon d={collapsed ? ICONS.expand : ICONS.collapse} size={14} />
        </button>
      </aside>
    </>
  );
}
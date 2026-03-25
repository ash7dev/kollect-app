'use client';

import { useState } from 'react';

type Action = {
  id: string;
  label: string;
  description: string;
  icon: string[];
  accent: string;
  onClick: () => void;
};

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ActionCard({ action }: { action: Action }) {
  const [hovered, setHovered] = useState(false);
  const paths = action.icon;

  return (
    <button
      type="button"
      onClick={action.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
        padding: '20px 18px',
        borderRadius: 16,
        border: `1px solid ${hovered ? action.accent + '40' : 'rgba(0,0,0,0.06)'}`,
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.9), ${action.accent}0A)`
          : 'rgba(255,255,255,0.7)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 24px ${action.accent}15, 0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)`
          : '0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.5)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '120px',
      }}
    >
      {/* Glow top-left */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -30, left: -30,
          width: 100, height: 100, borderRadius: '50%',
          background: `radial-gradient(circle, ${action.accent}25 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Icon + arrow */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', zIndex: 1, position: 'relative' }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: hovered ? action.accent : '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: hovered ? `0 6px 16px ${action.accent}50` : '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {paths.map((p, i) => <path key={i} d={p} />)}
          </svg>
        </div>

        <span style={{
          color: hovered ? action.accent : 'rgba(0,0,0,0.2)',
          transition: 'color 0.2s, transform 0.2s ease-out',
          transform: hovered ? 'translate(4px, 0)' : 'none',
        }}>
          <ArrowIcon />
        </span>
      </div>

      {/* Text */}
      <div style={{ zIndex: 1, position: 'relative' }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 800,
          color: '#0A0A0A',
          letterSpacing: '-0.2px',
        }}>
          {action.label}
        </p>
        <p style={{
          margin: '4px 0 0',
          fontSize: 11.5,
          color: 'rgba(0,0,0,0.45)',
          lineHeight: 1.5,
          fontWeight: 500,
        }}>
          {action.description}
        </p>
      </div>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onCreateDrop?: () => void;
  onAddProduct?: () => void;
  onViewOrders?: () => void;
  onShareProfile?: () => void;
  onManageBrand?: () => void;
  onCreatePromo?: () => void;
  pendingOrdersCount?: number;
};

export function DashboardQuickActions({
  onCreateDrop,
  onAddProduct,
  onViewOrders,
  onShareProfile,
  onManageBrand,
  onCreatePromo,
  pendingOrdersCount = 0,
}: Props) {
  const actions: Action[] = [
    {
      id: 'drop',
      label: 'Créer un Drop',
      description: 'Lance un drop exclusif avec timer',
      icon: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
      accent: '#FF3B30',
      onClick: () => onCreateDrop?.(),
    },
    {
      id: 'product',
      label: 'Nouveau Produit',
      description: 'Ajoute un produit à ton catalogue',
      icon: ['M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
      accent: '#7C3AED',
      onClick: () => onAddProduct?.(),
    },
    {
      id: 'orders',
      label: `Commandes${pendingOrdersCount > 0 ? ` (${pendingOrdersCount})` : ''}`,
      description: pendingOrdersCount > 0 ? `${pendingOrdersCount} commande(s) en attente` : 'Consulter les commandes',
      icon: ['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z', 'M9 14l2 2 4-4'],
      accent: '#F59E0B',
      onClick: () => onViewOrders?.(),
    },
    {
      id: 'promo',
      label: 'Créer code promo',
      description: 'Générer des réductions pour les clients',
      icon: ['M3 6h18', 'M3 12h18', 'M3 18h18', 'M7 12l2-2 4 4 4-4 2 2'],
      accent: '#8B5CF6',
      onClick: () => onCreatePromo?.(),
    },
    {
      id: 'brand',
      label: 'Ma Boutique',
      description: 'Modifier le profil et la marque',
      icon: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
      accent: '#10B981',
      onClick: () => onManageBrand?.(),
    },
    {
      id: 'share',
      label: 'Partager le Profil',
      description: 'Copier le lien de ta boutique',
      icon: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'],
      accent: '#EC4899',
      onClick: () => onShareProfile?.(),
    },
  ];

  return (
    <article style={{
      borderRadius: 20,
      border: '1px solid rgba(0,0,0,0.07)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: '24px 24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Actions rapides
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
            Gérer la boutique
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </article>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_BASE_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  gap: 18,
  padding: '22px 20px',
  borderRadius: 18,
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
  cursor: 'pointer',
  textAlign: 'left' as const,
  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transform: 'translateY(0) scale(1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
  position: 'relative' as const,
  overflow: 'hidden',
  minHeight: '130px',
  backdropFilter: 'blur(8px)',
};

const CONTAINER_STYLE = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '24px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)',
};

function ActionCard({ action }: { action: Action }) {
  const [hovered, setHovered] = useState(false);
  const paths = action.icon;

  const cardStyle = hovered ? {
    ...CARD_BASE_STYLE,
    border: `1px solid ${action.accent + '50'}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${action.accent}08 100%)`,
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 16px 32px ${action.accent}20, 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)`,
  } : CARD_BASE_STYLE;

  return (
    <button
      type="button"
      onClick={action.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardStyle}
    >
      {/* Animated gradient overlay */}
      {hovered && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(135deg, ${action.accent}10 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Glow effect */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${action.accent}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Icon + arrow */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', zIndex: 1, position: 'relative' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: hovered 
            ? `linear-gradient(135deg, ${action.accent} 0%, ${action.accent}CC 100%)`
            : `linear-gradient(135deg, #0A0A0A 0%, #333 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: hovered 
            ? `0 8px 20px ${action.accent}60, inset 0 1px 0 rgba(255,255,255,0.2)` 
            : '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          transform: hovered ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {paths.map((p, i) => <path key={i} d={p} />)}
          </svg>
        </div>

        <span style={{
          color: hovered ? action.accent : 'rgba(0,0,0,0.25)',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'translateX(6px) scale(1.1)' : 'translateX(0) scale(1)',
        }}>
          <ArrowIcon />
        </span>
      </div>

      {/* Text */}
      <div style={{ zIndex: 1, position: 'relative' }}>
        <p style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 800,
          color: '#0A0A0A',
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
        }}>
          {action.label}
        </p>
        <p style={{
          margin: '6px 0 0',
          fontSize: 12,
          color: 'rgba(0,0,0,0.5)',
          lineHeight: 1.4,
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
  const router = useRouter();
  
  const actions: Action[] = [
    {
      id: 'drop',
      label: 'Créer un Drop',
      description: 'Lance un drop exclusif avec timer',
      icon: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
      accent: '#FF3B30',
      onClick: () => router.push('/dashboard/drops/new'),
    },
    {
      id: 'product',
      label: 'Nouveau Produit',
      description: 'Ajoute un produit à ton catalogue',
      icon: ['M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
      accent: '#7C3AED',
      onClick: () => router.push('/dashboard/produits/new'),
    },
    {
      id: 'orders',
      label: `Commandes${pendingOrdersCount > 0 ? ` (${pendingOrdersCount})` : ''}`,
      description: pendingOrdersCount > 0 ? `${pendingOrdersCount} commande(s) en attente` : 'Consulter les commandes',
      icon: ['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z', 'M9 14l2 2 4-4'],
      accent: '#F59E0B',
      onClick: () => router.push('/dashboard/commandes'),
    },
    {
      id: 'promo',
      label: 'Créer code promo',
      description: 'Générer des réductions pour les clients',
      icon: ['M15 6v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3z', 'M10 9h4', 'M10 12h2', 'M10 15h3'],
      accent: '#8B5CF6',
      onClick: () => router.push('/dashboard/promotions/create'),
    },
    {
      id: 'brand',
      label: 'Paramètres',
      description: 'Gérer les paramètres de la boutique',
      icon: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10', 'M12 6h.01'],
      accent: '#10B981',
      onClick: () => router.push('/dashboard/settings'),
    },
    {
      id: 'share',
      label: 'Partager le Profil',
      description: 'Aperçu ou lien',
      icon: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'],
      accent: '#EC4899',
      onClick: onShareProfile || (() => router.push('/profile')),
    },
  ];

  return (
    <article style={CONTAINER_STYLE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Actions rapides
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Gérer la boutique
          </p>
        </div>
      </div>

      <style>{`
        .qa-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      `}</style>
      <div className="qa-grid">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </article>
  );
}

'use client';

import { DropIcon, DROP_COLORS } from '@/components/dashboard/drops/drop-shared';

const PROMO_ICONS = {
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  power: 'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
};

export function PromoBadge({ type, inactive }: { type: 'auto' | 'code'; inactive?: boolean }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    auto: { bg: 'hsla(0, 100%, 96%, 1)', color: 'hsla(0, 72%, 51%, 1)', label: 'Automatique' },
    code: { bg: 'hsla(215, 16%, 95%, 1)', color: 'hsla(215, 16%, 35%, 1)', label: 'Code Promo' },
  };
  const current = styles[type];
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
      padding: '4px 10px', borderRadius: 8,
      backgroundColor: inactive ? '#F3F4F6' : current.bg,
      color: inactive ? '#9CA3AF' : current.color,
      border: `1.5px solid ${inactive ? '#E5E7EB' : 'transparent'}`,
      textDecoration: inactive ? 'line-through' : 'none',
    }}>
      {current.label}
    </span>
  );
}

export function SkeletonCard() {
  return (
    <div className="promo-card" style={{ pointerEvents: 'none' }}>
      <div className="promo-card-content" style={{ marginBottom: 24 }}>
        <div style={{ width: 80, height: 24, borderRadius: 8, background: '#F3F4F6', marginBottom: 16 }} />
        <div style={{ width: 120, height: 42, borderRadius: 8, background: '#E5E7EB', marginBottom: 12 }} />
        <div style={{ width: '70%', height: 16, borderRadius: 6, background: '#F3F4F6', marginBottom: 20 }} />
      </div>
      <div className="promo-card-footer">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F3F4F6' }} />
          <div style={{ width: 100, height: 14, borderRadius: 4, background: '#F3F4F6' }} />
        </div>
        <div style={{ width: 100, height: 14, borderRadius: 4, background: '#F3F4F6' }} />
      </div>
      <style>{`
        @keyframes promo-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .promo-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: promo-shimmer 1.5s infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

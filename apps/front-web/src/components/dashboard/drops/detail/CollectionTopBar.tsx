'use client';

import type { CeoCollectionDetail, CollectionStatus } from '@/types/drops';

// ─── Icons ───────────────────────────────────────────────────────────────────

function Ic({ d, size = 14, stroke = 'currentColor', sw = 1.8 }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ICONS = {
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  rocket:    'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  edit:      ['M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'],
  trash:     ['M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<CollectionStatus, { label: string; dot: string; color: string; bg: string; border: string; pulse: boolean }> = {
  TEASER:     { label: 'Teaser',    dot: '#F59E0B', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A',    pulse: false },
  DISPONIBLE: { label: 'Live',      dot: '#10B981', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7',    pulse: true  },
  EPUISEE:    { label: 'Épuisée',   dot: '#EF4444', color: '#991B1B', bg: '#FEE2E2', border: '#FECACA',    pulse: false },
  TERMINE:    { label: 'Terminée',  dot: '#9CA3AF', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB',    pulse: false },
  BROUILLON:  { label: 'Brouillon', dot: '#9CA3AF', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB',    pulse: false },
};

function StatusBadge({ status }: { status: CollectionStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.BROUILLON;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 99,
      fontFamily: F,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase',
      color: m.color, background: m.bg, border: `1px solid ${m.border}`,
      flexShrink: 0,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0,
        animation: m.pulse ? 'ctb-pulse 1.8s ease-in-out infinite' : 'none',
      }} />
      {m.label}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  collection: CeoCollectionDetail | null;
  onBack: () => void;
  onLaunch: () => void;
  onEdit: () => void;
  onDelete: () => void;
  launchPending: boolean;
  onOpenSidebar?: () => void;
};

const F = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

// ─── Component ────────────────────────────────────────────────────────────────

export function CollectionTopBar({
  collection, onBack, onLaunch, onEdit, onDelete, launchPending, onOpenSidebar,
}: Props) {
  const hasCollection = !!collection;
  const isTeaser = collection?.status === 'TEASER';

  return (
    <>
      <style>{`
        @keyframes ctb-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.8); }
        }
        @keyframes ctb-shimmer {
          0%   { background-position:-600px 0; }
          100% { background-position:600px 0; }
        }
        @media (max-width: 768px) {
          .ctb-label     { display: none !important; }
          .ctb-divider   { display: none !important; }
          .ctb-edit      { padding: 0 10px !important; }
        }
        .ctb-back:hover   { 
          background:rgba(255,255,255,0.95) !important; 
          color:#0A0A0A !important; 
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06) !important;
        }
        .ctb-edit:hover   { 
          background:rgba(255,255,255,0.95) !important; 
          color:#0A0A0A !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06) !important;
        }
        .ctb-delete:hover { 
          background:rgba(239,68,68,0.08) !important; 
          border-color:rgba(239,68,68,0.2) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(239,68,68,0.15), 0 2px 4px rgba(0,0,0,0.06) !important;
        }
        .ctb-launch:not(:disabled):hover {
          transform:translateY(-2px) !important;
          box-shadow:0 8px 24px rgba(255,59,48,0.4), 0 4px 8px rgba(255,59,48,0.3) !important;
        }
        .ctb-launch:active { transform:scale(0.98) !important; }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 32,
        fontFamily: F,
      }}>
        {/* ── Back ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="ctb-back"
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 40, padding: '0 16px',
              border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12,
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: '#0A0A0A',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: F, flexShrink: 0,
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
            }}
          >
            <Ic d={ICONS.arrowLeft} size={15} sw={2.5} />
            <span className="ctb-label">Retour aux drops</span>
          </button>
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Status badge */}
          {hasCollection && <StatusBadge status={collection.status} />}

          {/* Divider */}
          {hasCollection && (
            <div className="ctb-divider" style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)', margin: '0 6px' }} />
          )}

          {/* Edit */}
          {hasCollection && (
            <button
              type="button"
              className="ctb-edit"
              onClick={onEdit}
              title="Modifier"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 40, padding: '0 16px',
                border: 'none', borderRadius: 12,
                background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
                color: '#fff',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: F, flexShrink: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.06)';
              }}
            >
              <Ic d={ICONS.edit} size={16} sw={2} />
              <span className="ctb-label">Modifier</span>
            </button>
          )}

          {/* Delete */}
          {hasCollection && (
            <button
              type="button"
              className="ctb-delete"
              onClick={onDelete}
              title="Supprimer"
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.07)',
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.15), 0 2px 4px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ filter: 'drop-shadow(0 1px 2px rgba(220,38,38,0.3))' }}>
                <Ic d={ICONS.trash} size={16} stroke="#DC2626" sw={2} />
              </div>
            </button>
          )}

          {/* Launch divider */}
          {isTeaser && (
            <div className="ctb-divider" style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)', margin: '0 6px' }} />
          )}

          {/* Launch — TEASER only */}
          {isTeaser && (
            <button
              type="button"
              className="ctb-launch"
              disabled={launchPending}
              onClick={onLaunch}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 40, padding: '0 20px',
                border: 'none', borderRadius: 12,
                background: launchPending 
                  ? 'rgba(0,0,0,0.05)' 
                  : 'linear-gradient(135deg, #FF3B30 0%, #E0321F 100%)',
                color: launchPending ? '#9CA3AF' : '#fff',
                fontSize: 13, fontWeight: 800,
                cursor: launchPending ? 'not-allowed' : 'pointer',
                fontFamily: F, flexShrink: 0,
                boxShadow: launchPending 
                  ? '0 2px 8px rgba(0,0,0,0.06)' 
                  : '0 4px 16px rgba(255,59,48,0.3), 0 2px 4px rgba(255,59,48,0.2)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                if (!launchPending) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,59,48,0.4), 0 4px 8px rgba(255,59,48,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!launchPending) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,59,48,0.3), 0 2px 4px rgba(255,59,48,0.2)';
                }
              }}
            >
              <Ic d={ICONS.rocket} size={15} stroke={launchPending ? '#9CA3AF' : '#fff'} sw={2} />
              {launchPending ? 'Lancement…' : 'Lancer le drop'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
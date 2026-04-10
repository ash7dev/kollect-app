'use client';

import { useState } from 'react';

export type ActivityEvent = {
  type:       'order' | 'product';
  id:         string;
  createdAt:  string;
  // If order
  amount?:    number;
  client?:    string;
  // If product
  name?:      string;
  views?:     number;
};

type Props = {
  events:    ActivityEvent[];
  isLoading: boolean;
  onViewAll?: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCfa(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0 CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' CFA';
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = new Date().getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (isNaN(d.getTime())) return 'Date invalide';
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardActivityFeed({ events, isLoading, onViewAll }: Props) {
  const [filter, setFilter] = useState<'all' | 'order' | 'product'>('all');

  const filtered = events.filter((e) => filter === 'all' || e.type === filter);
  const visible  = filtered.slice(0, 10); // Show max 10

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 120, height: 14, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'dafPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 80, height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'dafPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          {[1,2,3,4].map((i) => (
             <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', flexShrink: 0, animation: 'dafPulse 1.3s ease-in-out infinite' }} />
                <div style={{ flex: 1, display: 'grid', gap: 8, marginTop: 4 }}>
                   <div style={{ width: '50%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'dafPulse 1.3s ease-in-out infinite' }} />
                   <div style={{ width: '30%', height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
                </div>
             </div>
          ))}
        </div>
      </article>
    );
  }

  // ── Content ───────────────────────────────────────────────────────────────
  return (
    <article style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div className="daf-header">
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Fil d&apos;activité
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Actions et événements récents
          </p>
        </div>

        {/* Segmented Filter (Linear style) */}
        <div className="daf-filter-group">
          {(['all', 'order', 'product'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`daf-filter-btn${filter === f ? ' active' : ''}`}
            >
              {f === 'all' ? 'Tout' : f === 'order' ? 'Commandes' : 'Produits'}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div style={{ position: 'relative', marginTop: 10 }}>
        {/* Timeline Line (Gradient) */}
        {visible.length > 0 && (
          <div style={{
             position: 'absolute',
             left: 19, top: 20, bottom: 20, width: 2,
             background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.07) 10%, rgba(0,0,0,0.07) 90%, transparent 100%)',
             zIndex: 0,
          }} />
        )}

        {visible.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
              Aucune activité trouvée
            </p>
          </div>
        ) : (
          visible.map((ev, i) => {
            const isOrder = ev.type === 'order';
            const iconBg  = isOrder ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.1)';
            const iconCol = isOrder ? '#10B981'              : '#7C3AED';
            const Icon    = isOrder
              ? <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z M9 14l2 2 4-4" />
              : <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" />;

            return (
              <div key={`${ev.id}-${i}`} className="daf-item">
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)', // Cut out the timeline line
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1, position: 'relative',
                  marginTop: -2, padding: 3,
                }}>
                   <div style={{
                     width: '100%', height: '100%', borderRadius: '50%',
                     background: iconBg, color: iconCol,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: `0 0 0 1px ${iconCol}30`,
                   }}>
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                       {Icon}
                     </svg>
                   </div>
                </div>

                {/* Content */}
                <div className="daf-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#111', lineHeight: 1.4, fontWeight: 500, letterSpacing: '-0.1px' }}>
                      {isOrder ? (
                        <>
                          <span style={{ fontWeight: 800 }}>Nouvelle commande</span> de <span style={{ fontWeight: 800 }}>{ev.client || 'Client API'}</span>
                        </>
                      ) : (
                        <>
                          Le produit <span style={{ fontWeight: 800 }}>{ev.name || `[PROD-${ev.id.slice(0,4)}]`}</span> intéresse
                        </>
                      )}
                    </p>
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', fontWeight: 600, flexShrink: 0 }}>
                      {timeAgo(ev.createdAt)}
                    </span>
                  </div>

                  <div style={{ marginTop: 4 }}>
                    {isOrder && ev.amount ? (
                      <span className="daf-tag" style={{ color: '#059669', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        +{fmtCfa(ev.amount)}
                      </span>
                    ) : null}

                    {!isOrder && ev.views ? (
                      <span className="daf-tag" style={{ color: '#5B21B6', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                         {ev.views} vues ce mois
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filtered.length > 10 && (
        <button type="button" className="daf-footer-btn" onClick={onViewAll}>
          Voir l&apos;historique complet
        </button>
      )}
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '24px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
};

const STYLES = `
  .daf-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .daf-filter-group {
    display: flex;
    background: rgba(0,0,0,0.04);
    padding: 3px;
    border-radius: 9px;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .daf-filter-btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: rgba(0,0,0,0.45);
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    letter-spacing: 0.2px;
  }
  .daf-filter-btn.active {
    background: #fff;
    color: #111;
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
  }

  .daf-item {
    display: flex;
    gap: 16px;
    padding: 12px 10px;
    margin: 0 -10px;
    border-radius: 14px;
    transition: background 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
  }
  .daf-item:hover {
    background: rgba(0,0,0,0.02);
  }

  .daf-content {
    flex: 1;
    min-width: 0;
    padding-top: 6px;
    padding-bottom: 8px; /* space between items */
  }

  .daf-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .daf-footer-btn {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.06);
    background: rgba(0,0,0,0.02);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12.5px;
    font-weight: 700;
    color: #111;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .daf-footer-btn:hover {
    background: rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.1);
  }
`;

const ANIM = `@keyframes dafPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

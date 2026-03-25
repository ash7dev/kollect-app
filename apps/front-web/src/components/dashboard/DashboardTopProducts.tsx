'use client';

import Image from 'next/image';

type Product = {
  id:          string;
  name:        string;
  price:       number;
  stock:       number;
  viewCount?:  number;
  images?:     string[];
};

type Props = {
  products:  Product[];
  isLoading: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCfa(v: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' CFA';
}

function fmtNum(v: number) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
  return String(v);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardTopProducts({ products, isLoading }: Props) {
  // Sort heavily by views to determine "Top"
  const sorted = [...products].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  const topList = sorted.slice(0, 5); // Only show top 5

  const maxViews = Math.max(...topList.map((p) => p.viewCount ?? 0), 1);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 140, height: 13, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'dtpPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 100, height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'dtpPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
               <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,0,0,0.06)', animation: 'dtpPulse 1.3s ease-in-out infinite' }} />
               <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                  <div style={{ width: '60%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'dtpPulse 1.3s ease-in-out infinite' }} />
                  <div style={{ width: '40%', height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
               </div>
               <div style={{ width: 80, height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.06)' }} />
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Top Produits
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
            Les plus consultés
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', boxShadow: '0 0 0 2px rgba(255,59,48,0.2)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{topList.length} produits</span>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {topList.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
             <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             </div>
             <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>Aucun produit disponible</p>
          </div>
        ) : (
          topList.map((p, i) => {
            const views = p.viewCount ?? 0;
            const pct = Math.max((views / maxViews) * 100, 2); // min 2% for visual
            const img = p.images?.[0];
            const isFirst = i === 0;

            return (
              <div key={p.id} className="dtp-row">
                {/* Accent border left */}
                <div className="dtp-accent-bar" style={{ background: isFirst ? '#FF3B30' : '#111' }} />

                {/* Rank Badge */}
                <span className="dtp-rank" style={
                  isFirst
                    ? { background: '#FF3B30', color: '#fff', boxShadow: '0 2px 8px rgba(255,59,48,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', border: 'none' }
                    : i === 1
                      ? { background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }
                      : i === 2
                        ? { background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', color: '#9A3412', border: '1px solid rgba(234,88,12,0.15)' }
                        : { background: 'transparent', color: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,0,0,0.1)' }
                }>
                  #{i + 1}
                </span>

                {/* Image */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}>
                  {img ? (
                    <Image src={img} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.2)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
                    {p.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.45)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    {fmtCfa(p.price)}
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }} />
                    <span style={{ color: p.stock <= 5 ? '#FF3B30' : 'inherit' }}>
                      {p.stock} stock
                    </span>
                  </p>
                </div>

                {/* View Bar */}
                <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#111', letterSpacing: '-0.2px' }}>
                    {fmtNum(views)} <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.4)' }}>vues</span>
                  </span>
                  <div style={{ width: '100%', height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div className="dtp-bar-fill" style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: isFirst ? 'linear-gradient(90deg, #FF6B35 0%, #FF3B30 100%)' : '#111',
                      borderRadius: 99,
                    }} />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {topList.length > 0 && (
        <button type="button" className="dtp-footer-btn">
          Voir tous les produits
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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
  .dtp-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    overflow: hidden;
  }
  .dtp-row:hover {
    background: rgba(0,0,0,0.025);
    border-color: rgba(0,0,0,0.05);
    transform: translateX(3px);
  }

  .dtp-accent-bar {
    position: absolute;
    left: 0; top: 12px; bottom: 12px;
    width: 3px;
    border-radius: 0 4px 4px 0;
    opacity: 0;
    transform: scaleY(0.5);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dtp-row:hover .dtp-accent-bar {
    opacity: 1;
    transform: scaleY(1);
  }

  .dtp-rank {
    width: 24px; height: 24px;
    border-radius: 8px;
    display: flex; alignItems: center; justifyContent: center;
    font-size: 11px; fontWeight: 800;
    flex-shrink: 0;
  }

  .dtp-bar-fill {
    transform-origin: left;
    animation: dtpGrow 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes dtpGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .dtp-footer-btn {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.06);
    background: rgba(0,0,0,0.02);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #111;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .dtp-footer-btn:hover {
    background: rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.1);
  }
  .dtp-footer-btn svg {
    transition: transform 0.2s;
  }
  .dtp-footer-btn:hover svg {
    transform: translateX(3px);
  }
`;

const ANIM = `@keyframes dtpPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

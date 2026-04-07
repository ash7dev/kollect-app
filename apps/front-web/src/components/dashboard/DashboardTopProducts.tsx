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

function fmtCfa(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0 CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' CFA';
}

function fmtNum(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
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
    <article className="dtp-card" style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div className="dtp-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Top Produits
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Les plus consultés
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.04) 100%)', 
          border: '1px solid rgba(255,59,48,0.15)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
            <path d="M12 3v12"/>
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FF3B30' }}>{topList.length} tops</span>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {topList.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
             <div style={{ width: 56, height: 56, borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
             </div>
             <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>Aucun produit disponible</p>
             <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.3)' }}>Vos produits apparaîtront ici</p>
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
                <div className="dtp-accent-bar" style={{ background: isFirst ? '#FFD700' : '#111' }} />

                {/* Rank Badge with Icons */}
                <div className="dtp-rank" style={{
                  width: 32, height: 32,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: isFirst 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
                    : i === 1 
                      ? 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)'
                      : i === 2
                        ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.08) 100%)',
                  border: isFirst ? '2px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: isFirst ? '0 4px 12px rgba(255,215,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {isFirst ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : i === 1 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                      <path d="M12 2l2.4 4.9h5.4l-4.4 3.4 1.7 5.4L12 13l-5.1 4.7 1.7-5.4-4.4-3.4h5.4L12 2z"/>
                    </svg>
                  ) : i === 2 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF" stroke="none">
                      <path d="M12 2l2.1 4.3h4.8l-3.9 3 1.5 4.7L12 11l-4.5 4 1.5-4.7-3.9-3h4.8L12 2z"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  )}
                </div>

                {/* Image */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)', 
                  border: '1px solid rgba(0,0,0,0.08)',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}>
                  {img ? (
                    <Image src={img} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.25)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
                    {p.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtCfa(p.price)}
                    </span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: p.stock <= 5 ? '#FF3B30' : 'rgba(0,0,0,0.6)' }}>
                      {p.stock} en stock
                    </span>
                  </div>
                </div>

                {/* View Stats */}
                <div className="dtp-view-stats" style={{ width: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111', letterSpacing: '-0.2px' }}>
                      {fmtNum(views)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div className="dtp-bar-fill" style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: isFirst 
                        ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)' 
                        : i === 1 
                          ? 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 100%)'
                          : i === 2
                            ? 'linear-gradient(90deg, #CD7F32 0%, #8B4513 100%)'
                            : 'linear-gradient(90deg, #111 0%, #333 100%)',
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
        <button 
          type="button" 
          className="dtp-footer-btn"
          onClick={() => window.location.href = '/dashboard/produits'}
        >
          Voir tous les produits
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
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
    gap: 16px;
    padding: 16px 18px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  .dtp-row:hover {
    background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%);
    border-color: rgba(0,0,0,0.1);
    transform: translateX(4px) translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .dtp-accent-bar {
    position: absolute;
    left: 0; top: 16px; bottom: 16px;
    width: 4px;
    border-radius: 0 8px 8px 0;
    opacity: 0;
    transform: scaleY(0.5);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dtp-row:hover .dtp-accent-bar {
    opacity: 1;
    transform: scaleY(1);
  }

  .dtp-rank {
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dtp-rank:hover {
    transform: scale(1.1) rotate(5deg);
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
    margin-top: 20px;
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.08);
    background: linear-gradient(135deg, rgba(255,59,48,0.05) 0%, rgba(255,59,48,0.02) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #FF3B30;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-family: inherit;
  }
  .dtp-footer-btn:hover {
    background: linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%);
    border-color: rgba(255,59,48,0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255,59,48,0.15);
  }
  .dtp-footer-btn svg {
    transition: transform 0.2s;
  }
  .dtp-footer-btn:hover svg {
    transform: translateX(4px);
  }

  @media (max-width: 540px) {
    .dtp-card { padding: 14px !important; }
    .dtp-row  { padding: 10px 10px; gap: 8px; }
    .dtp-view-stats { display: none !important; }
    .dtp-header { flex-wrap: wrap; gap: 8px; }
  }
`;

const ANIM = `@keyframes dtpPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

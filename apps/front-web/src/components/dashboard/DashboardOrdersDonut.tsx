'use client';

type Orders = {
  enAttente:  number;
  confirmees: number;
  annulees:   number;
};

const SEGMENTS = [
  { key: 'confirmees', label: 'Confirmées', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.15)' },
  { key: 'enAttente',  label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.15)' },
  { key: 'annulees',   label: 'Annulées',   color: '#FF3B30', bg: 'rgba(255,59,48,0.1)',   border: 'rgba(255,59,48,0.15)' },
] as const;

export function DashboardOrdersDonut({ orders }: { orders: Orders | null }) {
  const pending   = Number(orders?.enAttente)  || 0;
  const confirmed = Number(orders?.confirmees) || 0;
  const cancelled = Number(orders?.annulees)   || 0;
  const total     = Math.max(pending + confirmed + cancelled, 1);
  const realTotal = pending + confirmed + cancelled;

  const values: Record<string, number> = {
    enAttente:  pending,
    confirmees: confirmed,
    annulees:   cancelled,
  };

  // Conic gradient stops
  let acc = 0;
  const stops = SEGMENTS.map(({ key, color }) => {
    const pct  = (values[key] / total) * 100;
    const stop = `${color} ${acc}% ${acc + pct}%`;
    acc += pct;
    return stop;
  }).join(', ');

  const maxKey = SEGMENTS.reduce((best, s) =>
    values[s.key] > values[best.key] ? s : best, SEGMENTS[0]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (!orders) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 130, height: 11, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'doPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 90,  height: 9,  borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'doPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        {/* Donut skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'rgba(0,0,0,0.07)', animation: 'doPulse 1.3s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 9, borderRadius: 6, background: 'rgba(0,0,0,0.07)', animation: 'doPulse 1.3s ease-in-out infinite' }} />
              <div style={{ width: 30, height: 9, borderRadius: 6, background: 'rgba(0,0,0,0.09)' }} />
            </div>
          ))}
        </div>
      </article>
    );
  }

  // ── Content ───────────────────────────────────────────────────────────────
  return (
    <article style={cardStyle}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Répartition des commandes
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Statistiques actuelles
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.04) 100%)', 
          border: '1px solid rgba(255,59,48,0.15)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: maxKey.color, boxShadow: `0 0 6px ${maxKey.color}70` }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FF3B30' }}>{maxKey.label}</span>
        </div>
      </div>

      {/* Donut — centered, prominent */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: `conic-gradient(${stops})`,
            filter: 'blur(8px)',
            opacity: 0.15,
          }} />
          {/* Main donut */}
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: `conic-gradient(${stops})`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Animated inner ring */}
            <div style={{
              position: 'absolute', inset: 24, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
              animation: 'donutRotate 20s linear infinite',
            }} />
          </div>
          {/* Hole */}
          <div style={{
            position: 'absolute',
            inset: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F9F9FB 100%)',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(255,255,255,0.9)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px', lineHeight: 1 }}>
              {realTotal}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>
              commandes
            </span>
          </div>
        </div>
      </div>

      {/* Stats list — enhanced cards */}
      <div style={{ display: 'grid', gap: 10 }}>
        {SEGMENTS.map(({ key, label, color, bg, border }) => {
          const count = values[key];
          const pct   = Math.round((count / total) * 100);
          const isMax = key === maxKey.key;
          return (
            <div key={key} style={{
              padding: '14px 16px',
              borderRadius: 16,
              background: isMax 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
              border: isMax 
                ? `2px solid ${color}30` 
                : `1px solid rgba(0,0,0,0.06)`,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'default',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`, 
                  flexShrink: 0,
                  boxShadow: `0 2px 8px ${color}40`,
                  position: 'relative',
                }}>
                  {isMax && (
                    <div style={{
                      position: 'absolute', inset: -2, borderRadius: '50%',
                      border: `2px solid ${color}30`,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }} />
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '-0.1px' }}>
                  {label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
                    {count}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 8,
                    background: isMax ? color : `${color}20`,
                    color: isMax ? '#fff' : color,
                    minWidth: 35, textAlign: 'center',
                    boxShadow: isMax ? `0 2px 8px ${color}40` : 'none',
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>
              {/* Enhanced progress bar */}
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: isMax 
                    ? `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`
                    : color,
                  width: `${pct}%`,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: isMax ? `0 0 12px ${color}60` : 'none',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
};

const ANIM = `
  @keyframes doPulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes donutRotate{
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse{
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0; }
  }
`;

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
  const pending   = orders?.enAttente  ?? 0;
  const confirmed = orders?.confirmees ?? 0;
  const cancelled = orders?.annulees   ?? 0;
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Statut commandes
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.38)' }}>
            Répartition en temps réel
          </p>
        </div>
        {/* Most common status badge */}
        <span style={{
          fontSize: 10.5, fontWeight: 700,
          padding: '4px 10px', borderRadius: 99,
          background: maxKey.bg,
          color: maxKey.color,
          border: `1px solid ${maxKey.border}`,
          letterSpacing: '0.2px',
        }}>
          {maxKey.label}
        </span>
      </div>

      {/* Donut — centered, prominent */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: `conic-gradient(${stops})`,
            filter: 'blur(6px)',
            opacity: 0.2,
          }} />
          {/* Main donut */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: `conic-gradient(${stops})`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
          }} />
          {/* Hole */}
          <div style={{
            position: 'absolute',
            inset: 22,
            borderRadius: '50%',
            background: '#F9F9FB',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.8px', lineHeight: 1 }}>
              {realTotal}
            </span>
            <span style={{ fontSize: 8.5, color: 'rgba(0,0,0,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 2 }}>
              total
            </span>
          </div>
        </div>
      </div>

      {/* Stats list — filled, no empty space */}
      <div style={{ display: 'grid', gap: 8 }}>
        {SEGMENTS.map(({ key, label, color, bg, border }) => {
          const count = values[key];
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={key} style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: bg,
              border: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color, flexShrink: 0,
                  boxShadow: `0 0 6px ${color}70`,
                }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>
                  {label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
                  {count}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 99,
                  background: `${color}20`, color,
                  minWidth: 30, textAlign: 'center',
                }}>
                  {pct}%
                </span>
              </div>
              {/* Mini progress bar */}
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: color,
                  width: `${pct}%`,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
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
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  padding: '20px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.06)',
};

const ANIM = `@keyframes doPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

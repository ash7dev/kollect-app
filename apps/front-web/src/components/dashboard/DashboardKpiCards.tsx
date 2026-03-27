'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KpiVariant = 'hero' | 'standard' | 'accent';

export type KpiCard = {
  label:   string;
  value:   string;
  hint?:   string;
  trend?:  number;       // ex: 12.5 ou -3.2
  variant: KpiVariant;
  icon:    JSX.Element;  // passer directement le SVG
};

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  .kpi * { box-sizing: border-box; margin: 0; padding: 0; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    padding: 2px 0;
  }

  @media (max-width: 700px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .card-hero { grid-column: span 2; }
  }

  .kpi-card {
    border-radius: 18px;
    padding: 20px 18px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 140px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s cubic-bezier(0.4,0,0.2,1);
    cursor: default;
  }

  .kpi-card:hover {
    transform: translateY(-3px);
  }

  /* Hero card */
  .card-hero {
    background: linear-gradient(145deg, #111 0%, #0d0d0d 60%, #131313 100%);
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.04) inset,
      0 -1px 0 rgba(0,0,0,0.3) inset,
      0 8px 24px rgba(0,0,0,0.2),
      0 2px 8px rgba(0,0,0,0.15);
  }
  .card-hero::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,59,48,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .card-hero::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 18px 0 0 18px;
    background: linear-gradient(180deg, #FF3B30 0%, #E0321F 100%);
  }
  .card-hero:hover {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.06) inset,
      0 -1px 0 rgba(0,0,0,0.3) inset,
      0 16px 40px rgba(0,0,0,0.28),
      0 4px 12px rgba(255,59,48,0.12);
  }

  /* Standard cards */
  .card-standard {
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.9) inset,
      0 4px 16px rgba(0,0,0,0.05),
      0 1px 4px rgba(0,0,0,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .card-standard:hover {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.9) inset,
      0 12px 32px rgba(0,0,0,0.09),
      0 2px 8px rgba(0,0,0,0.06);
    border-color: rgba(0,0,0,0.1);
  }

  /* Accent card */
  .card-accent {
    background: linear-gradient(145deg, #FF3B30 0%, #E0321F 60%, #cc2d23 100%);
    border: none;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.18) inset,
      0 8px 24px rgba(255,59,48,0.3),
      0 2px 8px rgba(255,59,48,0.2);
  }
  .card-accent::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    border-radius: 18px;
    pointer-events: none;
  }
  .card-accent:hover {
    box-shadow:
      0 1px 0 rgba(255,255,255,0.18) inset,
      0 16px 40px rgba(255,59,48,0.4),
      0 4px 12px rgba(255,59,48,0.25);
  }

  .kpi-row { display: flex; align-items: center; justify-content: space-between; }

  /* Icons */
  .icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .icon-hero     { background: rgba(255,59,48,0.18); border: 1px solid rgba(255,59,48,0.12); }
  .icon-standard { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.06); }
  .icon-accent   { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.15); }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 3px 8px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.1px;
    opacity: 0.6;
  }
  .badge-hero-up   { background: rgba(16,185,129,0.2);  color: #34D399; border: 1px solid rgba(16,185,129,0.15); }
  .badge-hero-down { background: rgba(255,59,48,0.25);  color: #FF6B6B; border: 1px solid rgba(255,59,48,0.2); }
  .badge-std-up    { background: rgba(16,185,129,0.1);  color: #059669; border: 1px solid rgba(16,185,129,0.12); }
  .badge-std-down  { background: rgba(239,68,68,0.1);   color: #DC2626; border: 1px solid rgba(239,68,68,0.12); }
  .badge-accent    { background: rgba(255,255,255,0.22); color: #fff;    border: 1px solid rgba(255,255,255,0.18); }

  /* Labels */
  .kpi-label { font-size: 11px; font-weight: 500; letter-spacing: 0.2px; margin-bottom: 5px; }
  .kpi-label-hero     { color: rgba(255,255,255,0.4); }
  .kpi-label-standard { color: rgba(0,0,0,0.42); }
  .kpi-label-accent   { color: rgba(255,255,255,0.7); }

  /* Values */
  .kpi-value { font-size: 28px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; }
  .kpi-value-hero     { color: #fff; }
  .kpi-value-standard { color: #0A0A0A; }
  .kpi-value-accent   { color: #fff; }

  /* Separators */
  .kpi-sep { height: 1px; }
  .kpi-sep-hero     { background: rgba(255,255,255,0.07); }
  .kpi-sep-standard { background: rgba(0,0,0,0.06); }
  .kpi-sep-accent   { background: rgba(255,255,255,0.2); }

  /* Hints */
  .kpi-hint { font-size: 11px; }
  .kpi-hint-hero     { color: rgba(255,255,255,0.28); }
  .kpi-hint-standard { color: rgba(0,0,0,0.38); }
  .kpi-hint-accent   { color: rgba(255,255,255,0.6); }

  /* Dots */
  .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .dot-red   { background: #FF3B30; box-shadow: 0 0 0 3px rgba(255,59,48,0.15); }
  .dot-muted { background: rgba(0,0,0,0.15); }
  .dot-white { background: rgba(255,255,255,0.7); box-shadow: 0 0 0 3px rgba(255,255,255,0.12); }

  /* Skeleton */
  @keyframes kpiShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .kpi-shimmer {
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.09) 50%, rgba(0,0,0,0.05) 75%);
    background-size: 200% 100%;
    animation: kpiShimmer 1.6s ease-in-out infinite;
  }
  .kpi-skeleton {
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 18px;
    padding: 20px 18px 18px;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    backdrop-filter: blur(20px);
  }
`;

// ─── Icônes prêtes à l'emploi ─────────────────────────────────────────────────

export const KpiIcons = {
  revenue: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  orders: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  products: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <circle cx="7" cy="9" r="1" fill={color} />
      <circle cx="7" cy="15" r="1" fill={color} />
      <circle cx="17" cy="9" r="1" fill={color} />
      <circle cx="17" cy="15" r="1" fill={color} />
    </svg>
  ),
  followers: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M20 8h-4" />
      <path d="M18 6v4" />
    </svg>
  ),
  conversion: (color: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

// ─── Arrow ────────────────────────────────────────────────────────────────────

function Arrow({ up }: { up: boolean }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path
        d={up ? 'M5 8V2M2 5l3-3 3 3' : 'M5 2v6M2 5l3 3 3-3'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ label, value, hint, trend, variant, icon }: KpiCard) {
  const v  = variant;
  const up = (trend ?? 0) >= 0;

  const badgeCls =
    v === 'hero'     ? (up ? 'badge badge-hero-up'  : 'badge badge-hero-down') :
    v === 'accent'   ? 'badge badge-accent'                                    :
                       (up ? 'badge badge-std-up'   : 'badge badge-std-down');

  return (
    <article className={`kpi-card card-${v}`}>

      {/* ── Top row ── */}
      <div className="kpi-row">
        <div className={`icon icon-${v}`}>{icon}</div>
        {trend !== undefined && (
          <span className={badgeCls}>
            <Arrow up={up} />
            {up ? '+' : ''}{Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div>
        <div className={`kpi-label kpi-label-${v}`}>{label}</div>
        <div className={`kpi-value kpi-value-${v}`}>{value}</div>
      </div>

      {/* ── Separator ── */}
      <div className={`kpi-sep kpi-sep-${v}`} />

      {/* ── Footer ── */}
      <div className="kpi-row">
        {hint && <span className={`kpi-hint kpi-hint-${v}`}>{hint}</span>}

        {v === 'hero' && <span className="dot dot-red" />}
        {v === 'standard' && <span className="dot dot-muted" />}
        {v === 'accent' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot dot-white" />
            <span className="kpi-hint kpi-hint-accent">94%</span>
          </span>
        )}
      </div>

    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <article className="kpi-skeleton">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="kpi-shimmer" style={{ width: 34, height: 34, borderRadius: 10 }} />
        <div className="kpi-shimmer" style={{ width: 52, height: 20, borderRadius: 20 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="kpi-shimmer" style={{ width: '42%', height: 9 }} />
        <div className="kpi-shimmer" style={{ width: '58%', height: 28, borderRadius: 6 }} />
      </div>
      <div className="kpi-shimmer" style={{ height: 1 }} />
      <div className="kpi-shimmer" style={{ width: '38%', height: 9 }} />
    </article>
  );
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function DashboardKpiCards({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="kpi">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="kpi-grid" aria-label="Indicateurs clés">
        {!cards.length
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
          : cards.map((card) => <Card key={card.label} {...card} />)}
      </section>
    </div>
  );
}

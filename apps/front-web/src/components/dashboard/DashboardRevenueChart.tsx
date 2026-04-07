'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import type { SalesPoint } from '@/hooks/dashboard/useCeoDashboardData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}k`;
  return String(Math.round(num));
}

/** Smooth cubic-bezier path through points */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cx  = (p0.x + p1.x) / 2;
    d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

/** Period-over-period % change (first half vs second half of data) */
function periodChange(data: SalesPoint[]): number | null {
  if (data.length < 4) return null;
  const half = Math.floor(data.length / 2);
  const prev = data.slice(0, half).reduce((s, d) => s + d.value, 0);
  const curr = data.slice(half).reduce((s, d) => s + d.value, 0);
  if (!prev) return null;
  return ((curr - prev) / prev) * 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data:      SalesPoint[];
  change?:   number;   // override pct change (from stats)
};

export function DashboardRevenueChart({ data, change }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const total = useMemo(() => data.reduce((a, b) => a + Number(b.value ?? 0), 0), [data]);
  const max   = useMemo(() => Math.max(...data.map((d) => Number(d.value ?? 0)), 1), [data]);

  // Map to SVG coords (viewBox 0 0 600 160)
  const W = 600, H = 160, PAD_X = 0, PAD_Y = 16;
  const pts = useMemo(() =>
    data.map((d, i) => ({
      x: data.length < 2 ? W / 2 : PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2),
      y: PAD_Y + (1 - Number(d.value ?? 0) / max) * (H - PAD_Y * 2),
    })),
  [data, max]);

  const linePath = useMemo(() => smoothPath(pts), [pts]);
  const areaPath = useMemo(() => {
    if (!pts.length) return '';
    return `${linePath} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`;
  }, [linePath, pts]);

  // Peak point for glow and reference line
  const peakIdx = useMemo(() => {
    let mi = 0;
    data.forEach((d, i) => { if (Number(d.value ?? 0) > Number(data[mi].value ?? 0)) mi = i; });
    return mi;
  }, [data]);

  const pct = change ?? periodChange(data);

  // Mouse move over SVG → find closest point
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || !pts.length) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - mouseX);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setHoverIndex(closest);
  }, [pts]);

  // Handle tooltip positioning
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (hoverIndex !== null && svgRef.current && pts[hoverIndex]) {
      const rect = svgRef.current.getBoundingClientRect();
      const pt = pts[hoverIndex];
      // Convert SVG coordinates back to screen pixels relative to the container
      const pxLeft = (pt.x / W) * rect.width;
      const pxTop = (pt.y / H) * rect.height;
      setTooltipPos({ left: pxLeft, top: pxTop });
    }
  }, [hoverIndex, pts, W, H]);


  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (!data.length) {
    return (
      <article style={cardStyle}>
        <style>{CSS}</style>
        <div className="rc-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="rc-shimmer" style={{ width: 100, height: 12 }} />
            <div className="rc-shimmer" style={{ width: 160, height: 32, borderRadius: 8 }} />
          </div>
          <div className="rc-shimmer" style={{ width: 80, height: 28, borderRadius: 99 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rc-shimmer" style={{ width: 32, height: 8, borderRadius: 4 }} />
          ))}
        </div>
      </article>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hovPt   = hoverIndex !== null ? pts[hoverIndex]  : null;
  const peakPt  = pts[peakIdx];

  return (
    <article style={cardStyle}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rc-header">
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Chiffre d&apos;affaires
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
              {fmt(total)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>CFA</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pct !== null ? (
            <span className={pct >= 0 ? 'rc-badge rc-badge-up' : 'rc-badge rc-badge-down'}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d={pct >= 0 ? 'M5 8V2M2 5l3-3 3 3' : 'M5 2v6M2 5l3 3 3-3'}
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Chart Area ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginTop: 24, paddingLeft: 40 }}>

        {/* Y-Axis Grid & Labels */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 24, width: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {[1, 0.75, 0.5, 0.25, 0].map((t, i) => (
            <span key={i} style={{
               fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
               transform: 'translateY(-50%)',
            }}>
              {t === 0 ? '0' : fmt(max * t)}
            </span>
          ))}
        </div>

        {/* SVG Chart */}
        <div style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="rc-chart-svg"
            style={{ width: '100%', height: 260, display: 'block', cursor: 'crosshair', overflow: 'visible' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="rc-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#FF3B30" />
              </linearGradient>

              <linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,59,48,0.25)" />
                <stop offset="100%" stopColor="rgba(255,59,48,0.0)" />
              </linearGradient>

              <clipPath id="rc-clip">
                <rect x="0" y="0" width={W} height={H} />
              </clipPath>

              {peakPt && (
                <radialGradient id="rc-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="rgba(255,59,48,0.35)" />
                  <stop offset="100%" stopColor="rgba(255,59,48,0)" />
                </radialGradient>
              )}
            </defs>

            {/* Horizontal dashed grid lines matching Y-axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD_Y + t * (H - PAD_Y * 2);
              return (
                <line
                  key={t}
                  x1={0} y1={y} x2={W} y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Peak reference line */}
            {peakPt && (
              <>
                <line
                  x1={peakPt.x} y1={peakPt.y}
                  x2={peakPt.x} y2={H}
                  stroke="rgba(255,59,48,0.3)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              </>
            )}

            {/* Peak glow blob */}
            {peakPt && (
              <ellipse
                cx={peakPt.x}
                cy={peakPt.y}
                rx={80} ry={80}
                fill="url(#rc-glow)"
                style={{ filter: 'blur(10px)' }}
              />
            )}

            {/* Area fill */}
            <path d={areaPath} fill="url(#rc-area)" clipPath="url(#rc-clip)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#rc-line)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0px 8px 12px rgba(255,59,48,0.3))' }}
            />

            {/* Glowing Peak Dot */}
            {peakPt && (
              <>
                <circle cx={peakPt.x} cy={peakPt.y} r={5} fill="#FF3B30" />
                <circle cx={peakPt.x} cy={peakPt.y} r={2} fill="#fff" />
              </>
            )}

            {/* Hover crosshair & point */}
            {hovPt && (
              <>
                <line
                  x1={0} y1={hovPt.y}
                  x2={W} y2={hovPt.y}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1={hovPt.x} y1={0}
                  x2={hovPt.x} y2={H}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <circle cx={hovPt.x} cy={hovPt.y} r={7} fill="rgba(255,59,48,0.2)" />
                <circle cx={hovPt.x} cy={hovPt.y} r={4} fill="#FF3B30" />
                <circle cx={hovPt.x} cy={hovPt.y} r={2} fill="#fff" />
              </>
            )}
          </svg>

          {/* Floating Tooltip */}
          {hovered && hovPt && (
            <div
              className="rc-tooltip"
              style={{
                position: 'absolute',
                left: tooltipPos.left,
                top: tooltipPos.top - 15,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
              }}
            >
              <span className="rc-tooltip-label">{hovered.label}</span>
              <span className="rc-tooltip-value">
                 {new Intl.NumberFormat('fr-FR').format(Math.round(hovered.value))} <span style={{fontSize:10, color:'rgba(255,255,255,0.5)'}}>CFA</span>
              </span>
            </div>
          )}
        </div>

        {/* ── X-axis labels ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
        }}>
          {data.map((p, i) => {
             // Show subset of labels for cleaner X axis
             const showLabel = i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2);
             if (!showLabel && hoverIndex !== i) return <span key={i} style={{width: 30}}/>;

             return (
              <span key={i} className={hoverIndex === i ? 'rc-xlabel rc-xlabel-active' : 'rc-xlabel'} style={{width: 30, textAlign: i===0?'left':i===data.length-1?'right':'center'}}>
                {p.label}
              </span>
             )
          })}
        </div>
      </div>

      {/* ── Footer stats ───────────────────────────────────────────────────── */}
      <div className="rc-footer">
        <div className="rc-stat">
          <span className="rc-stat-dot" style={{ background: '#FF3B30', boxShadow: '0 0 0 3px rgba(255,59,48,0.2)' }} />
          <div>
             <div className="rc-stat-label">Pic d&apos;activité</div>
             <div className="rc-stat-value">{fmt(max)} CFA</div>
          </div>
        </div>
        <div className="rc-stat">
          <span className="rc-stat-dot" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 0 0 3px rgba(255,255,255,0.1)' }} />
          <div>
             <div className="rc-stat-label">Moyenne</div>
             <div className="rc-stat-value">{fmt(total / Math.max(data.length, 1))} CFA</div>
          </div>
        </div>
        <div className="rc-stat">
          <span className="rc-stat-dot" style={{ background: '#7C3AED', boxShadow: '0 0 0 3px rgba(124,58,237,0.2)' }} />
          <div>
             <div className="rc-stat-label">Total Gérant</div>
             <div className="rc-stat-value">{fmt(total)} CFA</div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  background: '#050505',
  backgroundImage: 'radial-gradient(ellipse at 80% -20%, rgba(255,59,48,0.15), transparent 50%), linear-gradient(180deg, #0A0A0A 0%, #000 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px 28px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  position: 'relative',
  overflow: 'hidden',
};

const CSS = `
  .rc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    z-index: 10;
  }

  .rc-title {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .rc-total {
    font-size: 32px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -1.5px;
    line-height: 1;
  }

  .rc-currency {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
  }

  .rc-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.2px;
  }

  .rc-badge-up   { background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.2); }
  .rc-badge-down { background: rgba(239,68,68,0.15);  color: #F87171; border: 1px solid rgba(239,68,68,0.2); }

  .rc-tooltip {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 14px;
    border-radius: 12px;
    background: rgba(20,20,20,0.85);
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
    z-index: 20;
    white-space: nowrap;
    animation: rcPopIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  @keyframes rcPopIn { from { opacity: 0; transform: translate(-50%, -80%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -100%) scale(1); } }

  .rc-tooltip::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 10px; height: 10px;
    background: rgba(20,20,20,0.85);
    border-right: 1px solid rgba(255,255,255,0.15);
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }

  .rc-tooltip-label {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .rc-tooltip-value {
    font-size: 16px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .rc-xlabel {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    font-weight: 500;
    transition: color 0.15s;
    letter-spacing: 0.2px;
  }

  .rc-xlabel-active {
    color: rgba(255,255,255,0.9);
    font-weight: 700;
  }

  .rc-footer {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .rc-stat {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .rc-stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .rc-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .rc-stat-value {
    font-size: 14px;
    color: #fff;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  @keyframes rcPulse { 0%,100%{opacity:1} 50%{opacity:.45} }

  .rc-shimmer {
    border-radius: 8px;
    background: rgba(255,255,255,0.07);
    animation: rcPulse 1.4s ease-in-out infinite;
  }

  @media (max-width: 600px) {
    .rc-header { flex-wrap: wrap; gap: 10px; }
    .rc-chart-svg { height: 160px !important; }
  }
`;

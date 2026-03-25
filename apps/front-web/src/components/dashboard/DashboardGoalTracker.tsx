'use client';

import { useState } from 'react';

type Props = {
  currentRevenue: number;
  period?:        '7days' | '30days' | '90days';
  isLoading?:     boolean;
};

function fmtShort(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return String(Math.round(v));
}

function fmtFull(v: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(v));
}

const DEFAULT_GOALS: Record<string, number> = {
  '7days':  150_000,
  '30days': 500_000,
  '90days': 1_500_000,
};

const PERIOD_LABELS: Record<string, string> = {
  '7days':  '7 jours',
  '30days': 'ce mois',
  '90days': '3 mois',
};

// ── Gauge SVG ─────────────────────────────────────────────────────────────────
// Semicircle: M 22,106 A 88,88 0 0 1 198,106
const CX = 110, CY = 106, R = 88;
const SEMICIRCUM = Math.PI * R; // ≈ 276.5

function GaugeSvg({ pct, color, exceeded }: { pct: number; color: string; exceeded: boolean }) {
  const clamped  = Math.min(pct, 100);
  const dashOffset = SEMICIRCUM * (1 - clamped / 100);

  // Position of the progress end cap
  const α    = Math.PI * (1 - clamped / 100);
  const capX = CX + R * Math.cos(α);
  const capY = CY - R * Math.sin(α);

  const arcPath = `M ${CX - R},${CY} A ${R},${R} 0 0 1 ${CX + R},${CY}`;

  return (
    <svg
      viewBox="0 0 220 118"
      style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={exceeded ? '#10B981' : color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={exceeded ? '#34D399' : color} />
        </linearGradient>
        <filter id="gauge-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gauge-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Track Background */}
      <path
        d={arcPath}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="14"
        strokeLinecap="round"
        filter="url(#gauge-shadow)"
      />

      {/* Progress arc */}
      {clamped > 0 && (
        <path
          d={arcPath}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={SEMICIRCUM}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          filter="url(#gauge-glow)"
        />
      )}

      {/* Milestone Dots */}
      <circle cx={CX} cy={CY - R} r={3} fill="rgba(0,0,0,0.15)" /> {/* 50% marker */}

      {/* End cap glow dot */}
      {clamped > 2 && clamped < 98 && (
        <g style={{ transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <circle cx={capX} cy={capY} r={10}  fill={color} opacity={0.2} />
          <circle cx={capX} cy={capY} r={6} fill={color} />
          <circle cx={capX} cy={capY} r={2.5}  fill="#fff" />
        </g>
      )}

      {/* Center text */}
      <text x={CX} y={CY - 22} textAnchor="middle" style={{ fontSize: 36, fontWeight: 900, fill: '#0A0A0A', letterSpacing: '-1.5px' }}>
        {exceeded ? 'Objectif🎯' : `${Math.round(clamped)}%`}
      </text>
      <text x={CX} y={CY - 6} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 700, fill: 'rgba(0,0,0,0.35)', letterSpacing: '1px', textTransform: 'uppercase' }}>
        progression
      </text>

      {/* Left / Right labels */}
      <text x={CX - R - 6} y={CY + 18} textAnchor="middle" style={{ fontSize: 10, fill: 'rgba(0,0,0,0.35)', fontWeight: 700 }}>0%</text>
      <text x={CX + R + 6} y={CY + 18} textAnchor="middle" style={{ fontSize: 10, fill: color, fontWeight: 800 }}>100%</text>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardGoalTracker({ currentRevenue, period = '30days', isLoading = false }: Props) {
  const [goal, setGoal]       = useState(DEFAULT_GOALS[period] ?? 500_000);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const pct       = Math.min((currentRevenue / goal) * 100, 100);
  const remaining = Math.max(goal - currentRevenue, 0);
  const exceeded  = currentRevenue >= goal;

  const color =
    pct >= 100 ? '#10B981' :
    pct >= 75  ? '#06B6D4' :
    pct >= 40  ? '#7C3AED' :
                 '#FF3B30';

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 130, height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'gtPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 90,  height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'gtPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ width: '100%', height: 120, borderRadius: 12, background: 'rgba(0,0,0,0.04)', animation: 'gtPulse 1.3s ease-in-out infinite', marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[1,2].map((i) => (
            <div key={i} style={{ height: 64, borderRadius: 14, background: 'rgba(0,0,0,0.04)', animation: 'gtPulse 1.3s ease-in-out infinite' }} />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Objectif CA
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
            Progression sur {PERIOD_LABELS[period]}
          </p>
        </div>

        {/* Edit goal button */}
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseInt(inputVal.replace(/\D/g, ''), 10);
              if (v > 0) setGoal(v);
              setEditing(false);
            }}
            style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
          >
            <input
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={String(goal)}
              style={{
                width: 90, padding: '6px 10px', borderRadius: 8,
                border: `1.5px solid ${color}50`, fontSize: 12,
                fontWeight: 700, outline: 'none', color: '#111', background: 'transparent',
              }}
            />
            <button type="submit" style={btnStyle('#111')}>✓</button>
            <button type="button" onClick={() => setEditing(false)} style={btnStyle('rgba(0,0,0,0.08)', '#111')}>✕</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => { setInputVal(String(goal)); setEditing(true); }}
            style={{
              background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(0,0,0,0.5)', fontSize: 12, fontWeight: 700,
              padding: '6px 12px', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
              e.currentTarget.style.color = '#111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
              e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modifier
          </button>
        )}
      </div>

      {/* Gauge */}
      <div style={{ marginBottom: 20 }}>
        <GaugeSvg pct={pct} color={color} exceeded={exceeded} />
      </div>

      {/* Stats row - filled layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: `${color}12`,
          border: `1px solid ${color}20`,
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Réalisé
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, color, letterSpacing: '-0.5px' }}>
            {fmtShort(currentRevenue)}
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>CFA</span>
          </p>
        </div>
        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: 'rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Objectif
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
            {fmtShort(goal)}
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>CFA</span>
          </p>
        </div>
      </div>

      {/* Deviation label */}
      <div style={{
        padding: '10px', borderRadius: 12,
        background: exceeded ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.02)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: 12, color: exceeded ? '#059669' : 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
          {exceeded
            ? `Objectif dépassé de ${fmtFull(currentRevenue - goal)} CFA 🔥`
            : `Reste ${fmtFull(remaining)} CFA à réaliser`}
        </p>
      </div>
    </article>
  );
}

function btnStyle(bg: string, color: string = '#fff'): React.CSSProperties {
  return { padding: '6px 10px', borderRadius: 8, border: 'none', background: bg, color, cursor: 'pointer', fontSize: 12, fontWeight: 800, transition: 'all 0.15s' };
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  padding: '24px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const ANIM = `@keyframes gtPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

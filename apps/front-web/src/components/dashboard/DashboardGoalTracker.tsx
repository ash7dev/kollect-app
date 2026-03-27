'use client';

import { useState } from 'react';

type Props = {
  currentRevenue: number;
  period?:        '7days' | '30days' | '90days';
  isLoading?:     boolean;
};

function fmtShort(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}k`;
  return String(Math.round(num));
}

function fmtFull(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num));
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
  const [goal, setGoal] = useState(() => {
    // Charger l'objectif sauvegardé ou utiliser la valeur par défaut
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`goal_${period}`);
      return saved ? parseInt(saved, 10) : DEFAULT_GOALS[period] ?? 500_000;
    }
    return DEFAULT_GOALS[period] ?? 500_000;
  });
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  // Sauvegarder l'objectif quand il change
  const handleGoalChange = (newGoal: number) => {
    setGoal(newGoal);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`goal_${period}`, String(newGoal));
    }
  };

  const rev = Number(currentRevenue) || 0;
  const pct       = Math.min((rev / goal) * 100, 100);
  const remaining = Math.max(goal - rev, 0);
  const exceeded  = rev >= goal;

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Objectif CA
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Progression sur {PERIOD_LABELS[period]}
          </p>
        </div>

        {/* Enhanced edit goal button */}
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseInt(inputVal.replace(/\D/g, ''), 10);
              if (v > 0) handleGoalChange(v);
              setEditing(false);
            }}
            style={{ 
              display: 'flex', gap: 8, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', 
              padding: '8px', borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
              border: `2px solid ${color}30`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <input
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={String(goal)}
              style={{
                width: 100, padding: '8px 12px', borderRadius: 8,
                border: `2px solid ${color}20`, fontSize: 13,
                fontWeight: 700, outline: 'none', color: '#111', background: 'transparent',
              }}
            />
            <button 
              type="button"
              onClick={() => setInputVal(String(rev))}
              style={{
                padding: '8px 10px', borderRadius: 8, border: 'none', 
                background: 'rgba(0,0,0,0.08)', color: '#111', cursor: 'pointer', 
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              title="Utiliser le CA actuel"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M12 7v5l3 3"/>
              </svg>
            </button>
            <button 
              type="button"
              onClick={() => {
                handleGoalChange(DEFAULT_GOALS[period] ?? 500_000);
                setEditing(false);
              }}
              style={{
                padding: '8px 10px', borderRadius: 8, border: 'none', 
                background: 'rgba(0,0,0,0.08)', color: '#111', cursor: 'pointer', 
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              title="Réinitialiser par défaut"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
            <button 
              type="submit" 
              style={{
                padding: '8px 10px', borderRadius: 8, border: 'none', 
                background: color, color: '#fff', cursor: 'pointer', 
                fontSize: 12, fontWeight: 800, transition: 'all 0.2s',
                boxShadow: `0 2px 8px ${color}40`
              }}
            >✓</button>
            <button 
              type="button" 
              onClick={() => setEditing(false)} 
              style={{
                padding: '8px 10px', borderRadius: 8, border: 'none', 
                background: 'rgba(0,0,0,0.08)', color: '#111', cursor: 'pointer', 
                fontSize: 12, fontWeight: 800, transition: 'all 0.2s'
              }}
            >✕</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => { setInputVal(String(goal)); setEditing(true); }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.04) 100%)', 
              border: '1px solid rgba(255,59,48,0.15)',
              borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#FF3B30', fontSize: 12, fontWeight: 700,
              padding: '8px 16px', transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,59,48,0.12) 0%, rgba(255,59,48,0.06) 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,59,48,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.04) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={goal !== (DEFAULT_GOALS[period] ?? 500_000) ? 'Objectif personnalisé' : 'Modifier l\'objectif'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {goal !== (DEFAULT_GOALS[period] ?? 500_000) ? 'Modifié' : 'Modifier'}
          </button>
        )}
      </div>

      {/* Gauge */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 240, height: 240, borderRadius: '50%',
          background: exceeded 
            ? `radial-gradient(circle, ${color}10 0%, transparent 70%)`
            : 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <GaugeSvg pct={pct} color={color} exceeded={exceeded} />
      </div>

      {/* Stats row - enhanced cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{
          padding: '18px 20px', borderRadius: 16,
          background: exceeded 
            ? `linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)`
            : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `2px solid ${color}25`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {exceeded && (
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle, #10B98120 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Réalisé
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 900, color: exceeded ? '#10B981' : color, letterSpacing: '-0.6px' }}>
            {fmtShort(rev)}
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginLeft: 6 }}>CFA</span>
          </p>
        </div>
        <div style={{
          padding: '18px 20px', borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 100%)',
          border: '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Objectif
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.6px' }}>
            {fmtShort(goal)}
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', marginLeft: 6 }}>CFA</span>
          </p>
        </div>
      </div>

      {/* Enhanced deviation label */}
      <div style={{
        padding: '14px 18px', borderRadius: 16,
        background: exceeded 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.03) 100%)',
        border: exceeded 
          ? '2px solid rgba(16,185,129,0.2)' 
          : '1px solid rgba(255,59,48,0.15)',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {exceeded && (
          <div style={{
            position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, #10B98120 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
        <p style={{ 
          margin: 0, 
          fontSize: 13, 
          color: exceeded ? '#059669' : '#FF3B30', 
          fontWeight: 700,
          letterSpacing: '0.2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          {exceeded ? (
            <>
              <span>Objectif atteint !</span>
              <span style={{ fontSize: 16 }}>🎉</span>
            </>
          ) : (
            <>
              <span>Reste</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>{fmtFull(remaining)}</span>
              <span>CFA</span>
            </>
          )}
        </p>
        {!exceeded && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
            {Math.round(pct)}% de l&apos;objectif
          </p>
        )}
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
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '28px 24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const ANIM = `@keyframes gtPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

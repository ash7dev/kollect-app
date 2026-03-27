'use client';

import { useEffect, useState } from 'react';
import type { CeoCollectionDetail } from '@/types/drops';

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
  cube:     'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  clock:    ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  calendar: ['M3 9h18M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z', 'M16 3v4M8 3v4'],
  rocket:   'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  check:    'M20 6L9 17l-5-5',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

// ─── Countdown chip ──────────────────────────────────────────────────────────

function LiveCountdown({ target }: { target: string }) {
  const [cd, setCd] = useState(() => calcCountdown(target));

  useEffect(() => {
    const timer = setInterval(() => setCd(calcCountdown(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (!cd) return <span style={{ color: '#EF4444', fontWeight: 700 }}>Passée</span>;

  const parts = cd.d > 0
    ? [`${cd.d}j`, `${cd.h}h`, `${cd.m}m`]
    : cd.h > 0
      ? [`${cd.h}h`, `${cd.m}m`, `${cd.s}s`]
      : [`${cd.m}m`, `${cd.s}s`];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {parts.map((p, i) => (
        <span key={i} style={{
          fontSize: 11.5, fontWeight: 800,
          background: 'rgba(245,158,11,0.12)', color: '#B45309',
          padding: '2px 6px', borderRadius: 6,
        }}>
          {p}
        </span>
      ))}
    </div>
  );
}

// ─── Mode label ──────────────────────────────────────────────────────────────

function getModeLabel(status: string) {
  if (status === 'TEASER') return { label: 'Teaser planifié', icon: ICONS.clock, color: '#F59E0B' };
  if (status === 'DISPONIBLE') return { label: 'Disponible immédiatement', icon: ICONS.check, color: '#10B981' };
  return { label: 'En attente', icon: ICONS.rocket, color: 'rgba(0,0,0,0.35)' };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CollectionMeta({ collection }: { collection: CeoCollectionDetail }) {
  const { status, launchDate, launchedAt, _count } = collection;
  const productCount = _count?.products ?? collection.products.length;
  const modeInfo = getModeLabel(status);

  return (
    <div className="cd-meta-row">

      {/* Products count */}
      <div className="cd-meta-chip">
        <Ic d={ICONS.cube} stroke="rgba(0,0,0,0.35)" />
        <span>{productCount} produit{productCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Mode */}
      <div className="cd-meta-chip">
        <Ic d={modeInfo.icon} stroke={modeInfo.color} />
        <span style={{ color: modeInfo.color }}>{modeInfo.label}</span>
      </div>

      {/* Countdown (TEASER only) */}
      {status === 'TEASER' && launchDate && (
        <div className="cd-meta-chip" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
          <Ic d={ICONS.clock} stroke="#F59E0B" />
          <LiveCountdown target={launchDate} />
        </div>
      )}

      {/* Launch date (TEASER) */}
      {status === 'TEASER' && launchDate && (
        <div className="cd-meta-chip">
          <Ic d={ICONS.calendar} stroke="rgba(0,0,0,0.35)" />
          <span>Lance le {formatDate(launchDate)}</span>
        </div>
      )}

      {/* Launched at (DISPONIBLE+) */}
      {launchedAt && status !== 'TEASER' && (
        <div className="cd-meta-chip">
          <Ic d={ICONS.calendar} stroke="rgba(0,0,0,0.35)" />
          <span>Lancée le {formatDate(launchedAt)}</span>
        </div>
      )}
    </div>
  );
}

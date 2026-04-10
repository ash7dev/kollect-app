'use client';

import { useEffect, useState } from 'react';
import type { CeoCollectionDetail } from '@/types/drops';

import {
  DropIcon as Ic,
  DROP_ICONS as ICONS,
  formatDropDate as formatDate,
} from '../drop-shared';



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
  const { status, launchDate, launchedAt, endDate, _count } = collection;
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

      {/* End date (optional) */}
      {endDate && (
        <div className="cd-meta-chip" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <Ic d={ICONS.clock} stroke="#EF4444" />
          <span>Finit le {formatDate(endDate)}</span>
        </div>
      )}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import type { CeoCollectionDetail } from '@/types/drops';

// ─── Icons ───────────────────────────────────────────────────────────────────

function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.6 }: {
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
  star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  video:  ['M23 7l-7 5 7 5V7z', 'M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z'],
};

// ─── Status meta ─────────────────────────────────────────────────────────────

function getStatusMeta(status: string) {
  const MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    TEASER:     { label: 'Teaser',     color: '#B45309', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)' },
    DISPONIBLE: { label: 'Live',       color: '#047857', bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.3)' },
    EPUISEE:    { label: 'Épuisée',    color: '#b91c1c', bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.3)'  },
    TERMINE:    { label: 'Terminée',   color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.15)' },
    BROUILLON:  { label: 'Brouillon',  color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.15)' },
  };
  return MAP[status] ?? MAP.BROUILLON;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CollectionHero({ collection }: { collection: CeoCollectionDetail }) {
  const { name, description, status, isFeatured, coverImage, teaserVideo } = collection;
  const statusMeta = getStatusMeta(status);
  const isVideo = Boolean(teaserVideo);

  return (
    <div className="cd-hero">

      {/* Media */}
      {isVideo ? (
        <>
          <video
            src={teaserVideo!}
            className="cd-hero-media"
            autoPlay loop muted playsInline
            style={{ objectFit: 'cover' }}
          />
          {/* Video indicator */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 99,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }}>
            <Ic d={ICONS.video} size={14} stroke="#fff" sw={1.8} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
              Vidéo cover
            </span>
          </div>
        </>
      ) : coverImage ? (
        <img src={coverImage} alt={name} className="cd-hero-media" />
      ) : (
        <div className="cd-hero-empty">
          <Ic d={ICONS.layers} size={40} stroke="rgba(255,255,255,0.12)" sw={1.2} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Aucun média
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="cd-hero-scrim" />

      {/* Badges row */}
      <div className="cd-hero-badges">
        <div>
          {isFeatured && (
            <span className="cd-featured-badge">
              <Ic d={ICONS.star} size={10} stroke="#fff" sw={2} />
              Featured
            </span>
          )}
        </div>
        <span
          className="cd-status-pill"
          style={{ color: statusMeta.color, background: statusMeta.bg, border: `1px solid ${statusMeta.border}` }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusMeta.color, display: 'inline-block' }} />
          {statusMeta.label}
        </span>
      </div>

      {/* Name + description */}
      <div className="cd-hero-footer">
        <h1 className="cd-hero-name">{name}</h1>
        {description && <p className="cd-hero-desc">{description}</p>}
      </div>
    </div>
  );
}

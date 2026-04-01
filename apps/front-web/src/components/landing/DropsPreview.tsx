'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Drop {
  id: string;
  brand: string;
  name: string;
  launchLabel: string;
  countdown: string;
  pieces: number;
  accentColor: string;
  tag: string;
  status: string;
}

const STYLES = [
  { accentColor: '#FF3B30', tag: 'Édition limitée' },
  { accentColor: '#FF9500', tag: 'Calendrier' },
  { accentColor: '#C9A962', tag: 'Marque' },
];

function IconCalendarEmpty() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function formatCountdown(targetDate: string): string {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Disponible';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}j ${hours}h`;
}

/* ─── Skeleton card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: '20px', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', animation: 'dropSkeleton 1.6s ease-in-out infinite' }}>
      {[64, 48, 80, 1, 36].map((h, i) => (
        <div key={i} style={{ height: `${h}px`, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: i === 3 ? '20px' : '12px', width: i === 1 ? '60%' : '100%', marginTop: i === 3 ? '20px' : 0 }} />
      ))}
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────── */
function EmptyDrops() {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      {/* Icon */}
      <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        <IconCalendarEmpty />
      </div>
      {/* Text */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 12px' }}>
        Prochains lancements au calendrier
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, maxWidth: '420px', margin: '0 0 32px' }}>
        Les Marques préparent leurs éditions. Sois averti dès qu&apos;une fenêtre de vente s&apos;ouvre — en quantité souvent limitée.
      </p>
      {/* CTA */}
      <Link href="#download" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30', boxShadow: '0 8px 32px rgba(255,59,48,0.35)' }}>
        Recevoir une alerte
      </Link>
      {/* Divider hint */}
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
        Marque ou label ?{' '}
        <Link href="/create-brand" style={{ color: '#C9A962', textDecoration: 'none', fontWeight: 700 }}>
          Planifier un lancement →
        </Link>
      </p>
    </div>
  );
}

/* ─── Drop card ─────────────────────────────────────────────────── */
function DropCard({ drop }: { drop: Drop }) {
  return (
    <div
      className="drop-card"
      style={{
        borderRadius: '20px',
        backgroundColor: '#0A0A0A',
        border: `1px solid ${drop.accentColor}22`,
        overflow: 'hidden',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Glow */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: `linear-gradient(to bottom, ${drop.accentColor}18, transparent)`, pointerEvents: 'none' }} />

      <div style={{ padding: '28px 24px', position: 'relative' }}>
        {/* Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px 5px 10px', borderRadius: '999px', backgroundColor: `${drop.accentColor}18`, border: `1px solid ${drop.accentColor}30`, marginBottom: '20px' }}>
          <span aria-hidden style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: drop.accentColor, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: drop.accentColor, letterSpacing: '1px' }}>{drop.tag}</span>
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: '8px' }}>{drop.brand}</p>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.3, margin: '0 0 24px' }}>
          {drop.name}
        </h3>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', letterSpacing: '0.5px' }}>{drop.launchLabel}</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: drop.accentColor, letterSpacing: '-0.5px', margin: 0 }}>{drop.countdown}</p>
          </div>
          {drop.pieces > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', letterSpacing: '0.5px' }}>Exemplaires</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>{drop.pieces}</p>
            </div>
          )}
        </div>

        <button
          className="drop-notify-btn"
          style={{ width: '100%', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', backgroundColor: `${drop.accentColor}22`, border: `1px solid ${drop.accentColor}44`, cursor: 'pointer', transition: 'all 220ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={drop.accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Me notifier
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function DropsPreview() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDrops() {
      try {
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        const comingSoon: any[] = Array.isArray(homeData?.comingSoon) ? homeData.comingSoon : [];
        const newReleases: any[] = Array.isArray(homeData?.newReleases) ? homeData.newReleases : [];
        const combined = [...comingSoon, ...newReleases].slice(0, 3);

        const formatted: Drop[] = combined.map((d: any, index: number) => {
          const style = STYLES[index % STYLES.length];
          const hasLaunchDate = !!d.launchDate && new Date(d.launchDate).getTime() > Date.now();
          return {
            id: d.id,
            brand: d.brand?.name || 'Marque indépendante',
            name: d.name,
            status: d.status,
            launchLabel: hasLaunchDate ? 'Ouverture dans' : 'Sélection disponible',
            countdown: hasLaunchDate ? formatCountdown(d.launchDate) : 'Maintenant',
            pieces: d._count?.products ?? 0,
            ...style,
          };
        });

        setDrops(formatted); // Peut être vide — on affiche l'empty state
      } catch (err) {
        console.error('Failed to fetch drops:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDrops();
  }, []);

  return (
    <section
      id="drops"
      aria-label="Drops à venir"
      style={{
        padding: '120px 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Grid bg */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '56px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF3B30', boxShadow: '0 0 10px rgba(255,59,48,0.8)', display: 'inline-block', animation: 'dropPulse 1.5s ease-in-out infinite' }} />
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#C2923B', letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>
                {drops.length > 0 ? 'Agenda des marques' : 'Calendrier'}
              </p>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0 }}>
              Les lancements qui comptent.{' '}
              <span style={{ color: 'rgba(255,255,255,0.32)' }}>Avant tout le monde.</span>
            </h2>
          </div>

          {drops.length > 0 && (
            <Link
              href="/drops"
              className="drops-see-all"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', transition: 'all 200ms ease', flexShrink: 0 }}
            >
              Voir l&apos;agenda
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="drops-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {loading ? (
            [0, 1, 2].map(i => <SkeletonCard key={i} />)
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}><IconAlert /></div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>Impossible de charger les drops pour le moment.</p>
            </div>
          ) : drops.length === 0 ? (
            <EmptyDrops />
          ) : (
            drops.map(drop => <DropCard key={drop.id} drop={drop} />)
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
        }
        @keyframes dropSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .drop-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.6) !important;
        }
        .drop-notify-btn:hover {
          background-color: rgba(255,59,48,0.2) !important;
          border-color: rgba(255,59,48,0.5) !important;
        }
        .drops-see-all:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.28) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 960px) {
          .drops-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #drops { padding: 64px 16px !important; margin: 0 6px !important; }
          .drops-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';

const FALLBACK_DROPS = [
  {
    id: '1',
    brand: 'Galsen Streetwear',
    name: 'Collection Teranga AW25',
    status: 'UPCOMING',
    launchDate: 'Lancement dans',
    countdown: '3j 14h',
    pieces: 12,
    tag: 'Exclusive',
    tagColor: '#FF3B30',
    bgColor: '#0A0A0A',
    accentColor: '#FF3B30',
    emoji: '🔥',
  },
  {
    id: '2',
    brand: 'Urban Nomad',
    name: 'Drop Saison 2 — Wolof Wave',
    status: 'UPCOMING',
    launchDate: 'Lancement dans',
    countdown: '7j 03h',
    pieces: 8,
    tag: 'Limité',
    tagColor: '#FF9500',
    bgColor: '#0D0D0D',
    accentColor: '#FF9500',
    emoji: '⚡',
  },
  {
    id: '3',
    brand: 'Ndakaaru Lab',
    name: 'Capsule Dakar Heritage',
    status: 'TEASER',
    launchDate: 'Bientôt',
    countdown: '14j',
    pieces: 6,
    tag: 'Teaser',
    tagColor: '#007AFF',
    bgColor: '#080810',
    accentColor: '#007AFF',
    emoji: '👁',
  },
];

const STYLES = [
  { tagColor: '#FF3B30', bgColor: '#0A0A0A', accentColor: '#FF3B30', emoji: '🔥', tag: 'Exclusif' },
  { tagColor: '#FF9500', bgColor: '#0D0D0D', accentColor: '#FF9500', emoji: '⚡', tag: 'Populaire' },
  { tagColor: '#007AFF', bgColor: '#080810', accentColor: '#007AFF', emoji: '👁', tag: 'Nouveau' },
];

function formatCountdown(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Disponible';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}j ${hours}h`;
}

export function DropsPreview() {
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrops() {
      try {
        // Single request: /collections/home returns featured, trending, comingSoon, newReleases
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        // Prefer coming-soon (TEASER with future launchDate), then new releases
        const comingSoon: any[] = Array.isArray(homeData?.comingSoon) ? homeData.comingSoon : [];
        const newReleases: any[] = Array.isArray(homeData?.newReleases) ? homeData.newReleases : [];
        const combined = [...comingSoon, ...newReleases];

        if (combined.length > 0) {
          const formattedDrops = combined.slice(0, 3).map((d: any, index: number) => {
            const style = STYLES[index % STYLES.length];
            return {
              id: d.id,
              brand: d.brand?.name || 'Marque Indépendante',
              name: d.name,
              status: d.status,
              launchDate: d.launchDate ? 'Lancement dans' : 'Disponible depuis',
              countdown: d.launchDate
                ? formatCountdown(d.launchDate)
                : new Date(d.createdAt).toLocaleDateString('fr-SN'),
              pieces: d._count?.products ?? 0,
              ...style,
            };
          });

          // Pad with fallbacks if we have fewer than 3 real drops
          while (formattedDrops.length < 3) {
            formattedDrops.push(FALLBACK_DROPS[formattedDrops.length]);
          }

          setDrops(formattedDrops);
        } else {
          setDrops(FALLBACK_DROPS);
        }
      } catch (error) {
        console.error('Failed to fetch drops:', error);
        setDrops(FALLBACK_DROPS);
      } finally {
        setLoading(false);
      }
    }

    fetchDrops();
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '120px 24px', backgroundColor: '#000', minHeight: '600px' }} />
    );
  }
  return (
    <section
      id="drops"
      aria-label="Drops à venir"
      style={{
        padding: '120px 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '32px 32px 0 0',
        margin: '0 12px 0',
      }}
    >
      {/* Noise overlay */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '56px',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#FF3B30',
                boxShadow: '0 0 10px rgba(255,59,48,0.8)',
                display: 'inline-block',
                animation: 'dropPulse 1.5s ease-in-out infinite',
              }} />
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#FF3B30',
                letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0,
              }}>
                Drops à venir
              </p>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
            }}>
              Ne rate aucun drop.{' '}
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Jamais.</span>
            </h2>
          </div>

          <a
            href="/drops"
            className="drops-see-all"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px', fontWeight: 600,
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              transition: 'all 200ms ease',
              flexShrink: 0,
            }}
          >
            Voir tous les drops
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Drop cards */}
        <div className="drops-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="drop-card"
              style={{
                borderRadius: '20px',
                backgroundColor: drop.bgColor,
                border: `1px solid ${drop.accentColor}22`,
                overflow: 'hidden',
                transition: 'transform 220ms ease, box-shadow 220ms ease',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Glow top */}
              <div aria-hidden style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '80px',
                background: `linear-gradient(to bottom, ${drop.accentColor}18, transparent)`,
                pointerEvents: 'none',
              }} />

              <div style={{ padding: '28px 24px', position: 'relative' }}>
                {/* Tag */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: `${drop.accentColor}18`,
                  border: `1px solid ${drop.accentColor}30`,
                  marginBottom: '20px',
                }}>
                  <span style={{ fontSize: '12px' }}>{drop.emoji}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: drop.accentColor, letterSpacing: '1px' }}>
                    {drop.tag}
                  </span>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}>
                  {drop.brand}
                </p>

                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 800,
                  color: '#fff', letterSpacing: '-0.3px',
                  lineHeight: 1.3, margin: '0 0 24px',
                }}>
                  {drop.name}
                </h3>

                {/* Divider */}
                <div style={{
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  marginBottom: '20px',
                }} />

                {/* Countdown */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', letterSpacing: '0.5px' }}>
                      {drop.launchDate}
                    </p>
                    <p style={{
                      fontSize: '18px', fontWeight: 800,
                      color: drop.accentColor,
                      letterSpacing: '-0.5px', margin: 0,
                    }}>
                      {drop.countdown}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px', letterSpacing: '0.5px' }}>
                      Pièces
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>
                      {drop.pieces}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="drop-notify-btn"
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '14px', fontWeight: 700,
                    color: '#fff',
                    backgroundColor: `${drop.accentColor}22`,
                    border: `1px solid ${drop.accentColor}44`,
                    cursor: 'pointer',
                    transition: 'all 220ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={drop.accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  Me notifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dropPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
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
        @media (max-width: 600px) {
          .drops-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

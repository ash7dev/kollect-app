'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isVerified?: boolean;
}

interface RecentCollection {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  launchedAt?: string | null;
  launchDate?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  _count?: { products: number };
  viewCount?: number;
  daysSinceRelease?: number; // Ajout du champ manquant
}

interface RecentCard {
  collection: RecentCollection;
  daysSinceRelease?: number;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const FETCH_OPTS: RequestInit = {
  headers: { 'ngrok-skip-browser-warning': '1' },
  next: { revalidate: 60 },
};
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

/* ─── Time helpers ───────────────────────────────────────────────── */
function getDaysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

function getRelativeTime(days: number): string {
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days <= 7) return `il y a ${days} jours`;
  if (days <= 30) return `il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`;
  return `il y a ${Math.floor(days / 30)} mois${Math.floor(days / 30) > 1 ? 's' : ''}`;
}

/* ═════════════════════════════════════════════════════════════════
   RECENT DROP CARD
   Carte pour les collections sorties récemment
   ═══════════════════════════════════════════════════════════════ */
function RecentDropCard({ card }: { card: RecentCard }) {
  const { collection } = card;
  const hasVideo = !!collection.teaserVideo;
  const hasMedia = hasVideo || !!collection.coverImage;
  const pieces = collection._count?.products ?? 0;
  const daysSince = card.daysSinceRelease ?? 0;

  return (
    <Link
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      className="recent-drop-card"
      style={{
        display: 'block',
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        minHeight: '360px',
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(255,149,0,0.15)',
        backgroundColor: '#0A0A0A',
      }}
    >
      {/* Media background */}
      {hasVideo ? (
        <video
          src={collection.teaserVideo!}
          autoPlay muted loop playsInline
          style={{ 
            position: 'absolute', 
            inset: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            zIndex: 0 
          }}
        />
      ) : collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          style={{ objectFit: 'cover', zIndex: 0 }}
          sizes="(max-width: 960px) 100vw, 40vw"
          priority
        />
      ) : (
        <div style={{
          position: 'absolute', 
          inset: 0,
          background: 'linear-gradient(135deg, #0a0500 0%, #0d0800 50%, #050300 100%)',
          zIndex: 0,
        }} />
      )}

      {/* Gradient overlay */}
      <div aria-hidden style={{
        position: 'absolute', 
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1,
      }} />

      {/* Orange glow effect */}
      <div aria-hidden style={{
        position: 'absolute', 
        inset: 0,
        background: 'radial-gradient(ellipse at 70% 50%, rgba(255,149,0,0.06) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', 
        inset: 0, 
        zIndex: 2,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        padding: '20px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Brand pill */}
          <div style={{
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 12px 6px 8px', 
            borderRadius: '999px',
            backgroundColor: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {collection.brand.logo ? (
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '4px', 
                overflow: 'hidden', 
                backgroundColor: '#fff', 
                flexShrink: 0 
              }}>
                <Image src={collection.brand.logo} alt="" width={18} height={18} style={{ objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{
                width: '18px', 
                height: '18px', 
                borderRadius: '4px', 
                flexShrink: 0,
                backgroundColor: '#FF9500',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '9px', 
                fontWeight: 800, 
                color: '#fff',
              }}>
                {collection.brand.name.charAt(0)}
              </div>
            )}
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              color: 'rgba(255,255,255,0.85)', 
              letterSpacing: '0.3px' 
            }}>
              {collection.brand.name}
            </span>
            {collection.brand.isVerified && (
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: '#34C759', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}>
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div style={{
            padding: '4px 10px', 
            borderRadius: '8px',
            backgroundColor: 'rgba(255,149,0,0.18)', 
            border: '1px solid rgba(255,149,0,0.38)',
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{
              fontSize: '8px', 
              fontWeight: 800,
              color: '#FF9500', 
              letterSpacing: '1.2px', 
              textTransform: 'uppercase',
            }}>
              ⚡ NOUVEAU
            </span>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Collection name */}
          <h3 style={{
            fontSize: 'clamp(1.2rem, 2.2vw, 1.8rem)',
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}>
            {collection.name}
          </h3>

          {/* Release info */}
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '6px 10px', 
            borderRadius: '8px',
            backgroundColor: 'rgba(255,149,0,0.08)', 
            border: '1px solid rgba(255,149,0,0.18)',
          }}>
            <div style={{ 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: '#34C759', 
              boxShadow: '0 0 6px rgba(52,199,89,0.7)', 
              flexShrink: 0 
            }} />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: '#34C759' 
            }}>
              Disponible {getRelativeTime(daysSince)}
            </span>
            {pieces > 0 && (
              <span style={{ 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.25)', 
                marginLeft: 'auto' 
              }}>
                {pieces} pcs
              </span>
            )}
          </div>

          {/* Bottom CTA row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {pieces > 0 && (
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)', 
                fontWeight: 500 
              }}>
                {pieces} pièce{pieces > 1 ? 's' : ''}
              </span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <div className="recent-drop-cta" style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '8px 16px', 
                borderRadius: '8px',
                backgroundColor: '#FF9500',
                fontSize: '12px', 
                fontWeight: 800, 
                color: '#fff',
                boxShadow: '0 4px 16px rgba(255,149,0,0.35)',
                transition: 'all 250ms ease',
                letterSpacing: '0.1px',
              }}>
                Voir la collection
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .recent-drop-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 32px rgba(255,149,0,0.25) !important;
        }
        .recent-drop-card:hover .recent-drop-cta {
          transform: translateY(-1px) !important;
          filter: brightness(1.1) !important;
          box-shadow: 0 6px 24px rgba(255,149,0,0.4) !important;
        }
      `}</style>
    </Link>
  );
}

/* ═════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════ */
function RecentDropsSkeleton() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '16px' 
    }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          borderRadius: '20px', 
          backgroundColor: '#0A0A0A', 
          border: '1px solid rgba(255,149,0,0.15)', 
          minHeight: '360px',
          animation: `recentDropsSkeleton 1.6s ease-in-out ${i * 0.08}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function RecentDropsEmpty() {
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '60px 24px', 
      textAlign: 'center',
    }}>
      <div style={{
        width: '60px', 
        height: '60px', 
        borderRadius: '16px',
        background: 'rgba(255,149,0,0.08)', 
        border: '1px solid rgba(255,149,0,0.18)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '20px',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
      <h3 style={{ 
        fontSize: '1.2rem', 
        fontWeight: 800, 
        color: '#fff', 
        letterSpacing: '-0.5px', 
        margin: '0 0 10px' 
      }}>
        Aucune nouveauté
      </h3>
      <p style={{ 
        fontSize: '0.85rem', 
        color: 'rgba(255,255,255,0.38)', 
        lineHeight: 1.7, 
        maxWidth: '380px', 
        margin: '0 0 20px' 
      }}>
        Les dernières sorties apparaîtront ici dès qu&apos;elles seront disponibles.
      </p>
      <Link href="/explorer" style={{
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '10px 20px', 
        borderRadius: '10px', 
        fontSize: '13px', 
        fontWeight: 800,
        color: '#fff', 
        textDecoration: 'none',
        backgroundColor: '#FF9500', 
        boxShadow: '0 4px 16px rgba(255,149,0,0.35)',
      }}>
        Explorer les collections
      </Link>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════ */
export function RecentDrops() {
  const [collections, setCollections] = useState<RecentCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadRecentDrops() {
      try {
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        const newReleases: RecentCollection[] = Array.isArray(homeData?.newReleases) ? homeData.newReleases : [];

        // Filter collections released in the last 15 days
        const recentCollections = newReleases
          .filter((c) => {
            const ref = c.launchedAt || c.launchDate;
            if (!ref) return false;
            return Date.now() - new Date(ref).getTime() <= FIFTEEN_DAYS_MS;
          })
          .slice(0, 8) // Limit to 8 recent releases
          .map((c) => ({
            ...c,
            daysSinceRelease: getDaysSince((c.launchedAt || c.launchDate)!),
          }))
          .sort((a, b) => (a.daysSinceRelease || 0) - (b.daysSinceRelease || 0)); // Most recent first (lowest daysSince = most recent)

        setCollections(recentCollections);
      } catch (err) {
        console.error('RecentDrops fetch failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadRecentDrops();
  }, []);

  return (
    <section
      id="recent-drops"
      aria-label="Nouveautés"
      style={{
        padding: 'clamp(60px, 8vw, 100px) 24px',
        backgroundColor: '#0A0A0A', // Fond noir pour RecentDrops
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '24px 12px', // Margin pour espacer
        border: '1px solid rgba(255,149,0,0.15)', // Bordure orange
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Atmospheric bg */}
      <div aria-hidden style={{ 
        position: 'absolute', 
        top: '-60px', 
        right: '-60px', 
        width: '400px', 
        height: '400px', 
        background: 'radial-gradient(circle, rgba(255,149,0,0.04) 0%, transparent 65%)', 
        pointerEvents: 'none' 
      }} />
      <div aria-hidden style={{ 
        position: 'absolute', 
        bottom: '-40px', 
        left: '-40px', 
        width: '300px', 
        height: '300px', 
        background: 'radial-gradient(circle, rgba(255,149,0,0.03) 0%, transparent 65%)', 
        pointerEvents: 'none' 
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

        {/* ─── Section Header ─── */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          marginBottom: '40px', 
          flexWrap: 'wrap', 
          gap: '20px' 
        }}>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '14px' 
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF9500">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <p style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#FF9500', 
                letterSpacing: '2.5px', 
                textTransform: 'uppercase', 
                margin: 0 
              }}>
                Nouveautés
              </p>
            </div>
            <h2 style={{ 
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', 
              fontWeight: 900, 
              color: '#fff', 
              letterSpacing: '-1.5px', 
              lineHeight: 1.1, 
              margin: 0 
            }}>
              Les dernières sorties.{' '}
              <span style={{ color: 'rgba(255,255,255,0.28)' }}>Disponible maintenant.</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="recent-drops-see-all"
            style={{
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 18px', 
              borderRadius: '10px',
              fontSize: '13px', 
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', 
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.10)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              transition: 'all 200ms ease', 
              flexShrink: 0,
            }}
          >
            Voir tout
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ─── Content ─── */}
        {loading ? (
          <RecentDropsSkeleton />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
              Impossible de charger les nouveautés. <Link href="/collections" style={{ color: '#FF9500', textDecoration: 'none', fontWeight: 700 }}>Voir tout →</Link>
            </p>
          </div>
        ) : collections.length === 0 ? (
          <RecentDropsEmpty />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: collections.length === 1 ? '1fr' : collections.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px', // Layout horizontal en grille
          }}>
            {collections.map((collection) => (
              <RecentDropCard 
                key={collection.id} 
                card={{
                  collection,
                  daysSinceRelease: collection.daysSinceRelease,
                }} 
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes recentDropsSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .recent-drops-see-all:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.25) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </section>
  );
}

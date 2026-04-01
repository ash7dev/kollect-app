/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ─── Types ─────────────────────────────────────────────────────── */
interface RecentCollection {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  brand?: {
    name: string;
    slug?: string;
    logo?: string;
  };
  _count: {
    products: number;
  };
  status: string;
  launchDate?: string | null;
  createdAt: string;
}

/* ─── Icons ─────────────────────────────────────────────────────── */
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

/* ─── Skeleton Component ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: '20px',
      backgroundColor: '#0A0A0A',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      width: '100%',
      height: '280px',
      animation: 'recentSkeleton 1.6s ease-in-out infinite',
    }}>
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        height: '20px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        height: '40px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
      }} />
    </div>
  );
}

/* ─── Collection Card ───────────────────────────────────────────────── */
function RecentCollectionCard({ collection }: { collection: RecentCollection }) {
  const hasVideo = !!collection.teaserVideo;
  const hasImage = !!collection.coverImage;
  const isRecent = new Date(collection.createdAt).getTime() > Date.now() - 15 * 24 * 60 * 60 * 1000; // 15 jours

  return (
    <div
      className="recent-card"
      style={{
        borderRadius: '20px',
        backgroundColor: '#0A0A0A',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '280px',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        cursor: 'pointer',
      }}
    >
      {/* Badge "Nouveau" si récent */}
      {isRecent && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 10px',
          borderRadius: '999px',
          backgroundColor: '#FF3B30',
          fontSize: '10px',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          zIndex: 2,
        }}>
          Nouveau
        </div>
      )}

      {/* Media */}
      <div style={{
        position: 'relative',
        height: '160px',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}>
        {hasVideo ? (
          <video
            src={collection.teaserVideo!}
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : hasImage ? (
          <img
            src={collection.coverImage!}
            alt={collection.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1c1c1c 0%, #080808 100%)',
          }} />
        )}

        {/* Gradient overlay pour la lisibilité */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }} />
      </div>

      {/* Content */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '120px',
      }}>
        {/* Brand */}
        {collection.brand && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '8px',
              backgroundColor: '#FF3B30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: '800',
              color: '#fff',
            }}>
              {collection.brand.name.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.3px',
            }}>
              {collection.brand.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.2,
          margin: '0 0 8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {collection.name}
        </h3>

        {/* Bottom info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
          }}>
            {hasVideo && <IconPlay />}
            <span>{collection._count.products} pièce{collection._count.products > 1 ? 's' : ''}</span>
          </div>

          <Link
            href={`/brand/${collection.brand?.slug || 'unknown'}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = 'rgba(255,255,255,0.15)';
              el.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.backgroundColor = 'rgba(255,255,255,0.1)';
              el.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            Explorer
            <IconArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export function RecentReleases() {
  const [collections, setCollections] = useState<RecentCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRecentReleases() {
      try {
        // Récupérer les collections récentes (créées dans les 30 derniers jours)
        const res = await apiClient.get<RecentCollection[]>('/collections/recent?limit=6&days=15');
        let recentCollections = Array.isArray(res.data) ? res.data : [];

        // Si aucune collection récente, fallback vers les collections featured
        if (recentCollections.length === 0) {
          const featuredRes = await apiClient.get<RecentCollection[]>('/collections/featured?limit=6');
          recentCollections = Array.isArray(featuredRes.data) ? featuredRes.data : [];
        }

        setCollections(recentCollections);
      } catch (err) {
        console.error('Failed to fetch recent releases:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentReleases();
  }, []);

  return (
    <section
      id="recent-releases"
      aria-label="Sorties récentes"
      style={{
        padding: '120px 24px 96px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Header */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        marginBottom: '56px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FF9500',
              boxShadow: '0 0 10px rgba(255,149,0,0.8)',
              display: 'inline-block',
              animation: 'recentPulse 2s ease-in-out infinite',
            }} />
            <p style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FF9500',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Nouveautés
            </p>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Dernières sorties.
          </h2>
        </div>

        {collections.length > 0 && (
          <Link
            href="/collections"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              transition: 'all 200ms ease',
              flexShrink: 0,
            }}
          >
            Voir tout
            <IconArrowRight />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {loading ? (
          [0, 1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : error ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
              Impossible de charger les nouveautés.
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
              Aucune nouveauté pour le moment.
            </p>
          </div>
        ) : (
          collections.map(collection => (
            <RecentCollectionCard key={collection.id} collection={collection} />
          ))
        )}
      </div>

      <style>{`
        @keyframes recentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes recentSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .recent-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important;
        }
        @media (max-width: 960px) {
          #recent-releases .grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          #recent-releases { padding: 64px 16px 64px !important; margin: 0 6px !important; }
          #recent-releases .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

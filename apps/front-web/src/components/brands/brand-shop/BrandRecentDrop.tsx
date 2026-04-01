/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useEffect } from 'react';

export type RecentCollection = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  launchDate?: string | null;
  launchedAt?: string | null;
  createdAt?: string | null;
  brand: { slug: string; name: string };
};

function getDaysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function BrandRecentDrop({ collection }: { collection: RecentCollection }) {
  const refDate = collection.launchDate ?? collection.launchedAt ?? collection.createdAt;
  if (!refDate) return null;

  const daysAgo = getDaysAgo(refDate);
  if (daysAgo < 0 || daysAgo > 15) return null;

  return <BrandRecentDropInner collection={collection} daysAgo={daysAgo} />;
}

function BrandRecentDropInner({
  collection,
  daysAgo,
}: {
  collection: RecentCollection;
  daysAgo: number;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userUnmutedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (!entry.isIntersecting) {
          video.muted = true;
          setIsMuted(true);
        } else if (userUnmutedRef.current) {
          video.muted = false;
          setIsMuted(false);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!videoRef.current) return;
    const next = !videoRef.current.muted;
    videoRef.current.muted = next;
    userUnmutedRef.current = !next;
    setIsMuted(next);
  };

  const hasVideo = !!collection.teaserVideo;
  const hasImage = !!collection.coverImage;

  const freshLabel =
    daysAgo === 0
      ? "Sorti aujourd'hui"
      : `Sorti il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(580px, 72vw, 800px)',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        backgroundColor: '#070707',
        borderRadius: 32,
      }}
    >
      {/* Media background */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={collection.teaserVideo!}
          poster={collection.coverImage ?? undefined}
          autoPlay
          muted={isMuted}
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
            objectPosition: 'center',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, #1a0800 0%, #070707 60%, #000 100%)',
          }}
        />
      )}

      {/* Vignette radiale — centre lisible, bords sombres */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(7,7,7,0.15) 0%, rgba(7,7,7,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Fade bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(7,7,7,0.97) 0%, rgba(7,7,7,0.5) 38%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />
      {/* Fade top */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,7,7,0.55) 0%, transparent 28%)',
          pointerEvents: 'none',
        }}
      />

      {/* Mute button */}
      {hasVideo && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
          }}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}

      {/* Badge top — centré */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 4,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(255,149,0,0.15)',
            border: '1px solid rgba(255,149,0,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#FF9500',
              boxShadow: '0 0 8px rgba(255,149,0,0.9)',
              animation: 'recentDropPulse 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#FF9500',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
            }}
          >
            Disponible maintenant
          </span>
        </div>
      </div>

      {/* Contenu principal — bas de card */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          padding: 'clamp(32px, 5vw, 56px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0,
        }}
      >
        {/* Freshness label */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,149,0,0.75)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            {freshLabel}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>·</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.5px',
            }}
          >
            Pièces exclusives
          </span>
        </div>

        {/* Nom de la collection — grand, impactant */}
        <h2
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-2.5px',
            lineHeight: 0.95,
            margin: '0 0 24px',
            maxWidth: 680,
            textTransform: 'uppercase',
            textShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          {collection.name}
        </h2>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 14,
              backgroundColor: '#FF9500',
              boxShadow: '0 8px 32px rgba(255,149,0,0.35)',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(255,149,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,149,0,0.35)';
            }}
          >
            Explorer la collection
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 24px',
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.14)',
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Voir les pièces
          </a>
        </div>
      </div>

      <style>{`
        @keyframes recentDropPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,149,0,0.9); }
          50% { opacity: 0.4; box-shadow: 0 0 3px rgba(255,149,0,0.3); }
        }
      `}</style>
    </div>
  );
}

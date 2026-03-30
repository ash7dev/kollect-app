/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useEffect } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

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
    daysAgo === 0 ? "Sorti aujourd'hui" : `Sorti il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(380px, 48vw, 540px)',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
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
            background: 'linear-gradient(160deg, #1a1a1a 0%, #000 100%)',
          }}
        />
      )}

      {/* Gradient overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)',
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
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.5 12.5h-2.5" />
              <path d="M7 7l10 10" />
              <path d="M17 17l-10-10" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 72px)',
          zIndex: 2,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            backgroundColor: 'rgba(255,59,48,0.18)',
            border: '1px solid rgba(255,59,48,0.4)',
            backdropFilter: 'blur(12px)',
            width: 'fit-content',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#FF3B30',
              boxShadow: '0 0 8px rgba(255,59,48,0.8)',
              animation: 'recentDropPulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#FF3B30',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Nouvelle collection
          </span>
        </div>

        {/* Collection name */}
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-2px',
            lineHeight: 1.0,
            margin: '0 0 8px',
            maxWidth: 600,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}
        >
          {collection.name}
        </h2>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 36px',
            letterSpacing: '0.3px',
          }}
        >
          {freshLabel}
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              borderRadius: 12,
              backgroundColor: '#FF3B30',
              boxShadow: '0 8px 32px rgba(255,59,48,0.4)',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,59,48,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,59,48,0.4)';
            }}
          >
            Explorer la collection
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Voir les pièces
          </a>
        </div>
      </div>

      <style>{`
        @keyframes recentDropPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 3px rgba(255,59,48,0.3); }
        }
      `}</style>
    </div>
  );
}

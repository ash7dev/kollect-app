/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';

export type UpcomingCollection = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  launchDate?: string | null;
  brand: { slug: string; name: string };
};

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatLaunchDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function BrandUpcomingDrop({ collection }: { collection: UpcomingCollection }) {
  const [countdown, setCountdown] = useState(
    collection.launchDate ? getCountdown(collection.launchDate) : null
  );
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userUnmutedRef = useRef(false);

  useEffect(() => {
    if (!collection.launchDate) return;
    const id = setInterval(() => {
      setCountdown(getCountdown(collection.launchDate!));
    }, 1000);
    return () => clearInterval(id);
  }, [collection.launchDate]);

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

  if (!countdown) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(580px, 72vw, 800px)',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        backgroundColor: '#070707',
        marginTop: '-1px',
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
            background: 'linear-gradient(160deg, #1a0000 0%, #070707 60%, #000 100%)',
          }}
        />
      )}

      {/* Dark vignette — center stays visible, edges darken */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(7,7,7,0.2) 0%, rgba(7,7,7,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom fade for content readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(7,7,7,0.95) 0%, rgba(7,7,7,0.4) 45%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />
      {/* Top fade for badge readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,7,7,0.6) 0%, transparent 30%)',
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

      {/* Top badge — centered at top */}
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
            backgroundColor: 'rgba(255,59,48,0.15)',
            border: '1px solid rgba(255,59,48,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#FF3B30',
              boxShadow: '0 0 8px rgba(255,59,48,0.9)',
              animation: 'upcomingPulse 1.5s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#FF3B30',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
            }}
          >
            Prochainement
          </span>
        </div>
      </div>

      {/* Main content — centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          padding: '80px clamp(24px, 5vw, 64px) 48px',
          textAlign: 'center',
        }}
      >
        {/* Collection name */}
        <h2
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            margin: '0 0 6px',
            maxWidth: 560,
            textShadow: '0 2px 24px rgba(0,0,0,0.5)',
          }}
        >
          {collection.name}
        </h2>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 40px',
            letterSpacing: '0.3px',
          }}
        >
          Une nouvelle collection arrive.
        </p>

        {/* Countdown — the hero */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(8px, 2vw, 20px)',
            marginBottom: 40,
          }}
        >
          {[
            { v: countdown.days, l: 'Jours' },
            { v: countdown.hours, l: 'Heures' },
            { v: countdown.minutes, l: 'Min' },
            { v: countdown.seconds, l: 'Sec' },
          ].map(({ v, l }, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(8px, 2vw, 20px)' }}>
              {i > 0 && (
                <span
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                    fontWeight: 200,
                    color: 'rgba(255,59,48,0.4)',
                    lineHeight: 1,
                    marginTop: 4,
                    userSelect: 'none',
                  }}
                >
                  :
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Number with red glow on last digit changing */}
                <div
                  style={{
                    position: 'relative',
                    minWidth: 'clamp(56px, 8vw, 88px)',
                    padding: '10px 8px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,59,48,0.08)',
                    border: '1px solid rgba(255,59,48,0.2)',
                    backdropFilter: 'blur(8px)',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(2rem, 5.5vw, 4rem)',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-2px',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      display: 'block',
                    }}
                  >
                    {pad(v)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Launch date + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {collection.launchDate && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Lancement le{' '}
              <span style={{ color: 'rgba(255,59,48,0.8)', fontWeight: 700 }}>
                {formatLaunchDate(collection.launchDate)}
              </span>
            </p>
          )}

          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 28px',
              borderRadius: 12,
              backgroundColor: 'rgba(255,59,48,0.12)',
              border: '1.5px solid rgba(255,59,48,0.4)',
              backdropFilter: 'blur(16px)',
              fontSize: 13,
              fontWeight: 700,
              color: '#FF3B30',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              transition: 'all 220ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.22)';
              e.currentTarget.style.borderColor = 'rgba(255,59,48,0.7)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,59,48,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,59,48,0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Bell icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Voir le teaser
          </a>
        </div>
      </div>

      <style>{`
        @keyframes upcomingPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,59,48,0.9); }
          50% { opacity: 0.4; box-shadow: 0 0 3px rgba(255,59,48,0.3); }
        }
      `}</style>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

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
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'clamp(420px, 55vw, 600px)',
      overflow: 'hidden',
      fontFamily: FONT_FAMILY_INTER,
    }}>
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
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : hasImage ? (
        <img
          src={collection.coverImage!}
          alt={collection.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #1a1a1a 0%, #000 100%)',
        }} />
      )}

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Mute button */}
      {hasVideo && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 10,
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 12.5h-2.5"/><path d="M7 7l10 10"/><path d="M17 17l-10-10"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>
      )}

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 72px)',
        zIndex: 2,
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          backgroundColor: 'rgba(255,149,0,0.18)',
          border: '1px solid rgba(255,149,0,0.4)',
          backdropFilter: 'blur(12px)',
          width: 'fit-content',
          marginBottom: 20,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: '#FF9500',
            boxShadow: '0 0 8px rgba(255,149,0,0.8)',
            animation: 'upcomingPulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 800,
            color: '#FF9500', letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Prochainement
          </span>
        </div>

        {/* Collection name */}
        <h2 style={{
          fontSize: 'clamp(2rem, 5vw, 3.8rem)',
          fontWeight: 900, color: '#fff',
          letterSpacing: '-2px', lineHeight: 1.0,
          margin: '0 0 8px',
          maxWidth: 600,
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}>
          {collection.name}
        </h2>
        <p style={{
          fontSize: 14, fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 36px',
          letterSpacing: '0.3px',
        }}>
          Une nouvelle collection arrive.
        </p>

        {/* Countdown */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(12px, 2vw, 24px)', marginBottom: 36 }}>
          {[
            { v: countdown.days, l: 'Jours' },
            { v: countdown.hours, l: 'Heures' },
            { v: countdown.minutes, l: 'Min' },
            { v: countdown.seconds, l: 'Sec' },
          ].map(({ v, l }, i) => (
            <div key={l}>
              {i > 0 && (
                <span style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300,
                  color: 'rgba(255,255,255,0.2)', marginRight: 'clamp(12px, 2vw, 24px)',
                  lineHeight: 1,
                }}>:</span>
              )}
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
                  color: '#fff', letterSpacing: '-2px', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {pad(v)}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '2px', textTransform: 'uppercase',
                }}>
                  {l}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Overlay en mode teaser - bloque l'ajout au panier et crée la hype */}
        {collection.launchDate && new Date(collection.launchDate).getTime() > Date.now() && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(1px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '280px',
              padding: '0 20px',
            }}>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#FF9500',
                letterSpacing: '-2px',
                lineHeight: 1.1,
                marginBottom: '16px',
                textTransform: 'uppercase',
                textShadow: '0 4px 20px rgba(255,149,0,0.3)',
              }}>
                Bientôt Disponible
              </div>
              <p style={{
                fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                margin: 0,
                fontWeight: 500,
              }}>
                Cette collection crée l'anticipation. 
                <br />
                <span style={{ color: '#FF9500', fontWeight: 700 }}>
                  Sois le premier à la découvrir lors du lancement.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* CTA modifié en mode teaser */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {collection.launchDate && new Date(collection.launchDate).getTime() > Date.now() ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 24px',
                borderRadius: 12,
                backgroundColor: 'rgba(255,149,0,0.15)',
                border: '2px solid rgba(255,149,0,0.3)',
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                cursor: 'not-allowed',
                transition: 'all 200ms ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Lancement dans
              <br />
              <span style={{ fontSize: 11, fontWeight: 800 }}>
                {countdown ? `${countdown.days}j ${pad(countdown.hours)}h` : 'Bientôt'}
              </span>
            </div>
          ) : (
            <a
              href={`/brand/${collection.brand.slug}/${collection.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 24px',
                borderRadius: 12,
                backgroundColor: '#FF9500',
                boxShadow: '0 8px 32px rgba(255,149,0,0.4)',
                fontSize: 13,
                fontWeight: 800,
                color: '#fff',
                textDecoration: 'none',
                letterSpacing: '0.3px',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,149,0,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,149,0,0.4)';
              }}
            >
              Voir le teaser
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes upcomingPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,149,0,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 3px rgba(255,149,0,0.3); }
        }
      `}</style>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';

type ComingSoonCollectionsProps = {
  collections: PublicCollection[];
};

function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatLaunchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Card cinématique individuelle ──────────────────────────────────────────────
function TeaserCard({ collection }: { collection: PublicCollection }) {
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
  const coverSrc = mediaUrl(collection.coverImage);
  const videoSrc = mediaUrl(collection.teaserVideo);
  const logoSrc = mediaUrl(collection.brand.logo);

  return (
    <div
      className="cs-teaser-card"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 'clamp(520px, 65vw, 720px)',
        overflow: 'hidden',
        borderRadius: 28,
        backgroundColor: '#070707',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      }}
    >
      {/* Media background */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={videoSrc!}
          poster={coverSrc ?? undefined}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : coverSrc ? (
        <img
          src={coverSrc}
          alt={collection.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1a0000 0%, #070707 60%, #000 100%)' }} />
      )}

      {/* Gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(7,7,7,0.2) 0%, rgba(7,7,7,0.72) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,7,7,0.97) 0%, rgba(7,7,7,0.4) 45%, transparent 72%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,7,7,0.65) 0%, transparent 32%)', pointerEvents: 'none' }} />

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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
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
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 4 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 16px', borderRadius: 999,
          backgroundColor: 'rgba(255,59,48,0.15)',
          border: '1px solid rgba(255,59,48,0.35)',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: '#FF3B30',
            boxShadow: '0 0 8px rgba(255,59,48,0.9)',
            animation: 'csPulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#FF3B30', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            Prochainement
          </span>
        </div>
      </div>

      {/* Contenu centré */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 3,
        padding: '80px clamp(20px, 5vw, 56px) 40px',
        textAlign: 'center',
      }}>
        {/* Brand pill */}
        {(logoSrc || collection.brand.name) && (
          <a
            href={`/brand/${collection.brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 999, marginBottom: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              textDecoration: 'none',
              transition: 'background 180ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
          >
            {logoSrc && (
              <img src={logoSrc} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.2px' }}>
              {collection.brand.name}
            </span>
            {collection.brand.isVerified && (
              <span style={{ fontSize: 10, color: '#4ADE80', fontWeight: 700 }}>✓</span>
            )}
          </a>
        )}

        {/* Nom collection */}
        <h3 style={{
          fontSize: 'clamp(1.6rem, 4vw, 3rem)',
          fontWeight: 900, color: '#fff',
          letterSpacing: '-1.5px', lineHeight: 1.05,
          margin: '0 0 6px', maxWidth: 560,
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
          textTransform: 'uppercase',
        }}>
          {collection.name}
        </h3>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', margin: '0 0 36px', letterSpacing: '0.3px' }}>
          Une nouvelle collection arrive.
        </p>

        {/* Countdown */}
        {countdown && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(6px, 1.5vw, 16px)', marginBottom: 36 }}>
            {[
              { v: countdown.days, l: 'Jours' },
              { v: countdown.hours, l: 'Heures' },
              { v: countdown.minutes, l: 'Min' },
              { v: countdown.seconds, l: 'Sec' },
            ].map(({ v, l }, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(6px, 1.5vw, 16px)' }}>
                {i > 0 && (
                  <span style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 200, color: 'rgba(255,59,48,0.4)', lineHeight: 1, marginTop: 4, userSelect: 'none' }}>:</span>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    minWidth: 'clamp(48px, 7vw, 80px)',
                    padding: '8px 6px', borderRadius: 12, textAlign: 'center',
                    backgroundColor: 'rgba(255,59,48,0.08)',
                    border: '1px solid rgba(255,59,48,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <span style={{
                      fontSize: 'clamp(1.6rem, 4.5vw, 3.2rem)',
                      fontWeight: 900, color: '#fff',
                      letterSpacing: '-2px', lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums', display: 'block',
                    }}>
                      {pad(v)}
                    </span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {l}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Date + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {collection.launchDate && (
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
              Lancement le{' '}
              <span style={{ color: 'rgba(255,59,48,0.8)', fontWeight: 700 }}>
                {formatLaunchDate(collection.launchDate)}
              </span>
            </p>
          )}
          <a
            href={`/brand/${collection.brand.slug}/${collection.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 26px', borderRadius: 12,
              backgroundColor: 'rgba(255,59,48,0.12)',
              border: '1.5px solid rgba(255,59,48,0.4)',
              backdropFilter: 'blur(16px)',
              fontSize: 13, fontWeight: 700, color: '#FF3B30',
              textDecoration: 'none', letterSpacing: '0.3px',
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Voir le teaser
          </a>
        </div>
      </div>

      <style>{`
        @keyframes csPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,59,48,0.9); }
          50% { opacity: 0.4; box-shadow: 0 0 3px rgba(255,59,48,0.3); }
        }
      `}</style>
    </div>
  );
}

// ── Layouts adaptatifs ─────────────────────────────────────────────────────────
function SingleLayout({ collection }: { collection: PublicCollection }) {
  return (
    <div style={{ width: '100%' }}>
      <TeaserCard collection={collection} />
    </div>
  );
}

function DuoLayout({ collections }: { collections: PublicCollection[] }) {
  return (
    <div className="cs-duo-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {collections.map((c) => (
        <TeaserCard key={c.id} collection={c} />
      ))}
    </div>
  );
}

function CarouselLayout({ collections }: { collections: PublicCollection[] }) {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
      {collections.map((c) => (
        <div key={c.id} style={{ flex: '0 0 clamp(300px, 38vw, 520px)', scrollSnapAlign: 'start' }}>
          <TeaserCard collection={c} />
        </div>
      ))}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export function ComingSoonCollections({ collections }: ComingSoonCollectionsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    const el = document.getElementById('coming-soon-collections');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (collections.length === 0) return null;

  const count = collections.length;

  return (
    <section
      id="coming-soon-collections"
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(28px, 5vw, 44px) var(--layout-container-padding)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)', maxWidth: 720 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#FF3B30', letterSpacing: '2.8px', textTransform: 'uppercase', margin: '0 0 14px' }}>
          À venir
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 14px' }}>
          {count === 1 ? 'Une collection se prépare' : 'Des collections se préparent'}
          <br />
          <span style={{ color: 'rgba(0,0,0,0.42)' }}>dans l&apos;ombre.</span>
        </h2>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0, maxWidth: 560 }}>
          {count === 1
            ? 'Cette collection n\'est pas encore disponible. Suis le compte à rebours et sois parmi les premiers à la découvrir.'
            : 'Ces collections ne sont pas encore disponibles. Suis les comptes à rebours et sois parmi les premiers à les découvrir.'}
        </p>
      </div>

      {/* Layout adaptatif */}
      {count === 1 && <SingleLayout collection={collections[0]} />}
      {count === 2 && <DuoLayout collections={collections} />}
      {count >= 3 && <CarouselLayout collections={collections} />}
    </section>
  );
}

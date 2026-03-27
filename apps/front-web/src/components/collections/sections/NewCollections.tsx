/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';

type NewCollectionsProps = {
  collections: PublicCollection[];
};

function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function NewCard({ collection, index }: { collection: PublicCollection; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [isVideoPortrait, setIsVideoPortrait] = useState(false); // Par défaut paysage pour les vidéos
  const [isMuted, setIsMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const userUnmutedRef = useRef(false);

  const days = collection.launchedAt ? daysAgo(collection.launchedAt) : 0;
  const productCount = collection._count?.products ?? 0;

  const hasVideo = !!collection.teaserVideo;
  const hasCoverImage = !!collection.coverImage;
  const hasProductImage = !!(collection.products?.[0]?.images?.[0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!videoRef.current || !hasVideo) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (!entry.isIntersecting) {
            videoRef.current.muted = true;
            setIsMuted(true);
          } else if (userUnmutedRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [hasVideo]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      userUnmutedRef.current = !newMutedState;
      setIsMuted(newMutedState);
    }
  };

  let mediaUrl: string | null = null;
  let mediaType: 'image' | 'video' | 'placeholder' = 'placeholder';
  if (hasVideo) {
    mediaUrl = getMediaUrl(collection.teaserVideo);
    mediaType = 'video';
  } else if (hasCoverImage) {
    mediaUrl = getMediaUrl(collection.coverImage);
    mediaType = 'image';
  } else if (hasProductImage) {
    mediaUrl = getMediaUrl(collection.products?.[0]?.images?.[0]);
    mediaType = 'image';
  }

  // Si c'est une vidéo, on la force en format paysage large (comme demandé), sinon format portrait pour les images
  const isPortrait = hasVideo ? false : true;
  const cardAspect = isPortrait ? '3 / 4' : '16 / 9';

  return (
    <a
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      className="nc-card"
      style={{
        flexShrink: 0,
        width: isPortrait ? 280 : 400,
        borderRadius: 4,
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media wrapper */}
      <div style={{
        position: 'relative',
        aspectRatio: cardAspect,
        overflow: 'hidden',
        backgroundColor: '#111',
      }}>
        {mediaUrl ? (
          mediaType === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={mediaUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  setIsVideoPortrait(v.videoWidth < v.videoHeight);
                }}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transform: hovered ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
              <button
                onClick={toggleMute}
                className="nc-video-btn"
                style={{
                  position: 'absolute', bottom: 16, right: 16, zIndex: 10,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                  transition: 'background 0.2s ease',
                }}
              >
                {isMuted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <img
              src={mediaUrl}
              alt={collection.name}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          )
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #1c1c1c 0%, #0a0a0a 100%)',
          }} />
        )}

        {/* Gradient overlay — bottom scrim léger */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Coin supérieur gauche — badge NOUVEAU */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px',
            backgroundColor: '#C8FF00',
            borderRadius: 2,
          }} className="nc-badge-new">
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              backgroundColor: '#000', display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#000', fontFamily: "'DM Mono', monospace",
            }}>
              NEW
            </span>
          </div>
        </div>

        {/* Coin supérieur droit — logo brand */}
        {collection.brand.logo && (
          <div style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 2,
            padding: 6,
          }}>
            <img
              src={getMediaUrl(collection.brand.logo) ?? ''}
              alt={collection.brand.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Bas de l'image — jours */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14,
          fontSize: 10, fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Il y a {days} jour{days > 1 ? 's' : ''}
        </div>
      </div>

      {/* Footer texte */}
      <div style={{
        padding: '16px 18px 18px',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: '2.5px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            margin: '0 0 4px',
            fontFamily: "'DM Mono', monospace",
          }}>
            {collection.brand.name}
          </p>
          <h3 style={{
            fontSize: 15, fontWeight: 800,
            letterSpacing: '-0.3px',
            textTransform: 'uppercase',
            color: '#fff',
            margin: 0,
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {collection.name}
          </h3>
        </div>

        {/* Compte produits + flèche */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
          marginTop: 2,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}>
            {productCount} pcs
          </span>
          <div style={{
            width: 28, height: 28,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: hovered ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 0.3s ease, border-color 0.3s ease',
            borderColor: hovered ? 'rgba(200,255,0,0.5)' : 'rgba(255,255,255,0.12)',
          }} className="nc-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={hovered ? '#C8FF00' : 'rgba(255,255,255,0.4)'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'stroke 0.3s ease' }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

export function NewCollections({ collections }: NewCollectionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    const el = document.getElementById('new-collections');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      setCanScrollLeft(rail.scrollLeft > 10);
      setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 10);
    };
    rail.addEventListener('scroll', update, { passive: true });
    update();
    return () => rail.removeEventListener('scroll', update);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    railRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  if (collections.length === 0) return null;

  const oldestDays = collections.reduce((max, c) => {
    const d = c.launchedAt ? daysAgo(c.launchedAt) : 0;
    return Math.max(max, d);
  }, 0);
  const daysLeft = Math.max(0, 15 - oldestDays);

  return (
    <section
      id="new-collections"
      style={{
        padding: '96px 0 80px',
        backgroundColor: '#050505',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Bebas+Neue&display=swap');

        #new-collections-rail {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        #new-collections-rail::-webkit-scrollbar { display: none; }

        .nc-card {
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .nc-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 32px 64px rgba(200,255,0,0.15), 0 16px 32px rgba(0,0,0,0.4) !important;
        }
        .nc-card:hover .nc-arrow {
          transform: translateX(6px) rotate(-5deg) !important;
          border-color: #C8FF00 !important;
        }
        .nc-card:hover .nc-arrow svg {
          stroke: #C8FF00 !important;
        }

        .nc-scroll-btn {
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .nc-scroll-btn:hover:not(:disabled) {
          background: rgba(200,255,0,0.12) !important;
          border-color: rgba(200,255,0,0.5) !important;
          transform: scale(1.05);
        }
        .nc-scroll-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .nc-scroll-btn:disabled {
          opacity: 0.2 !important;
          cursor: not-allowed;
        }

        .nc-video-btn {
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .nc-video-btn:hover {
          background: rgba(200,255,0,0.2) !important;
          border-color: #C8FF00 !important;
          transform: scale(1.1);
        }

        @keyframes ncGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(200,255,0,0.3); }
          50% { box-shadow: 0 0 30px rgba(200,255,0,0.5); }
        }
        .nc-badge-new {
          animation: ncGlow 3s ease-in-out infinite;
        }

        @keyframes ncSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(32px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .nc-card {
          animation: ncSlideIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @media (max-width: 768px) {
          .nc-card:hover {
            transform: translateY(-4px) scale(1.01) !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        maxWidth: 1360,
        margin: '0 auto',
        padding: '0 48px',
        marginBottom: 40,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        <div>
          {/* Label mono */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16,
          }}>
            <div style={{
              width: 28, height: 1,
              backgroundColor: '#C8FF00',
            }} />
            <span style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: '#C8FF00',
              fontFamily: "'DM Mono', monospace",
            }}>
              Nouveautés
            </span>
          </div>

          {/* Titre principal Bebas Neue */}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
            fontWeight: 400,
            letterSpacing: '1px',
            color: '#fff',
            margin: 0,
            lineHeight: 0.9,
            position: 'relative',
            zIndex: 1,
          }}>
            Sorties<br />
            <span style={{ 
              color: '#C8FF00',
              position: 'relative',
              display: 'inline-block',
            }}>
              Récentes
              <span style={{
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #C8FF00, transparent)',
                animation: 'ncGlow 2s ease-in-out infinite',
              }} />
            </span>
          </h2>
        </div>

        {/* Droite : countdown + nav */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
          {daysLeft > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px',
              border: '1px solid rgba(200,255,0,0.25)',
              borderRadius: 2,
              backgroundColor: 'rgba(200,255,0,0.05)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#C8FF00', whiteSpace: 'nowrap',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Expire dans {daysLeft}j
              </span>
            </div>
          )}

          {/* Boutons nav */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                className="nc-scroll-btn"
                onClick={() => scroll(dir)}
                disabled={dir === 'left' ? !canScrollLeft : !canScrollRight}
                style={{
                  width: 40, height: 40,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {dir === 'left'
                    ? <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
                    : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>
                  }
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rail */}
      <div
        id="new-collections-rail"
        ref={railRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingLeft: 'max(48px, calc((100vw - 1360px) / 2 + 48px))',
          paddingRight: 48,
          paddingBottom: 4,
          scrollSnapType: 'x mandatory',
          alignItems: 'stretch',
        }}
      >
        {collections.map((collection, i) => (
          <div key={collection.id} style={{ scrollSnapAlign: 'start' }}>
            <NewCard collection={collection} index={i} />
          </div>
        ))}
      </div>

      {/* Ligne de séparation bas */}
      <div style={{
        maxWidth: 1360, margin: '56px auto 0',
        padding: '0 48px',
      }}>
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, rgba(200,255,0,0.3), rgba(255,255,255,0.05) 60%, transparent)',
        }} />
      </div>
    </section>
  );
}
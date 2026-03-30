/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type NewCollectionsProps = {
  collections: PublicCollection[];
};

function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Utiliser l'URL directe si c'est déjà une URL complète
  if (url.startsWith('http')) return url;
  // Pour les URLs relatives, utiliser l'URL de l'API
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function NewCard({ collection, index }: { collection: PublicCollection; index: number }) {
  const [isMuted, setIsMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userUnmutedRef = useRef(false);

  const days = collection.launchedAt ? daysAgo(collection.launchedAt) : 0;
  const productCount = collection._count?.products ?? 0;

  const hasVideo = !!collection.teaserVideo;
  const hasCoverImage = !!collection.coverImage;
  const hasProductImage = !!(collection.products?.[0]?.images?.[0]);

  const mediaUrl = hasVideo
    ? getMediaUrl(collection.teaserVideo)
    : hasCoverImage
    ? getMediaUrl(collection.coverImage)
    : hasProductImage
    ? getMediaUrl(collection.products?.[0]?.images?.[0])
    : null;
  const mediaType: 'video' | 'image' | 'placeholder' = hasVideo ? 'video' : mediaUrl ? 'image' : 'placeholder';

  // Hauteur fixe comme FeaturedCard pour l'impact visuel
  const cardHeight = '600px';

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), index * 60);
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
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      userUnmutedRef.current = !next;
      setIsMuted(next);
    }
  };

  return (
    <div
      className="nc-card"
      style={{
        flexShrink: 0,
        width: '100%',
        height: cardHeight, // Hauteur fixe pour la visibilité
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0A0A0A', // Fond noir pour la visibilité
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: FONT_FAMILY_INTER,
        // Shadow premium comme FeaturedCard
        boxShadow: isHovered 
          ? '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,59,48,0.3)' 
          : '0 16px 32px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={`/brand/${collection.brand.slug}/${collection.slug}`}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          position: 'relative',
          // Shadow premium comme FeaturedCard
          boxShadow: isHovered 
            ? '0 16px 24px rgba(0,0,0,0.22)' 
            : '0 16px 24px rgba(0,0,0,0.22)',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'transparent',
          borderRadius: 24,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ════ IMAGE/VIDÉO FULL-BLEED ════ */}
        {mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={mediaUrl!}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            poster={hasCoverImage ? getMediaUrl(collection.coverImage)! : undefined}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={collection.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: 1,
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '-2px',
            }}>
              {collection.brand.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* ════ GRADIENT TOP (pour lire le brand) ════ */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* ════ GRADIENT BOTTOM (pour lire le titre/CTA) ════ */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '220px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.82), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* ════ OVERLAY TOP: Brand + Nouveau badge ════ */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 18px 8px',
          zIndex: 3,
        }}>
          {/* Brand pill - Glassmorphism comme FeaturedCard */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/brand/${collection.brand.slug}`;
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              textDecoration: 'none',
              transition: 'all 200ms ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            }}
          >
            {collection.brand.logo ? (
              <img
                src={getMediaUrl(collection.brand.logo)!}
                alt={collection.brand.name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                }}>
                  {collection.brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.2px',
            }}>
              {collection.brand.name}
            </span>
          </div>

          {/* Nouveau badge amélioré */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: isHovered 
              ? 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)'
              : 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)',
            boxShadow: isHovered 
              ? '0 8px 24px rgba(255,59,48,0.6)' 
              : '0 4px 16px rgba(255,59,48,0.4)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              animation: 'newPing 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              Nouveau
            </span>
          </div>
        </div>

        {/* ════ OVERLAY BOTTOM: Contenu principal ════ */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '220px',
        }}>
          {/* Timing indicator */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: days === 0 
                ? 'rgba(52,199,89,0.15)' 
                : 'rgba(255,149,0,0.15)',
              border: days === 0 
                ? '1px solid rgba(52,199,89,0.3)' 
                : '1px solid rgba(255,149,0,0.3)',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: days === 0 ? '#34C759' : '#FF9500',
                boxShadow: days === 0 
                  ? '0 0 8px rgba(52,199,89,0.6)' 
                  : '0 0 8px rgba(255,149,0,0.6)',
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: days === 0 ? '#34C759' : '#FF9500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {days === 0 ? "Aujourd'hui" : `-${days}j`}
              </span>
            </div>
          </div>

          {/* Titre et actions */}
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 16px',
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              {collection.name}
            </h3>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.2px',
                }}>
                  {productCount} pièce{productCount > 1 ? 's' : ''}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '16px',
                background: isHovered 
                  ? 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)'
                  : 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)',
                boxShadow: isHovered 
                  ? '0 8px 24px rgba(255,59,48,0.5)' 
                  : '0 4px 16px rgba(255,59,48,0.3)',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '0.3px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>Explorer</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ════ BOUTON AUDIO (si vidéo) ════ */}
        {hasVideo && (
          <button
            onClick={toggleMute}
            style={{
              position: 'absolute',
              bottom: '140px',
              right: '18px',
              zIndex: 4,
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transform: isHovered ? 'scale(1)' : 'scale(0.9)',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 12.5h-2.5" />
                <path d="M7 7l10 10" />
                <path d="M17 17l-10-10" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 5 9 1 5 13 1 9 2 18 9 13 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        )}
      </a>
    </div>
  );
}

export function NewCollections({ collections }: NewCollectionsProps) {
  console.log('NewCollections received:', collections.length, collections);
  console.log('Collections with dates:', collections.map(c => ({
    name: c.name,
    launchedAt: c.launchedAt,
    daysAgo: c.launchedAt ? Math.floor((Date.now() - new Date(c.launchedAt).getTime()) / (1000 * 60 * 60 * 24)) : 'no date'
  })));
  
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
    railRef.current?.scrollBy({ left: dir === 'right' ? 364 : -364, behavior: 'smooth' });
  };

  if (collections.length === 0) return null;

  // Déterminer la mise en page selon le nombre de collections
  const isCenteredLayout = collections.length <= 3;
  const gridCols = isCenteredLayout ? 1 : 4;

  return (
    <section
      id="new-collections"
      style={{
        padding: isCenteredLayout ? '80px 0' : '80px 24px',
        backgroundColor: 'transparent', // Plus de fond noir
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: FONT_FAMILY_INTER,
        position: 'relative',
      }}
    >

      <style>{`
        #new-collections-rail { scrollbar-width: none; -ms-overflow-style: none; }
        #new-collections-rail::-webkit-scrollbar { display: none; }
        .nc-card:hover { 
          transform: translateY(-8px) scale(1.02) !important; 
          box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,59,48,0.3) !important; 
        }
        .nc-scroll-btn { 
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1); 
          backdrop-filter: blur(12px);
        }
        .nc-scroll-btn:hover:not(:disabled) { 
          background: rgba(255,255,255,0.12) !important; 
          border-color: rgba(255,255,255,0.25) !important;
          transform: scale(1.05);
        }
        .nc-scroll-btn:disabled { 
          opacity: 0.3 !important; 
          cursor: not-allowed;
          transform: scale(0.95);
        }
        @keyframes newPing {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(255,255,255,0.8);
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.2); 
            box-shadow: 0 0 0 4px rgba(255,255,255,0);
          }
        }
      `}</style>

      {/* Header amélioré avec fond pour lisibilité */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isCenteredLayout ? '24px' : '24px 48px',
        marginBottom: isCenteredLayout ? 32 : 40,
        backgroundColor: 'rgba(0,0,0,0.95)', // Fond noir pour lisibilité
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: isCenteredLayout ? 'center' : 'flex-end',
        justifyContent: 'space-between',
        gap: 32,
      }}>
        <div style={{ 
          textAlign: isCenteredLayout ? 'center' : 'left',
          width: isCenteredLayout ? '100%' : 'auto',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 20,
            justifyContent: isCenteredLayout ? 'center' : 'flex-start',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
              boxShadow: '0 0 20px rgba(255,149,0,0.8)',
              animation: 'newPing 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 12, fontWeight: 800,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: '#FF9500',
              textShadow: '0 2px 4px rgba(255,149,0,0.3)',
            }}>
              Nouveautés
            </span>
          </div>
          <h2 style={{
            fontSize: isCenteredLayout 
              ? 'clamp(1.8rem, 3vw, 2.4rem)' 
              : 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#fff',
            margin: 0,
            lineHeight: 1.05,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            Dernières{' '}
            <span style={{ 
              color: 'rgba(255,149,0,0.9)', // Orange plus visible
              position: 'relative',
              textShadow: '0 2px 8px rgba(255,149,0,0.4)',
            }}>
              sorties.
              <div style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #FF9500 0%, #FF3B30 100%)',
                borderRadius: 2,
                opacity: 1, // Plus visible
                boxShadow: '0 2px 8px rgba(255,149,0,0.5)',
              }} />
            </span>
          </h2>
          {!isCenteredLayout && (
            <p style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              margin: '12px 0 0',
              lineHeight: 1.5,
              fontWeight: 500,
              maxWidth: 400,
            }}>
              Découvre les collections les plus récentes, disponibles maintenant.
            </p>
          )}
        </div>

        {/* Nav arrows améliorées - seulement si pas en mode centré */}
        {!isCenteredLayout && (
          <div style={{ display: 'flex', gap: 12 }}>
            {(['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                className="nc-scroll-btn"
                onClick={() => scroll(dir)}
                disabled={dir === 'left' ? !canScrollLeft : !canScrollRight}
                style={{
                  width: 48, height: 48,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', 
                  color: 'rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {dir === 'left'
                    ? <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
                    : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>
                  }
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteneur adaptatif : centré ou grille */}
      {isCenteredLayout ? (
        // Layout centré pour 1-2-3 collections
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
        }}>
          {collections.map((collection, i) => (
            <div key={collection.id} style={{ 
              flex: collections.length === 1 ? '0 0 auto' : '0 0 calc(50% - 16px)',
              minWidth: collections.length === 1 ? 'auto' : '300px',
              maxWidth: collections.length === 1 ? '400px' : '380px',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <NewCard collection={collection} index={i} />
            </div>
          ))}
        </div>
      ) : (
        // Layout horizontal avec scroll pour 4+ collections
        <div
          id="new-collections-rail"
          ref={railRef}
          style={{
            display: 'flex',
            gap: 24,
            overflowX: 'auto',
            paddingLeft: 'max(48px, calc((100vw - 1400px) / 2 + 48px))',
            paddingRight: 48,
            paddingBottom: 16,
            scrollSnapType: 'x mandatory',
            alignItems: 'stretch',
          }}
        >
          {collections.map((collection, i) => (
            <div key={collection.id} style={{ 
              scrollSnapAlign: 'start',
              flexShrink: 0,
              width: '380px', // Largeur fixe pour les cartes en mode scroll
              maxWidth: '380px',
            }}>
              <NewCard collection={collection} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

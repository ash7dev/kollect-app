/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ─── Types ─────────────────────────────────────────────────────── */
interface FeaturedCollection {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    isVerified: boolean;
  };
  status: string;
  launchDate?: string;
  launchedAt?: string;
  coverImage?: string;
  teaserVideo?: string;
  viewCount: number;
  products?: Array<{
    id: string;
    name: string;
    images: string[];
  }>;
  _count: {
    products: number;
  };
}

/* ─── Icons ─────────────────────────────────────────────────────── */
function IconCube() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconVolumeUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="11 5 6 9 2 5 9 1 5 13 1 9 2 18 9 13 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07 0" />
    </svg>
  );
}

function IconVolumeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16.5 12.5h-2.5" />
      <path d="M7 7l10 10" />
      <path d="M17 17l-10-10" />
      <path d="M9.5 3.5L3 10" />
    </svg>
  );
}

function IconFullscreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function IconExitFullscreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  );
}

/* ─── Utilities ───────────────────────────────────────────────── */
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/* ─── Skeleton Component ───────────────────────────────────────────────── */
function FeaturedSkeleton() {
  return (
    <div style={{
      width: '100%',
      height: '480px',
      borderRadius: '24px',
      backgroundColor: '#0A0A0A',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      position: 'relative',
      animation: 'featuredSkeleton 1.6s ease-in-out infinite',
    }}>
      {/* Gradient overlays */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '140px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '220px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.82), transparent)',
      }} />

      {/* Top skeleton */}
      <div style={{
        position: 'absolute',
        top: '18px',
        left: '18px',
        right: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          width: '120px',
          height: '32px',
        }} />
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
      </div>

      {/* Bottom skeleton */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '18px',
        right: '18px',
      }}>
        <div style={{
          width: '60%',
          height: '16px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '4px',
          marginBottom: '8px',
        }} />
        <div style={{
          width: '80%',
          height: '32px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          marginBottom: '14px',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '80px',
            height: '26px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '13px',
          }} />
          <div style={{
            width: '80px',
            height: '26px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '13px',
          }} />
          <div style={{ flex: 1 }} />
          <div style={{
            width: '120px',
            height: '42px',
            backgroundColor: '#FF3B30',
            borderRadius: '11px',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Featured Card (DepthCarousel style sans carrousel) ───────────────────────────────────────────────── */
function FeaturedCard({ collection, index }: { collection: FeaturedCollection; index: number }) {
  const [isMuted, setIsMuted] = useState(true); // Autoplay videos must start muted
  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPortrait, setIsVideoPortrait] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const userUnmutedRef = useRef(false); // Track user manual intention

  // Déterminer le type de contenu
  const hasCoverImage = !!collection.coverImage;
  const hasVideo = !!collection.teaserVideo;
  const hasProductImage = !!(collection.products?.[0]?.images?.[0]);

  // Hauteur fixe pour toutes les cartes afin d'éviter l'incohérence visuelle
  const cardHeight = isFullscreen ? '100vh' : '600px'; // Hauteur uniforme de 600px

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      userUnmutedRef.current = !newMutedState; // user explicitly wanted sound if unmuted
    }
  };

  const toggleFullscreen = async () => {
    if (!hasVideo) return;

    if (!isFullscreen) {
      try {
        if (fullscreenRef.current?.requestFullscreen) {
          await fullscreenRef.current.requestFullscreen();
        } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
          await (fullscreenRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error attempting to enable fullscreen:', error);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error attempting to exit fullscreen:', error);
      }
    }
  };

  // Gérer les changements de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const newIsVisible = entry.isIntersecting;
          setIsVisible(newIsVisible);

          if (videoRef.current) {
            if (!newIsVisible) {
              // Scroll out -> always mute
              videoRef.current.muted = true;
              setIsMuted(true);
            } else {
              // Scroll in -> unmute ONLY if user manually unmuted it before
              if (userUnmutedRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px'
      }
    );

    const currentCardRef = cardRef.current;
    if (currentCardRef) {
      observer.observe(currentCardRef);
    }

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      console.log('Video metadata loaded:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        isPortrait: video.videoHeight > video.videoWidth
      });
      if (video.videoWidth && video.videoHeight) {
        setIsVideoPortrait(video.videoHeight > video.videoWidth);
      }
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    const handleCanPlay = () => {
      console.log('Video can play:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      if (video.videoWidth && video.videoHeight) {
        setIsVideoPortrait(video.videoHeight > video.videoWidth);
      }
    };

    // Ajouter tous les événements pour être sûr de capturer les métadonnées
    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    // Vérifier si les métadonnées sont déjà disponibles
    if (video.readyState >= 1) {
      console.log('Video already loaded:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      handleMetadata();
    }

    // Forcer la détection après 2 secondes si ça n'a pas fonctionné
    const timeout = setTimeout(() => {
      console.log('Forcing video detection after timeout:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      if (video.videoWidth && video.videoHeight) {
        setIsVideoPortrait(video.videoHeight > video.videoWidth);
      } else {
        // Fallback : considérer comme paysage par défaut
        console.log('Using fallback: landscape mode');
        setIsVideoPortrait(false);
      }
    }, 2000);

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      clearTimeout(timeout);
    };
  }, [collection.teaserVideo]);

  return (
    <div ref={cardRef} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // S'assurer que la carte remplit toute la hauteur disponible
      }}>
        <div ref={fullscreenRef} style={{
        display: 'block',
        width: '100%',
        height: cardHeight,
        borderRadius: isFullscreen ? '0px' : '24px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: isFullscreen ? '#000' : 'transparent',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isFullscreen ? 9999 : 'auto',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }),
      }}>
        <Link
          href={`/brand/${collection.brand.slug}/${collection.slug}`}
          className="featured-card"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            textDecoration: 'none',
            color: 'inherit',
            position: 'relative',
            // Shadow premium comme DepthCarousel
            boxShadow: isFullscreen ? 'none' : '0 16px 24px rgba(0,0,0,0.22)',
            border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'transparent',
          }}
          onClick={(e) => {
            if (isFullscreen) {
              e.preventDefault();
              toggleFullscreen();
            }
          }}
        >
          {/* ════ IMAGE/VIDÉO FULL-BLEED ════ */}
          {hasCoverImage ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden', // Cache les parties qui dépassent
            }}>
              <img
                src={collection.coverImage}
                alt={collection.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // Cover pour remplir l'espace sans coupure
                  objectPosition: 'center',
                }}
              />
            </div>
          ) : hasVideo ? (
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: isFullscreen ? 'contain' : 'cover', // contain en plein écran pour voir tout
                zIndex: 1,
              }}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              controls={isFullscreen} // Contrôles natifs en plein écran
            >
              <source src={collection.teaserVideo} type="video/mp4" />
            </video>
          ) : hasProductImage ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}>
              <img
                src={collection.products?.[0]?.images?.[0] || '/placeholder-collection.jpg'}
                alt={collection.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}>
              <img
                src="/placeholder-collection.jpg"
                alt={collection.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          )}

          {/* ════ GRADIENT TOP → pour lire le brand ════ */}
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

          {/* ════ GRADIENT BOTTOM → pour lire le titre/CTA ════ */}
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

          {/* ════ OVERLAY TOP: Brand + Share + Audio Control ════ */}
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
            {/* Brand pill - Glassmorphism comme DepthCarousel */}
            <Link
              href={`/brands/${collection.brand.slug}`}
              onClick={(e) => e.stopPropagation()}
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
                  src={collection.brand.logo}
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
                    fontWeight: '800',
                  }}>
                    {collection.brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {collection.brand.name && (
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '0.2px',
                }}>
                  {collection.brand.name}
                </span>
              )}
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#34C759',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconCheck />
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Share button placeholder - Style comme DepthCarousel */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement share functionality
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              {/* Audio Control Button - Seulement si vidéo et pas en plein écran */}
              {hasVideo && !isFullscreen && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMute();
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  {isMuted ? <IconVolumeOff /> : <IconVolumeUp />}
                </button>
              )}

              {/* Fullscreen Button - Seulement si vidéo */}
              {hasVideo && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
                </button>
              )}
            </div>
          </div>

          {/* ════ OVERLAY BOTTOM: Titre + Stats + CTA ════ */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '18px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {/* Titre de la collection */}
            <div style={{ gap: '4px' }}>
              <span style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Collection
              </span>
              <h3 style={{
                color: '#FFFFFF',
                fontSize: '26px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                lineHeight: '30px',
                margin: 0,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {collection.name}
              </h3>
            </div>

            {/* Stats inline + CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              {/* Stats pills */}
              {(collection._count?.products ?? 0) > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}>
                  <IconCube />
                  <span style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {collection._count.products} pièces
                  </span>
                </div>
              )}

              {(collection.viewCount ?? 0) > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}>
                  <IconEye />
                  <span style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {formatNumber(collection.viewCount)}
                  </span>
                </div>
              )}

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* CTA — flèche dans un cercle accent */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '22px',
                backgroundColor: '#FF3B30',
                boxShadow: '0 6px 10px rgba(255,59,48,0.5)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255,59,48,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 10px rgba(255,59,48,0.5)';
                }}
              >
                <span style={{
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.3px',
                }}>
                  Explorer
                </span>
                <IconArrowRight />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export function FeaturedCollections() {
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Utiliser la même route que le mobile
        const res = await apiClient.get('/collections/featured?limit=6');
        let featured = res.data || [];

        // Séparer les collections avec images et celles avec vidéos
        const collectionsWithImages = featured.filter((collection: any) => {
          return collection.coverImage || (collection.products && collection.products.length > 0);
        });

        const collectionsWithVideosOnly = featured.filter((collection: any) => {
          return collection.teaserVideo && !collection.coverImage && (!collection.products || collection.products.length === 0);
        });

        let finalCollections = [];

        // Logique stricte : On ne mélange JAMAIS les images et les vidéos
        if (collectionsWithImages.length >= collectionsWithVideosOnly.length && collectionsWithImages.length > 0) {
          console.log(`Using ${collectionsWithImages.length} collections with images only`);
          finalCollections = collectionsWithImages;
        } else if (collectionsWithVideosOnly.length > 0) {
          console.log(`Using ${collectionsWithVideosOnly.length} collections with videos only`);
          finalCollections = collectionsWithVideosOnly;
        } else {
          finalCollections = featured; // Fallback par défaut si vide
        }

        // La route /collections/featured retourne DÉJÀ le premier produit (grâce à take: 1 dans le backend)
        // Inutile de refaire une requête /public/:id qui gonfle artificiellement le compteur de vues !
        setCollections(finalCollections);
      } catch (err) {
        console.error('Failed to fetch featured collections:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div
        id="featured-collections"
        aria-label="Collections en vedette"
        style={{
          padding: '120px 24px 0 24px', // Supprimé le padding bas
          backgroundColor: '#FFFFFF', // Fond blanc au lieu de noir
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xxxl)',
          margin: '0 12px',
          border: '1px solid rgba(0,0,0,0.06)', // Bordure grise au lieu de blanche
          fontFamily: FONT_FAMILY_INTER,
        }}
    >
      {/* Pas de background pattern sur fond blanc */}

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header - Texte avant l'image */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '4px',
              height: '20px',
              borderRadius: '2px',
              backgroundColor: '#FF9500', // Orange
            }} />
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '-0.3px',
              color: '#666', // Gris
            }}>
              Collections en vedette
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: '#333', // Gris foncé
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            margin: 0,
          }}>
            Les créations qui{' '}
            <span style={{ color: '#FF9500' }}>
              définissent la tendance.
            </span>
          </h2>
        </div>

        {/* ════ COLLECTIONS GRID - CAROUSEL HORIZONTAL ════ */}
        <div style={{ position: 'relative' }}>
          {/* Indicateur de scroll - flèches animées */}
          {collections.length > 1 && (
            <div style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              pointerEvents: 'none',
              animation: 'scrollIndicator 2s ease-in-out infinite',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="featured-carousel" style={{
          display: 'flex',
          justifyContent: (!loading && !error && collections.length === 1) ? 'center' : 'flex-start',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '24px',
          padding: '20px 24px',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', // Cacher scrollbar sur Firefox
          msOverflowStyle: 'none', // Cacher scrollbar sur IE/Edge
        }}>
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={`skel-${i}`} className="carousel-item" style={{ flexShrink: 0, scrollSnapAlign: 'center' }}>
                <FeaturedSkeleton />
              </div>
            ))
          ) : error ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', width: '100%' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                Impossible de charger les collections en vedette
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#FF3B30',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
            </div>
          ) : collections.length === 0 ? (
            <div style={{ padding: '80px 24px', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
                Aucune collection en vedette
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                Revenez bientôt pour découvrir les nouvelles créations
              </div>
            </div>
          ) : (
            collections.map((collection, index) => (
              <div key={collection.id} className="carousel-item" style={{
                flexShrink: 0,
                scrollSnapAlign: 'center',
              }}>
                <FeaturedCard collection={collection} index={index} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ════ CSS POUR CACHER LA SCROLLBAR ════ */}
        <style jsx>{`
          .featured-carousel::-webkit-scrollbar {
            display: none; /* Cacher scrollbar sur Chrome/Safari */
          }
          .featured-carousel {
            -ms-overflow-style: none; /* IE/Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}</style>

        {/* Footer CTA */}
        {!loading && !error && collections.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Link
              href="/explorer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 220ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              Voir toutes les collections
              <IconArrowRight />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes featuredSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scrollIndicator {
          0%, 100% { transform: translateX(0) translateY(-50%); opacity: 0.7; }
          50% { transform: translateX(-5px) translateY(-50%); opacity: 1; }
        }
        .featured-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.4) !important;
        }
        .carousel-item {
          min-width: 400px;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: stretch; /* Force les cartes à avoir la même hauteur */
        }
        @media (max-width: 960px) {
          .carousel-item {
            min-width: 350px !important;
            max-width: 350px !important;
          }
        }
        @media (max-width: 600px) {
          .carousel-item {
            min-width: 85vw !important;
            max-width: 85vw !important;
          }
        }
      `}</style>
    </div>
  );
}

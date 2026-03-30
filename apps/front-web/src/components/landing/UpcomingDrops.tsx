'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
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

interface UpcomingCollection {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  launchDate?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  _count?: { products: number };
  viewCount?: number;
  daysRemaining?: number; // Ajout du champ manquant
  hoursRemaining?: number; // Ajout du champ manquant
}

interface UpcomingCard {
  collection: UpcomingCollection;
  daysRemaining?: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  secondsRemaining?: number;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const FETCH_OPTS: RequestInit = {
  headers: { 'ngrok-skip-browser-warning': '1' },
  next: { revalidate: 60 },
};

/* ─── Time helpers ───────────────────────────────────────────────── */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getDaysRemaining(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function getHoursRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 3600000));
}

/* ─── Live countdown hook ────────────────────────────────────────── */
function useLiveCountdown(targetDate?: string | null) {
  const calc = useCallback(() => {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  const [time, setTime] = useState<ReturnType<typeof calc>>(null);
  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

/* ─── Icons used in UpcomingDropCard like FeaturedCard ─── */
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

/* ═════════════════════════════════════════════════════════════════
   UPCOMING DROP CARD (Styled as FeaturedCard)
   ═══════════════════════════════════════════════════════════════════ */
function UpcomingDropCard({ card }: { card: UpcomingCard }) {
  const { collection } = card;
  const time = useLiveCountdown(collection.launchDate);
  const hasVideo = !!collection.teaserVideo;
  const hasCoverImage = !!collection.coverImage;
  const pieces = collection._count?.products ?? 0;

  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    const v = document.getElementById(`upcoming-video-${collection.id}`) as HTMLVideoElement;
    if (v) {
      v.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    const cardContainer = document.getElementById(`upcoming-card-${collection.id}`);
    if (!cardContainer) return;

    if (!isFullscreen) {
      try {
        if (cardContainer.requestFullscreen) {
          await cardContainer.requestFullscreen();
        } else if ((cardContainer as any).webkitRequestFullscreen) {
          await (cardContainer as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen error:', error);
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
        console.error('Exit fullscreen error:', error);
      }
    }
  };

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

  return (
    <div id={`upcoming-card-${collection.id}`} style={{
      display: 'block',
      width: '100%',
      height: isFullscreen ? '100vh' : '700px', // Hauteur premium proche de FeaturedCard
      borderRadius: isFullscreen ? '0px' : '24px',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: isFullscreen ? '#000' : 'transparent',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: isFullscreen ? 9999 : 'auto',
      fontFamily: FONT_FAMILY_INTER, // Police Inter
      ...(isFullscreen && {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
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
          boxShadow: isFullscreen ? 'none' : '0 16px 24px rgba(0,0,0,0.22)',
          border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#0A0A0A',
          fontFamily: FONT_FAMILY_INTER, // Police Inter
        }}
        onClick={(e) => {
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
        }}
      >
        {/* Media background */}
        {hasVideo ? (
          <video
            id={`upcoming-video-${collection.id}`}
            src={collection.teaserVideo!}
            autoPlay muted={isMuted} loop playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: isFullscreen ? 'contain' : 'cover',
              zIndex: 1
            }}
          />
        ) : hasCoverImage ? (
          <Image
            src={collection.coverImage!}
            alt={collection.name}
            fill
            style={{ objectFit: 'cover', zIndex: 1 }}
            sizes="(max-width: 960px) 100vw, 45vw"
            priority
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #150000 100%)',
            zIndex: 1,
          }} />
        )}

        {/* Gradients pour le texte */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '140px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '240px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* OVERLAY TOP: Brand Pill + Audio/Fullscreen Controls */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '18px 18px 8px',
          zIndex: 3,
        }}>
          {/* Brand pill - Glassmorphism exact FeaturedCard */}
          <Link
            href={`/brand/${collection.brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', borderRadius: '20px',
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
              <Image
                src={collection.brand.logo} alt={collection.brand.name}
                width={28} height={28}
                style={{ borderRadius: '14px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '14px',
                backgroundColor: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}>
                  {collection.brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '700', letterSpacing: '0.2px' }}>
              {collection.brand.name}
            </span>
            {collection.brand.isVerified && (
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconCheck />
              </div>
            )}
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Status badge Teaser */}
            <div style={{
              padding: '5px 10px', borderRadius: '8px',
              backgroundColor: 'rgba(255,59,48,0.95)',
              boxShadow: '0 4px 12px rgba(255,59,48,0.3)'
            }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                DROP IMMINENT
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              {/* Audio Control */}
              {hasVideo && !isFullscreen && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleMute(); }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms ease', color: '#fff'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {isMuted ? <IconVolumeOff /> : <IconVolumeUp />}
                </button>
              )}
              {/* Fullscreen Button */}
              {hasVideo && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFullscreen(); }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms ease', color: '#fff'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* OVERLAY CENTER: Titre + Countdown */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          textAlign: 'center',
        }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Collection
            </span>
            <h3 style={{
              color: '#FFFFFF', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: '900', letterSpacing: '-1px',
              lineHeight: 1.1, margin: '4px 0 0', textShadow: '0 2px 16px rgba(0,0,0,0.8)',
            }}>
              {collection.name}
            </h3>
          </div>

          {/* Countdown area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            {time ? (
              <>
                {[
                  ...(time.days > 0 ? [{ v: time.days, l: 'J' }] : []),
                  { v: time.hours, l: 'H' },
                  { v: time.minutes, l: 'M' },
                  { v: time.seconds, l: 'S' },
                ].map((u, i, arr) => (
                  <div key={u.l} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 900, color: u.l === 'S' ? '#FF3B30' : '#fff', lineHeight: 1 }}>
                      {pad(u.v)}
                    </span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                      {u.l}
                    </span>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 2px' }}>:</span>}
                  </div>
                ))}
              </>
            ) : (
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>Lancement bientôt</span>
            )}
          </div>
        </div>

        {/* OVERLAY BOTTOM: CTA Button */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '20px',
          zIndex: 3, display: 'flex', justifyContent: 'center',
        }}>
          {/* M'alerter Button */}
            <div className="upcoming-cta" style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px',
              borderRadius: '12px', backgroundColor: '#fff', color: '#000',
              fontSize: '13px', fontWeight: '800', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)', transition: 'all 200ms ease',
              flexShrink: 0
            }}>
              M&apos;alerter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
        </div>
      </Link>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   SKELETON
   ═════════════════════════════════════════════════════════════════ */
function UpcomingDropsSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          borderRadius: '24px',
          backgroundColor: '#0A0A0A',
          border: '1px solid rgba(255,59,48,0.15)',
          minHeight: '600px',
          animation: `upcomingDropsSkeleton 1.6s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═════════════════════════════════════════════════════════════════ */
function UpcomingDropsEmpty() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '20px',
        background: 'rgba(255,59,48,0.08)',
        border: '1px solid rgba(255,59,48,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: 800,
        color: '#fff',
        letterSpacing: '-0.5px',
        margin: '0 0 12px'
      }}>
        Aucun drop à venir
      </h3>
      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.38)',
        lineHeight: 1.7,
        maxWidth: '400px',
        margin: '0 0 24px'
      }}>
        Les marques préparent leurs futurs lancements. Reviens bientôt pour découvrir les prochaines collections.
      </p>
      <Link href="/explorer" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 800,
        color: '#fff',
        textDecoration: 'none',
        backgroundColor: '#FF3B30',
        boxShadow: '0 6px 24px rgba(255,59,48,0.35)',
      }}>
        Explorer les collections
      </Link>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════ */
export function UpcomingDrops() {
  const [collections, setCollections] = useState<UpcomingCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadUpcomingDrops() {
      try {
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        const comingSoon: UpcomingCollection[] = Array.isArray(homeData?.comingSoon) ? homeData.comingSoon : [];

        // Filter only future collections with launch date
        const upcomingCollections = comingSoon
          .filter((c) => c.launchDate && new Date(c.launchDate).getTime() > Date.now())
          .slice(0, 6) // Limit to 6 upcoming drops
          .map((c) => ({
            ...c,
            daysRemaining: getDaysRemaining(c.launchDate!),
            hoursRemaining: getHoursRemaining(c.launchDate!),
          }));

        setCollections(upcomingCollections);
      } catch (err) {
        console.error('UpcomingDrops fetch failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadUpcomingDrops();
  }, []);

  return (
    <section
      id="upcoming-drops"
      aria-label="Drops à venir"
      style={{
        padding: 'clamp(40px, 6vw, 80px) 24px',
        backgroundColor: 'transparent', // Pas de fond noir
        position: 'relative',
        overflow: 'visible',
        borderRadius: '0', // Pas de border-radius
        margin: '0', // Pas de margin
        border: 'none', // Pas de bordure
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

        {/* ─── Section Header ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FF3B30',
                display: 'inline-block',
                boxShadow: '0 0 10px rgba(255,59,48,0.8)',
                animation: 'upcomingDropsPulse 2s ease-in-out infinite',
              }} />
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#FF3B30', // Rouge visible sur fond transparent
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                margin: 0
              }}>
                Drops à venir
              </p>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 900,
              color: '#000', // Noir visible sur fond transparent
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              margin: 0
            }}>
              Les lancements imminents.{' '}
              <span style={{ color: 'rgba(0,0,0,0.6)' }}>Sois le premier.</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="upcoming-drops-see-all"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#000', // Noir visible
              textDecoration: 'none',
              border: '1px solid rgba(0,0,0,0.2)', // Bordure noire
              backgroundColor: 'rgba(255,255,255,0.8)', // Fond blanc visible
              transition: 'all 200ms ease',
              flexShrink: 0,
            }}
          >
            Voir tout le calendrier
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ─── Content ─── */}
        {loading ? (
          <UpcomingDropsSkeleton />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
              Impossible de charger les drops à venir. <Link href="/collections" style={{ color: '#FF3B30', textDecoration: 'none', fontWeight: 700 }}>Voir le calendrier →</Link>
            </p>
          </div>
        ) : collections.length === 0 ? (
          <UpcomingDropsEmpty />
        ) : (
          <div className={`upcoming-carousel ${collections.length < 3 ? 'centered' : ''}`} style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '24px',
            padding: '4px 4px 20px',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            marginBottom: '48px',
          }}>
            {loading ? (
              [0, 1, 2].map(i => (
                <div key={i} style={{ flexShrink: 0, width: 'clamp(300px, 40vw, 480px)', scrollSnapAlign: 'center' }}>
                  <div style={{
                    borderRadius: '24px',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid rgba(255,59,48,0.15)',
                    minHeight: '600px', // Même hauteur que FOMOSection
                    animation: `upcomingDropsSkeleton 1.6s ease-in-out ${i * 0.1}s infinite`,
                  }} />
                </div>
              ))
            ) : (
              collections.map((collection) => (
                <div key={collection.id} style={{ flexShrink: 0, width: 'clamp(300px, 40vw, 480px)', scrollSnapAlign: 'center' }}>
                  <UpcomingDropCard
                    card={{
                      collection,
                      daysRemaining: collection.daysRemaining,
                      hoursRemaining: collection.hoursRemaining,
                      minutesRemaining: 0,
                      secondsRemaining: 0,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes upcomingDropsPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
        }
        @keyframes upcomingDropsSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .upcoming-carousel::-webkit-scrollbar {
          display: none; /* Cacher scrollbar sur Chrome/Safari */
        }
        .upcoming-carousel {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
        .upcoming-carousel.centered {
          justify-content: center;
        }
        @media (max-width: 1024px) {
          .upcoming-carousel.centered {
            justify-content: flex-start;
          }
        }
        .upcoming-drops-see-all:hover {
          color: #000 !important;
          border-color: rgba(0,0,0,0.4) !important;
          background-color: rgba(255,255,255,0.9) !important;
        }
      `}</style>
    </section>
  );
}

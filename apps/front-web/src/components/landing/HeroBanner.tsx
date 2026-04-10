'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Brand {
  name: string;
  slug: string;
  logo?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  launchDate?: string | null;
  launchedAt?: string | null;
  brand?: Brand;
  status?: string;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  images: string[];
  brand?: Brand;
}

type HeroMode = 'upcoming-drop' | 'new-release' | 'showcase';

/* ─── Constants ─────────────────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const FETCH_OPTS: RequestInit = {
  headers: { 'ngrok-skip-browser-warning': '1' },
  next: { revalidate: 60 },
};
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const AVATAR_COLORS = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

function formatPriceWithCurrency(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}
function pad(n: number) {
  return String(n).padStart(2, '0');
}
function daysUntil(dateStr: string) {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}
function daysSince(dateStr: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

/* ─── Countdown hook ─────────────────────────────────────────────── */
function useCountdown(targetDate?: string | null) {
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

/* ═══════════════════════════════════════════════════════════════════
   COUNTDOWN DISPLAY
   ═══════════════════════════════════════════════════════════════════ */
function CountdownDisplay({ targetDate, compact = false }: { targetDate: string; compact?: boolean }) {
  const time = useCountdown(targetDate);
  if (!time) return null;

  const units = [
    ...(time.days > 0 ? [{ v: time.days, l: 'Jours' }] : []),
    { v: time.hours, l: 'Heures' },
    { v: time.minutes, l: 'Min' },
    { v: time.seconds, l: 'Sec' },
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {units.map((u, i) => (
          <span key={u.l} style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            {pad(u.v)}{u.l.slice(0, 1).toLowerCase()}
            {i < units.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: '4px' }}>:</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      {units.map((u, i) => (
        <div key={u.l} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              color: i === units.length - 1 ? '#FF3B30' : '#fff',
              letterSpacing: '-3px',
              lineHeight: 1,
              fontFamily: FONT_FAMILY_INTER,
            }}>
              {pad(u.v)}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '6px', fontWeight: 600 }}>
              {u.l}
            </div>
          </div>
          {i < units.length - 1 && (
            <div style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', color: 'rgba(255,255,255,0.15)', marginBottom: '22px', lineHeight: 1, fontWeight: 300 }}>
              :
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BANNER MODE — Upcoming Drop
   Full-screen visuel avec countdown
   ═══════════════════════════════════════════════════════════════════ */
function BannerUpcoming({ collection }: { collection: Collection }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = !!collection.teaserVideo;
  const days = collection.launchDate ? daysUntil(collection.launchDate) : 0;

  return (
    <section
      id="hero"
      aria-label="Prochaine collection"
      style={{
        minHeight: '100svh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_FAMILY_INTER,
        marginTop: '80px', // Marge pour éviter la collision avec la navbar
        borderBottomLeftRadius: '24px', // Border-radius en bas
        borderBottomRightRadius: '24px', // Border-radius en bas
      }}
    >
      {/* ── Média full screen ── */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={collection.teaserVideo!}
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      ) : collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          priority
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a, #1a0000)', zIndex: 0 }} />
      )}

      {/* ── Gradients overlay ── */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.5) 100%)', zIndex: 1 }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,59,48,0.07) 0%, transparent 60%)', zIndex: 1 }} />

      {/* ── Content ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: 'clamp(100px, 12vw, 160px) clamp(20px, 4vw, 48px) clamp(60px, 8vw, 100px)',
        gap: '28px',
      }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px 6px 12px', borderRadius: '999px',
            backgroundColor: 'rgba(255,59,48,0.15)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,59,48,0.35)',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#FF3B30', flexShrink: 0,
              boxShadow: '0 0 12px rgba(255,59,48,0.9)',
              animation: 'heroBannerPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF3B30', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Drop imminent · Dans {days} jour{days > 1 ? 's' : ''}
            </span>
          </div>
          {collection.brand && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px' }}>
                par {collection.brand.name}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.8rem, 6vw, 6rem)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-3px',
          lineHeight: 0.95,
          margin: 0,
          maxWidth: '900px',
          textShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}>
          {collection.name}
        </h1>

        {/* Countdown */}
        {collection.launchDate && (
          <CountdownDisplay targetDate={collection.launchDate} />
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href={collection.brand?.slug
              ? `/brand/${collection.brand.slug}/${collection.slug}`
              : `/collection/${collection.slug}`}
            className="hero-banner-btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 32px', borderRadius: '14px',
              fontSize: '15px', fontWeight: 800,
              color: '#fff', textDecoration: 'none',
              backgroundColor: '#FF3B30',
              boxShadow: '0 8px 40px rgba(255,59,48,0.45)',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.2px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            M&apos;alerter en premier
          </Link>
          <Link
            href={collection.brand?.slug
              ? `/brand/${collection.brand.slug}/${collection.slug}`
              : `/collection/${collection.slug}`}
            className="hero-banner-btn-ghost"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 26px', borderRadius: '14px',
              fontSize: '15px', fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            Voir la collection
          </Link>
        </div>

        {/* Social proof strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex' }}>
            {AVATAR_COLORS.map((color, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: color, border: '2px solid rgba(0,0,0,0.5)',
                marginLeft: i === 0 ? '0' : '-8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700, color: '#fff',
              }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>+50 000 passionnés</strong> attendent ce lancement
          </p>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        animation: 'heroBannerScrollHint 2s ease-in-out infinite',
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      <style>{`
        @keyframes heroBannerPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 12px rgba(255,59,48,0.9); }
          50% { opacity: 0.6; transform: scale(0.85); box-shadow: 0 0 4px rgba(255,59,48,0.3); }
        }
        @keyframes heroBannerScrollHint {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.7; transform: translateX(-50%) translateY(6px); }
        }
        .hero-banner-btn-primary:hover {
          transform: translateY(-3px) scale(1.01) !important;
          box-shadow: 0 16px 56px rgba(255,59,48,0.6) !important;
          background-color: #e0342a !important;
        }
        .hero-banner-btn-ghost:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.35) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }
        @media (max-width: 640px) {
          .hero-banner-btn-primary, .hero-banner-btn-ghost {
            padding: 13px 22px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BANNER MODE — New Release (≤3 days old)
   ═══════════════════════════════════════════════════════════════════ */
function BannerNewRelease({ collection }: { collection: Collection }) {
  const hasVideo = !!collection.teaserVideo;
  const daysSinceRelease = collection.launchedAt ? daysSince(collection.launchedAt) : 0;
  const piecesCount = collection._count?.products ?? 0;

  return (
    <section
      id="hero"
      aria-label="Nouvelle collection"
      style={{
        minHeight: '100svh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_FAMILY_INTER,
        marginTop: '80px', // Marge pour éviter la collision avec la navbar
        borderTopLeftRadius: '24px', // Border-radius en haut
        borderTopRightRadius: '24px', // Border-radius en haut
      }}
    >
      {/* ── Média ── */}
      {hasVideo ? (
        <video
          src={collection.teaserVideo!}
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      ) : collection.coverImage ? (
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          priority
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #080808, #0f0500)', zIndex: 0 }} />
      )}

      {/* ── Overlays ── */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,149,0,0.06) 0%, transparent 60%)', zIndex: 1 }} />

      {/* ── Content ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: 'clamp(100px, 12vw, 160px) clamp(20px, 4vw, 48px) clamp(60px, 8vw, 100px)',
        gap: '24px',
      }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px 6px 12px', borderRadius: '999px',
            backgroundColor: 'rgba(255,149,0,0.15)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,149,0,0.35)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF9500">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF9500', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Nouveau · Sorti {daysSinceRelease === 0 ? "aujourd'hui" : `il y a ${daysSinceRelease} jour${daysSinceRelease > 1 ? 's' : ''}`}
            </span>
          </div>
          {piecesCount > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                {piecesCount} pièce{piecesCount > 1 ? 's' : ''} disponible{piecesCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Brand */}
        {collection.brand && (
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {collection.brand.name}
          </p>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.8rem, 6vw, 6rem)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-3px',
          lineHeight: 0.95,
          margin: 0,
          maxWidth: '900px',
          textShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}>
          {collection.name}
        </h1>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href={collection.brand?.slug
              ? `/brand/${collection.brand.slug}/${collection.slug}`
              : `/collection/${collection.slug}`}
            className="hero-banner-btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 32px', borderRadius: '14px',
              fontSize: '15px', fontWeight: 800,
              color: '#fff', textDecoration: 'none',
              backgroundColor: '#FF9500',
              boxShadow: '0 8px 40px rgba(255,149,0,0.4)',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Voir la collection
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/explorer"
            className="hero-banner-btn-ghost"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '15px 26px', borderRadius: '14px',
              fontSize: '15px', fontWeight: 600,
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Explorer tout
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        animation: 'heroBannerScrollHint 2s ease-in-out infinite',
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      <style>{`
        @keyframes heroBannerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes heroBannerScrollHint {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.7; transform: translateX(-50%) translateY(6px); }
        }
        .hero-banner-btn-primary:hover {
          transform: translateY(-3px) scale(1.01) !important;
          box-shadow: 0 16px 56px rgba(255,149,0,0.55) !important;
          filter: brightness(1.05) !important;
        }
        .hero-banner-btn-ghost:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.35) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE MODE — Fallback quand aucun événement
   ═══════════════════════════════════════════════════════════════════ */
function ShowcaseFallback({ products }: { products: Product[] }) {
  return (
    <section
      id="hero"
      aria-label="Kollect — Plateforme streetwear sénégalais"
      style={{
        minHeight: '100svh',
        backgroundColor: '#070707',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
        marginTop: '80px', // Marge pour éviter la collision avec la navbar
        borderTopLeftRadius: '24px', // Border-radius en haut
        borderTopRightRadius: '24px', // Border-radius en haut
      }}
    >
      {/* BG Glows */}
      <div aria-hidden style={{ position: 'absolute', top: '-15%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(255,59,48,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(255,149,0,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, #070707, transparent)', pointerEvents: 'none', zIndex: 2 }} />

      <div className="hero-banner-inner" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: 'clamp(120px, 14vw, 160px) clamp(20px, 3vw, 40px) 80px',
        gap: '64px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* LEFT: Copy */}
        <div className="showcase-left" style={{ flex: '0 0 auto', width: 'min(500px, 48%)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '6px 16px 6px 10px', borderRadius: '999px', width: 'fit-content',
            border: '1px solid rgba(255,59,48,0.28)', backgroundColor: 'rgba(255,59,48,0.07)',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#FF3B30', flexShrink: 0,
              boxShadow: '0 0 10px rgba(255,59,48,0.9)',
              animation: 'heroBannerPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF3B30', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Plateforme N°1 du streetwear sénégalais
            </span>
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: 'clamp(2.6rem, 4.2vw, 4.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.02, letterSpacing: '-3px', margin: 0 }}>
            Avant{' '}
            <em style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 50%, #FF9500 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>la Hype,</em>
            <br />avant tout le monde
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.44)', lineHeight: 1.75, maxWidth: '430px', margin: 0 }}>
            Découvre les drops exclusifs de créateurs sénégalais vérifiés. Sois le premier à porter les pièces qui définissent le style local.
          </p>

          {/* Value props */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Drops en avant-première', 'Lance ta marque en 48h'].map((v) => (
              <div key={v} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.48)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/explorer" className="hero-banner-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                boxShadow: '0 8px 32px rgba(255,59,48,0.4)', transition: 'all 220ms ease',
              }}>
                Découvrir les drops
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/collections" className="hero-banner-btn-ghost" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 22px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
                transition: 'all 220ms ease',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                Explorer
              </Link>
            </div>
            <Link href="/become-seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', width: 'fit-content' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Tu es créateur ?</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF9500' }}>Lance ta boutique →</span>
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex' }}>
              {AVATAR_COLORS.map((color, i) => (
                <div key={i} style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: color, border: '2px solid #070707',
                  marginLeft: i === 0 ? '0' : '-9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#fff',
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Rejoint par{' '}
              <strong style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>+50 000 passionnés</strong>
            </p>
          </div>
        </div>

        {/* RIGHT: Products visual */}
        <div className="showcase-right" style={{ flex: 1, position: 'relative', minHeight: '540px' }}>
          <div aria-hidden style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(ellipse at 55% 45%, rgba(255,59,48,0.10) 0%, transparent 65%)', filter: 'blur(8px)', pointerEvents: 'none' }} />
          {products[0] && (
            <div style={{ position: 'absolute', top: '70px', right: '0', left: '110px', zIndex: 2, animation: 'heroFloat 4.5s ease-in-out infinite 0.4s' }}>
              <div style={{ borderRadius: '24px', background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', overflow: 'hidden' }}>
                {products[0].images?.[0] && (
                  <div style={{ position: 'relative', height: '200px', backgroundColor: '#f0f0f0' }}>
                    <Image src={products[0].images[0]} alt={products[0].name} fill style={{ objectFit: 'cover' }} sizes="300px" />
                  </div>
                )}
                <div style={{ padding: '16px 20px 18px' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(0,0,0,0.35)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>En ce moment</p>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#0a0a0a', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.4px' }}>{products[0].name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {products[0].brand && <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>{products[0].brand.name}</span>}
                      {products[0].originalPrice && (
                        <span style={{ fontSize: '10px', color: 'rgba(0,0,0,0.3)', textDecoration: 'line-through', fontWeight: 500 }}>
                          {formatPriceWithCurrency(products[0].originalPrice)}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: products[0].originalPrice ? '#FF3B30' : '#0a0a0a', padding: '3px 8px', borderRadius: '7px', backgroundColor: 'rgba(0,0,0,0.05)' }}>{formatPrice(products[0].price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {products[1] && (
            <div style={{ position: 'absolute', bottom: '30px', left: '0', width: '230px', zIndex: 5, animation: 'heroFloat 3.8s ease-in-out infinite 0.9s' }}>
              <div style={{ borderRadius: '18px', background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {products[1].images?.[0] && (
                    <div style={{ position: 'relative', width: '72px', height: '80px', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                      <Image src={products[1].images[0]} alt={products[1].name} fill style={{ objectFit: 'cover' }} sizes="72px" />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                    <p style={{ fontSize: '9px', color: 'rgba(0,0,0,0.3)', margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>La communauté porte</p>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#111', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{products[1].name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {products[1].originalPrice && (
                        <span style={{ fontSize: '9px', color: 'rgba(0,0,0,0.3)', textDecoration: 'line-through', fontWeight: 500 }}>
                          {formatPriceWithCurrency(products[1].originalPrice)}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', fontWeight: 900, color: products[1].originalPrice ? '#FF3B30' : '#FF3B30' }}>{formatPrice(products[1].price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes heroBannerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .hero-banner-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(255,59,48,0.55) !important;
          background-color: #e0342a !important;
        }
        .hero-banner-btn-ghost:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.2) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 1000px) {
          .showcase-right { display: none !important; }
          .showcase-left { width: 100% !important; }
        }
        @media (max-width: 640px) {
          .hero-banner-inner { padding-top: 72px !important; padding-bottom: 56px !important; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SKELETON — Loading state
   ═══════════════════════════════════════════════════════════════════ */
function HeroBannerSkeleton() {
  return (
    <section style={{ minHeight: '100svh', backgroundColor: '#070707', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a, #0f0505)', animation: 'heroBannerSkeletonPulse 2s ease-in-out infinite' }} />
      <div style={{ position: 'relative', maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px) clamp(60px, 8vw, 100px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '32px', width: '220px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: 'clamp(56px, 8vw, 96px)', width: 'min(600px, 80%)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: 'clamp(40px, 5vw, 60px)', width: 'min(380px, 60%)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <div style={{ height: '52px', width: '180px', borderRadius: '14px', backgroundColor: 'rgba(255,59,48,0.12)' }} />
          <div style={{ height: '52px', width: '140px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <style>{`
        @keyframes heroBannerSkeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export function HeroBanner() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [upcomingDrop, setUpcomingDrop] = useState<Collection | null>(null);
  const [newRelease, setNewRelease] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [comingSoonRes, newReleasesRes, productsRes] = await Promise.allSettled([
          fetch(`${API}/collections/coming-soon?limit=1`, FETCH_OPTS).then(r => r.json()),
          fetch(`${API}/collections/new?limit=1`, FETCH_OPTS).then(r => r.json()),
          fetch(`${API}/produits/popular?limit=2&days=30`, FETCH_OPTS).then(r => r.json()),
        ]);

        // 1. Upcoming drop (teaser, future launch date)
        const comingSoon = comingSoonRes.status === 'fulfilled' && Array.isArray(comingSoonRes.value)
          ? comingSoonRes.value
          : [];
        const upcoming = comingSoon.find((c: Collection) => c.launchDate && new Date(c.launchDate).getTime() > Date.now()) ?? null;

        // 2. New Release (launched within 3 days)
        const newReleases = newReleasesRes.status === 'fulfilled' && Array.isArray(newReleasesRes.value)
          ? newReleasesRes.value
          : [];
        const recentRelease = newReleases.find((c: Collection) => {
          const ref = c.launchedAt || c.launchDate;
          if (!ref) return false;
          return (Date.now() - new Date(ref).getTime()) <= THREE_DAYS_MS;
        }) ?? null;

        // 3. Products for showcase fallback
        const prods = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)
          ? productsRes.value
          : [];

        // Priority: upcoming drop > new release (3 days) > showcase
        if (upcoming) {
          setUpcomingDrop(upcoming);
          setMode('upcoming-drop');
        } else if (recentRelease) {
          setNewRelease(recentRelease);
          setMode('new-release');
        } else {
          setProducts(prods.length > 0 ? prods : [
            { id: 'fb-1', name: 'Collection Street Dakar', price: 25000, images: [], brand: { name: 'Kollect Original', slug: 'kollect' } },
          ]);
          setMode('showcase');
        }
      } catch (err) {
        console.error('HeroBanner fetch failed:', err);
        setProducts([{ id: 'err-1', name: 'Découvre les créations locales', price: 15000, images: [], brand: { name: 'Marques sénégalaises', slug: 'local' } }]);
        setMode('showcase');
      }
    }
    load();
  }, []);

  if (!mode) return <HeroBannerSkeleton />;
  if (mode === 'upcoming-drop' && upcomingDrop) return <BannerUpcoming collection={upcomingDrop} />;
  if (mode === 'new-release' && newRelease) return <BannerNewRelease collection={newRelease} />;
  return <ShowcaseFallback products={products} />;
}

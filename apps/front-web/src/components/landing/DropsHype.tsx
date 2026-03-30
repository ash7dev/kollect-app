'use client';

import { useCallback, useEffect, useState } from 'react';
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

interface HypeCollection {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  status: string;
  launchDate?: string | null;
  launchedAt?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  _count?: { products: number };
  viewCount?: number;
}

type CardType = 'upcoming' | 'new';

interface HypeCard {
  collection: HypeCollection;
  type: CardType;
  daysRemaining?: number;   // pour upcoming
  daysSinceRelease?: number; // pour new
}

/* ─── Constants ─────────────────────────────────────────────────── */
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

/* ─── Time helpers ───────────────────────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, '0'); }

function getDaysRemaining(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}
function getHoursRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 3600000));
}
function getDaysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}
function formatCountdownShort(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Disponible';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}j ${pad(h)}h`;
  if (h > 0) return `${pad(h)}h ${pad(m)}min`;
  return `${pad(m)}min`;
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

/* ═══════════════════════════════════════════════════════════════════
   HERO CARD — Grande carte principale (première de la grille)
   ═══════════════════════════════════════════════════════════════════ */
function HeroHypeCard({ card }: { card: HypeCard }) {
  const { collection, type } = card;
  const time = useLiveCountdown(type === 'upcoming' ? collection.launchDate : null);
  const hasVideo = !!collection.teaserVideo;
  const hasMedia = hasVideo || !!collection.coverImage;
  const pieces = collection._count?.products ?? 0;

  return (
    <Link
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      className="drops-hero-card"
      style={{
        gridColumn: '1 / 3',
        gridRow: '1 / 3',
        display: 'block',
        position: 'relative',
        borderRadius: '28px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        minHeight: '480px',
        transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Media background */}
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
          style={{ objectFit: 'cover', zIndex: 0 }}
          sizes="(max-width: 960px) 100vw, 55vw"
          priority
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: type === 'upcoming'
            ? 'linear-gradient(135deg, #1a0000 0%, #0a0505 50%, #100000 100%)'
            : 'linear-gradient(135deg, #0a0500 0%, #0d0800 50%, #050300 100%)',
          zIndex: 0,
        }} />
      )}

      {/* Gradient overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)',
        zIndex: 1,
      }} />
      {/* Subtle red/orange grain glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: type === 'upcoming'
          ? 'radial-gradient(ellipse at 80% 80%, rgba(255,59,48,0.08) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 80% 80%, rgba(255,149,0,0.07) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '28px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Brand pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '7px 16px 7px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {collection.brand.logo ? (
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0 }}>
                <img src={collection.brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                backgroundColor: type === 'upcoming' ? '#FF3B30' : '#FF9500',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, color: '#fff',
              }}>
                {collection.brand.name.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
              {collection.brand.name}
            </span>
            {collection.brand.isVerified && (
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div style={{
            padding: '6px 14px', borderRadius: '10px',
            backgroundColor: type === 'upcoming' ? 'rgba(255,59,48,0.18)' : 'rgba(255,149,0,0.18)',
            border: `1px solid ${type === 'upcoming' ? 'rgba(255,59,48,0.38)' : 'rgba(255,149,0,0.38)'}`,
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 800,
              color: type === 'upcoming' ? '#FF3B30' : '#FF9500',
              letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
              {type === 'upcoming' ? '● DROP IMMINENT' : '⚡ NOUVEAU'}
            </span>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Collection name */}
          <h3 style={{
            fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}>
            {collection.name}
          </h3>

          {/* Countdown or "New" info */}
          {type === 'upcoming' && time && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              {[
                ...(time.days > 0 ? [{ v: time.days, l: 'J' }] : []),
                { v: time.hours, l: 'H' },
                { v: time.minutes, l: 'M' },
                { v: time.seconds, l: 'S' },
              ].map((u, i, arr) => (
                <div key={u.l} style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: u.l === 'S' ? '#FF3B30' : '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
                      {pad(u.v)}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', fontWeight: 600 }}>
                      {u.l === 'J' ? 'Jours' : u.l === 'H' ? 'Heures' : u.l === 'M' ? 'Min' : 'Sec'}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', color: 'rgba(255,255,255,0.12)', marginBottom: '20px', lineHeight: 1 }}>:</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {type === 'new' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {card.daysSinceRelease !== undefined && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.25)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF9500">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF9500' }}>
                    {card.daysSinceRelease === 0 ? "Sorti aujourd'hui" : `Sorti il y a ${card.daysSinceRelease}j`}
                  </span>
                </div>
              )}
              {pieces > 0 && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  {pieces} pièce{pieces > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Bottom CTA row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {pieces > 0 && type === 'upcoming' && (
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                {pieces} pièce{pieces > 1 ? 's' : ''} en préparation
              </span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <div className="drops-hero-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                backgroundColor: type === 'upcoming' ? '#FF3B30' : '#FF9500',
                fontSize: '14px', fontWeight: 800, color: '#fff',
                boxShadow: type === 'upcoming' ? '0 8px 32px rgba(255,59,48,0.4)' : '0 8px 32px rgba(255,149,0,0.35)',
                transition: 'all 250ms ease',
                letterSpacing: '0.2px',
              }}>
                {type === 'upcoming' ? 'M\'alerter' : 'Voir la collection'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STANDARD CARD — Carte secondaire
   ═══════════════════════════════════════════════════════════════════ */
function StandardHypeCard({ card, index }: { card: HypeCard; index: number }) {
  const { collection, type } = card;
  const hasMedia = !!collection.coverImage || !!collection.teaserVideo;
  const pieces = collection._count?.products ?? 0;
  const accentColor = type === 'upcoming' ? '#FF3B30' : '#FF9500';

  return (
    <Link
      href={`/brand/${collection.brand.slug}/${collection.slug}`}
      className="drops-std-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        backgroundColor: '#0A0A0A',
        border: `1px solid ${accentColor}18`,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}
    >
      {/* Top glow */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: `linear-gradient(to bottom, ${accentColor}10, transparent)`, pointerEvents: 'none' }} />

      {/* Media thumbnail */}
      <div style={{ position: 'relative', height: '160px', backgroundColor: '#111', flexShrink: 0, overflow: 'hidden' }}>
        {collection.teaserVideo ? (
          <video
            src={collection.teaserVideo}
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : collection.coverImage ? (
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            style={{ objectFit: 'cover', transition: 'transform 400ms ease' }}
            sizes="(max-width: 960px) 50vw, 25vw"
            className="drops-card-img"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(0,0,0,0.8) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '40px', fontWeight: 900, color: `${accentColor}25`, letterSpacing: '-2px', fontFamily: FONT_FAMILY_INTER }}>
              {collection.brand.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient on thumbnail */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 60%)' }} />
        {/* Status pill */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          padding: '4px 10px', borderRadius: '8px',
          backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40`,
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: accentColor, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            {type === 'upcoming' ? '● À VENIR' : '⚡ NOUVEAU'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {collection.brand.logo ? (
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0 }}>
              <img src={collection.brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{
              width: '18px', height: '18px', borderRadius: '4px',
              backgroundColor: accentColor + '22', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 800, color: accentColor,
            }}>
              {collection.brand.name.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {collection.brand.name}
          </span>
          {collection.brand.isVerified && (
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Name */}
        <h4 style={{
          fontSize: '15px', fontWeight: 800,
          color: '#fff', margin: 0,
          letterSpacing: '-0.4px', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
        }}>
          {collection.name}
        </h4>

        {/* Time info */}
        <div style={{ marginTop: 'auto' }}>
          {type === 'upcoming' && collection.launchDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '10px',
              backgroundColor: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF3B30' }}>
                {formatCountdownShort(collection.launchDate)}
              </span>
              {pieces > 0 && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{pieces} pcs</span>
              )}
            </div>
          )}
          {type === 'new' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '10px',
              backgroundColor: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.18)',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34C759', boxShadow: '0 0 8px rgba(52,199,89,0.7)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#34C759' }}>Disponible maintenant</span>
              {pieces > 0 && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{pieces} pcs</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════════ */
function DropsHypeSkeleton() {
  return (
    <div className="drops-hype-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'auto auto', gap: '16px' }}>
      {/* Hero skeleton */}
      <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', borderRadius: '28px', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', minHeight: '480px', animation: 'dropsHypeSkeleton 1.6s ease-in-out infinite' }} />
      {/* Standard card skeletons */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          borderRadius: '20px', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', height: '232px',
          animation: `dropsHypeSkeleton 1.6s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════ */
function DropsHypeEmpty() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '80px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 12px' }}>
        Prochains lancements au calendrier
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, maxWidth: '400px', margin: '0 0 28px' }}>
        Les marques préparent leurs éditions. Sois notifié dès qu&apos;une fenêtre de vente s&apos;ouvre.
      </p>
      <Link href="/explorer" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '13px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
        color: '#fff', textDecoration: 'none',
        backgroundColor: '#FF3B30', boxShadow: '0 8px 32px rgba(255,59,48,0.35)',
      }}>
        Explorer les collections
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export function DropsHype() {
  const [cards, setCards] = useState<HypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/collections/home');
        const homeData = res.data;

        const comingSoon: HypeCollection[] = Array.isArray(homeData?.comingSoon) ? homeData.comingSoon : [];
        const newReleases: HypeCollection[] = Array.isArray(homeData?.newReleases) ? homeData.newReleases : [];

        const upcomingCards: HypeCard[] = comingSoon
          .filter((c) => c.launchDate && new Date(c.launchDate).getTime() > Date.now())
          .slice(0, 3)
          .map((c) => ({
            collection: c,
            type: 'upcoming' as CardType,
            daysRemaining: getDaysRemaining(c.launchDate!),
          }));

        const newCards: HypeCard[] = newReleases
          .filter((c) => {
            const ref = c.launchedAt || c.launchDate;
            if (!ref) return false;
            return Date.now() - new Date(ref).getTime() <= FIFTEEN_DAYS_MS;
          })
          .slice(0, 3)
          .map((c) => ({
            collection: c,
            type: 'new' as CardType,
            daysSinceRelease: getDaysSince((c.launchedAt || c.launchDate)!),
          }));

        // Combine: prioritize upcoming, fill with new. Max 5 total for layout.
        // Hero = first card. Grid takes up to 5 cards total.
        const combined: HypeCard[] = [];

        // Interleave for visual variety: upcoming first, then new
        const allUpcoming = [...upcomingCards];
        const allNew = [...newCards];

        while (combined.length < 5 && (allUpcoming.length > 0 || allNew.length > 0)) {
          if (allUpcoming.length > 0) combined.push(allUpcoming.shift()!);
          if (combined.length < 5 && allNew.length > 0) combined.push(allNew.shift()!);
        }

        setCards(combined);
      } catch (err) {
        console.error('DropsHype fetch failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const heroCard = cards[0];
  const otherCards = cards.slice(1, 5);

  return (
    <section
      id="drops-hype"
      aria-label="Drops à venir et nouveautés"
      style={{
        padding: 'clamp(80px, 10vw, 120px) 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Atmospheric bg */}
      <div aria-hidden style={{ position: 'absolute', top: '-100px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,59,48,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,149,0,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>

        {/* ─── Section Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '44px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#FF3B30', display: 'inline-block',
                boxShadow: '0 0 10px rgba(255,59,48,0.8)',
                animation: 'dropsHypePulse 1.5s ease-in-out infinite',
              }} />
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#FF3B30', letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0 }}>
                Agenda des maisons
              </p>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0 }}>
              Les lancements qui comptent.{' '}
              <span style={{ color: 'rgba(255,255,255,0.28)' }}>Avant tout le monde.</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="drops-hype-see-all"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.10)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              transition: 'all 200ms ease', flexShrink: 0,
            }}
          >
            Voir tout le calendrier
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ─── Content ─── */}
        {loading ? (
          <DropsHypeSkeleton />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
              Impossible de charger les drops. <Link href="/collections" style={{ color: '#FF3B30', textDecoration: 'none', fontWeight: 700 }}>Voir le calendrier →</Link>
            </p>
          </div>
        ) : cards.length === 0 ? (
          <DropsHypeEmpty />
        ) : (
          <div className="drops-hype-grid" style={{
            display: 'grid',
            gridTemplateColumns: otherCards.length === 0 ? '1fr' : 'repeat(4, 1fr)',
            gridTemplateRows: 'auto auto',
            gap: '16px',
          }}>
            {heroCard && <HeroHypeCard card={heroCard} />}
            {otherCards.map((card, i) => (
              <StandardHypeCard key={card.collection.id} card={card} index={i} />
            ))}
          </div>
        )}

        {/* ─── Legend strip ─── */}
        {cards.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '24px',
            marginTop: '28px', paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                <span style={{ fontSize: '9px', color: '#FF3B30', fontWeight: 800 }}>●</span>
                Drop imminent — ouverture à venir
              </span>
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                <span style={{ fontSize: '9px', color: '#FF9500', fontWeight: 800 }}>⚡</span>
                Nouveau — sorti dans les 3 derniers jours
              </span>
            </div>
            <Link href="/create-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', textDecoration: 'none', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', transition: 'color 200ms ease' }} className="drops-hype-creator-hint">
              Tu es créateur ?{' '}
              <span style={{ color: '#C9A962', fontWeight: 700 }}>Planifier un lancement →</span>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropsHypePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,59,48,0.8); }
          50% { opacity: 0.5; box-shadow: 0 0 4px rgba(255,59,48,0.3); }
        }
        @keyframes dropsHypeSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .drops-hero-card:hover {
          transform: scale(1.01) !important;
        }
        .drops-hero-card:hover .drops-hero-cta {
          transform: translateY(-2px) !important;
          filter: brightness(1.1) !important;
        }
        .drops-std-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.7) !important;
          border-color: rgba(255,59,48,0.25) !important;
        }
        .drops-std-card:hover .drops-card-img {
          transform: scale(1.04) !important;
        }
        .drops-hype-see-all:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.22) !important;
          background-color: rgba(255,255,255,0.07) !important;
        }
        .drops-hype-creator-hint:hover span:last-child {
          color: #e8c274 !important;
        }
        @media (max-width: 1100px) {
          .drops-hype-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .drops-hero-card {
            grid-column: 1 / 4 !important;
            grid-row: 1 !important;
            min-height: 380px !important;
          }
        }
        @media (max-width: 720px) {
          .drops-hype-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .drops-hero-card {
            grid-column: 1 / 3 !important;
            grid-row: 1 !important;
            min-height: 340px !important;
          }
        }
        @media (max-width: 480px) {
          .drops-hype-grid {
            grid-template-columns: 1fr !important;
          }
          .drops-hero-card {
            grid-column: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}

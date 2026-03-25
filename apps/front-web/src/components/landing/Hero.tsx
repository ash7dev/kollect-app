'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Brand { name: string; slug: string; logo?: string }

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand?: Brand;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  launchDate?: string | null;
  brand?: Brand;
}

type HeroMode = 'video-drop' | 'image-drop' | 'showcase';

/* ─── Icons ─────────────────────────────────────────────────────── */
const IconArrowRight = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconPlay = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
);
const IconCheck = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconBell = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

/* ─── Constantes ─────────────────────────────────────────────────── */
const STATS = [
  { value: '500+', label: 'Créateurs actifs' },
  { value: '10k+', label: 'Produits en ligne' },
  { value: '50k+', label: 'Clients satisfaits' },
  { value: '100%', label: 'Made in Sénégal' },
];
const AVATAR_COLORS = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const FETCH_OPTS: RequestInit = { headers: { 'ngrok-skip-browser-warning': '1' }, next: { revalidate: 60 } };

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

function daysUntil(date: string) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
}

function pad(n: number) { return String(n).padStart(2, '0'); }

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
   SKELETON
   ═══════════════════════════════════════════════════════════════════ */
function Skeleton({ h, w, radius = 16 }: { h: number; w?: string | number; radius?: number }) {
  return (
    <div style={{
      height: h, width: w ?? '100%', borderRadius: radius,
      background: 'rgba(255,255,255,0.05)',
      animation: 'skeletonPulse 1.6s ease-in-out infinite',
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DROP CARD (Type A — vidéo / Type B — image)
   ═══════════════════════════════════════════════════════════════════ */
function DropCard({ drop }: { drop: Collection }) {
  const time = useCountdown(drop.launchDate);
  const hasVideo = !!drop.teaserVideo;

  return (
    <div style={{
      borderRadius: '26px',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      aspectRatio: '3/4',
      boxShadow: '0 40px 100px rgba(0,0,0,0.75)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>

      {/* ── Média ── */}
      {hasVideo ? (
        <video
          src={drop.teaserVideo!}
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : drop.coverImage ? (
        <Image
          src={drop.coverImage}
          alt={drop.name}
          fill
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1c1c1c 0%, #080808 100%)' }} />
      )}

      {/* ── Gradient overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.05) 100%)',
      }} />

      {/* ── Top pills ── */}
      <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {drop.brand && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px', borderRadius: '999px',
            backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#FF3B30', display: 'inline-block',
              boxShadow: '0 0 8px rgba(255,59,48,0.9)',
              animation: 'heroPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.4px' }}>
              {drop.brand.name}
            </span>
          </div>
        )}
        {hasVideo && (
          <div style={{
            padding: '5px 11px', borderRadius: '8px',
            backgroundColor: 'rgba(255,59,48,0.18)', border: '1px solid rgba(255,59,48,0.38)',
            fontSize: '10px', fontWeight: 800, color: '#FF3B30', letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Teaser
          </div>
        )}
      </div>

      {/* ── Bottom info ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 22px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 600 }}>
          Prochainement
        </p>
        <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          {drop.name}
        </p>

        {/* Countdown */}
        {time && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {time.days > 0 && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{pad(time.days)}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>Jours</div>
                </div>
                <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.2)', marginBottom: '14px', fontWeight: 300 }}>·</div>
              </>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{pad(time.hours)}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>Heures</div>
            </div>
            <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.2)', marginBottom: '14px', fontWeight: 300 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>{pad(time.minutes)}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>Min</div>
            </div>
            <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.2)', marginBottom: '14px', fontWeight: 300 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#FF3B30', letterSpacing: '-1.5px', lineHeight: 1 }}>{pad(time.seconds)}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>Sec</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHOWCASE CARDS (Type C) — données réelles
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Card 1 — Grande, fond blanc pur
 * Produit le plus populaire, image plein format, contraste fort sur fond sombre
 */
function ProductMainCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  return (
    <div style={{
      borderRadius: '24px',
      background: '#ffffff',
      boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Image plein format */}
      <div style={{ position: 'relative', height: '230px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
        {img && (
          <Image src={img} alt={product.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="400px" priority />
        )}
        {/* Fondu très subtil en bas pour la lisibilité du texte */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)' }} />

        {/* Badge trending */}
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '5px 12px', borderRadius: '999px',
          backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          fontSize: '11px', fontWeight: 800, color: '#FF3B30',
        }}>
          Tendance
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '18px 20px 20px' }}>
        <p style={{ fontSize: '10px', color: 'rgba(0,0,0,0.35)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1.1px', fontWeight: 700 }}>
          En ce moment sur Kollect
        </p>
        <p style={{
          fontSize: '17px', fontWeight: 900, color: '#0a0a0a',
          margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {product.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {product.brand && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34C759' }} />
              <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                {product.brand.name}
              </span>
            </div>
          )}
          <span style={{
            fontSize: '16px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.5px',
            padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)',
          }}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Card 2 — Compacte, fond sombre avec accent rouge
 * Dernière collection tombée — haut gauche, overlap la grande card
 */
function LatestDropCard({ collection }: { collection: Collection }) {
  return (
    <div style={{
      borderRadius: '20px',
      background: 'rgba(14,14,14,0.96)',
      border: '1px solid rgba(255,59,48,0.22)',
      backdropFilter: 'blur(24px)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '13px',
      boxShadow: '0 20px 56px rgba(0,0,0,0.6)',
    }}>
      {/* Thumbnail avec border rouge */}
      <div style={{
        position: 'relative',
        width: '50px', height: '50px', borderRadius: '12px',
        overflow: 'hidden', flexShrink: 0,
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1.5px solid rgba(255,59,48,0.3)',
      }}>
        {collection.coverImage && (
          <Image src={collection.coverImage} alt={collection.name} fill style={{ objectFit: 'cover' }} sizes="50px" />
        )}
      </div>

      {/* Texte */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          marginBottom: '4px',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#FF3B30', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Nouveau lancement
          </span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {collection.name}
        </p>
        {collection.brand && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', margin: 0, fontWeight: 500 }}>
            {collection.brand.name}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Card 3 — Fond blanc, image produit côte texte
 * Produit tendance — bas gauche, overlap la grande card
 */
function TrendingProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  return (
    <div style={{
      borderRadius: '20px',
      background: '#ffffff',
      boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Image carrée à gauche */}
        <div style={{ position: 'relative', width: '78px', height: '90px', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
          {img && <Image src={img} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="78px" />}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, padding: '14px 15px', minWidth: 0 }}>
          <p style={{ fontSize: '10px', color: 'rgba(0,0,0,0.3)', margin: '0 0 5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            La communauté porte
          </p>
          <p style={{ fontSize: '13px', fontWeight: 800, color: '#111', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            {product.brand && (
              <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.brand.name}
              </span>
            )}
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#FF3B30', flexShrink: 0, letterSpacing: '-0.3px' }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Right Side : Showcase ─────────────────────────────────────── */
function ShowcaseCards({ products, latestDrop, loading }: {
  products: Product[];
  latestDrop: Collection | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <>
        <div style={{ position: 'absolute', top: '70px', right: '0', left: '110px', zIndex: 2 }}>
          <Skeleton h={320} />
        </div>
        <div style={{ position: 'absolute', top: '10px', left: '0', width: '230px', zIndex: 4 }}>
          <Skeleton h={80} />
        </div>
        <div style={{ position: 'absolute', top: '310px', left: '20px', width: '230px', zIndex: 5 }}>
          <Skeleton h={90} />
        </div>
      </>
    );
  }

  return (
    <>
      {/*
        Overlap layout :
        ┌──────────────────────────────┐
        │  [small top]  ╔═════════════╗│
        │   left:0      ║ large card  ║│
        │               ║  left:110px ║│
        │  [small bot]  ║             ║│
        │   top:310px   ╚═════════════╝│
        └──────────────────────────────┘
        Les petites cards commencent avant la grande → vrai overlap
      */}

      {/* Grande card — arrière plan, décalée à droite */}
      {products[0] && (
        <div style={{
          position: 'absolute', top: '70px', right: '0', left: '110px',
          zIndex: 2, animation: 'heroFloat 4.5s ease-in-out infinite 0.4s',
        }}>
          <ProductMainCard product={products[0]} />
        </div>
      )}

      {/* Drop récent — haut gauche, overlap le coin haut-gauche de la grande */}
      {latestDrop && (
        <div style={{
          position: 'absolute', top: '10px', left: '0', width: '230px',
          zIndex: 4, animation: 'heroFloat 3.2s ease-in-out infinite',
        }}>
          <LatestDropCard collection={latestDrop} />
        </div>
      )}

      {/* Produit trending — bas gauche, overlap le coin bas-gauche de la grande */}
      {products[1] && (
        <div style={{
          position: 'absolute', top: '310px', left: '20px', width: '230px',
          zIndex: 5, animation: 'heroFloat 3.8s ease-in-out infinite 0.9s',
        }}>
          <TrendingProductCard product={products[1]} />
        </div>
      )}
    </>
  );
}

/* ─── Right Side : Drop ─────────────────────────────────────────── */
function DropCards({ drop }: { drop: Collection }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <DropCard drop={drop} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════ */
export function Hero() {
  const [data, setData] = useState<{
    upcomingDrop: Collection | null;
    products: Product[];
    latestDrop: Collection | null;
  }>({ upcomingDrop: null, products: [], latestDrop: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dropsRes, productsRes, latestRes] = await Promise.allSettled([
          fetch(`${API}/collections/coming-soon?limit=1`, FETCH_OPTS).then(r => r.json()),
          fetch(`${API}/produits/popular?limit=2&days=30`, FETCH_OPTS).then(r => r.json()),
          fetch(`${API}/collections/new?limit=1`, FETCH_OPTS).then(r => r.json()),
        ]);

        const drops = dropsRes.status === 'fulfilled' && Array.isArray(dropsRes.value) ? dropsRes.value : [];
        const products = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value) ? productsRes.value : [];
        const latest = latestRes.status === 'fulfilled' && Array.isArray(latestRes.value) ? latestRes.value : [];

        setData({
          upcomingDrop: drops[0] ?? null,
          products,
          latestDrop: latest[0] ?? null,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Détermine le mode d'affichage
  const mode: HeroMode = data.upcomingDrop
    ? (data.upcomingDrop.teaserVideo ? 'video-drop' : 'image-drop')
    : 'showcase';

  const isDropMode = mode !== 'showcase';
  const days = data.upcomingDrop?.launchDate ? daysUntil(data.upcomingDrop.launchDate) : 0;

  return (
    <section
      id="hero"
      aria-label="Hero"
      style={{
        minHeight: '100svh',
        backgroundColor: '#070707',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Glows de fond ── */}
      <div aria-hidden style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '700px', height: '700px',
        background: 'radial-gradient(ellipse, rgba(255,59,48,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '5%', right: '-5%',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(255,149,0,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Grille de points ── */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      {/* ── Fondu bas ── */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
        background: 'linear-gradient(to top, #070707, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* ══ Split principal ══ */}
      <div
        className="hero-inner"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '140px 32px 80px',
          gap: '64px',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {/* ── GAUCHE : Copy ── */}
        <div className="hero-left" style={{ flex: '0 0 auto', width: 'min(500px, 48%)', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '6px 16px 6px 10px', borderRadius: '999px', width: 'fit-content',
            border: '1px solid rgba(255,59,48,0.28)', backgroundColor: 'rgba(255,59,48,0.07)',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#FF3B30', display: 'inline-block', flexShrink: 0,
              boxShadow: '0 0 10px rgba(255,59,48,0.9)',
              animation: 'heroPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF3B30', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              {isDropMode
                ? `Drop imminent · Dans ${days} jour${days > 1 ? 's' : ''}`
                : 'Plateforme N°1 du streetwear sénégalais'}
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 4.2vw, 4.8rem)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.02, letterSpacing: '-3px', margin: 0,
          }}>
            {isDropMode ? (
              <>
                La communauté{' '}
                <em style={{
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 50%, #FF9500 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  retient
                </em>
                <br />son souffle.
              </>
            ) : (
              <>
                Avant{' '}
                <em style={{
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 50%, #FF9500 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  la Hype,
                </em>
                <br />avant tout le monde
              </>
            )}
          </h1>

          {/* Subline */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
            color: 'rgba(255,255,255,0.44)', lineHeight: 1.75,
            maxWidth: '430px', margin: 0,
          }}>
            {isDropMode && data.upcomingDrop
              ? `${data.upcomingDrop.name}${data.upcomingDrop.brand ? ` de ${data.upcomingDrop.brand.name}` : ''} arrive sur Kollect dans ${days} jour${days > 1 ? 's' : ''}. Sois le premier à le porter.`
              : 'Découvre les drops exclusifs de créateurs sénégalais vérifiés. Sois le premier à porter les pièces qui définissent le style local.'}
          </p>

          {/* Value props — uniquement en mode showcase */}
          {!isDropMode && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Drops en avant-première', 'Lance ta marque en 48h'].map((v) => (
                <div key={v} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 11px', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)',
                }}>
                  <span style={{ color: '#34C759', display: 'flex' }}><IconCheck size={11} /></span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.48)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {isDropMode && data.upcomingDrop ? (
                <>
                  <Link
                    href={`/collections/${data.upcomingDrop.slug}`}
                    className="hero-btn-primary"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                      color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                      boxShadow: '0 8px 32px rgba(255,59,48,0.4)', transition: 'all 220ms ease',
                    }}
                  >
                    <IconBell size={14} /> M&apos;alerter en premier
                  </Link>
                  <Link
                    href={`/collections/${data.upcomingDrop.slug}`}
                    className="hero-btn-secondary"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '14px 22px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                      color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
                      transition: 'all 220ms ease',
                    }}
                  >
                    <IconPlay /> Voir le teaser
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/explorer"
                    className="hero-btn-primary"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                      color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30',
                      boxShadow: '0 8px 32px rgba(255,59,48,0.4)', transition: 'all 220ms ease',
                    }}
                  >
                    Découvrir les drops <IconArrowRight />
                  </Link>
                  <Link
                    href="/collections"
                    className="hero-btn-secondary"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '14px 22px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                      color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
                      transition: 'all 220ms ease',
                    }}
                  >
                    <IconPlay /> Explorer
                  </Link>
                </>
              )}
            </div>

            <Link href="/create-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', width: 'fit-content' }}>
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

        {/* ── DROITE : Cards ── */}
        <div
          className="hero-right"
          style={{ flex: 1, position: 'relative', minHeight: '540px' }}
        >
          {/* Glow derrière les cartes */}
          <div aria-hidden style={{
            position: 'absolute', inset: '-20px',
            background: 'radial-gradient(ellipse at 55% 45%, rgba(255,59,48,0.10) 0%, transparent 65%)',
            filter: 'blur(8px)', pointerEvents: 'none',
          }} />

          {isDropMode && data.upcomingDrop
            ? <DropCards drop={data.upcomingDrop} />
            : <ShowcaseCards products={data.products} latestDrop={data.latestDrop} loading={loading} />
          }
        </div>
      </div>

      {/* ══ Stats bar ══ */}
      <div className="hero-stats" style={{
        position: 'relative', zIndex: 3,
        maxWidth: '1280px', width: '100%',
        margin: '0 auto', padding: '0 32px 80px',
      }}>
        <div className="stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderRadius: '18px', border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
        }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} className="stat-cell" style={{
              padding: '26px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              transition: 'background 200ms ease',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, textAlign: 'center' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(255,59,48,0.55) !important;
          background-color: #e0342a !important;
        }
        .hero-btn-secondary:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.2) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        .stat-cell:hover { background-color: rgba(255,255,255,0.04) !important; }
        @media (max-width: 1000px) {
          .hero-inner { flex-direction: column !important; padding: 120px 20px 60px !important; gap: 48px !important; }
          .hero-left { width: 100% !important; }
          .hero-right { min-height: 420px !important; width: 100%; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-cell:nth-child(2) { border-right: none !important; }
          .stat-cell:nth-child(1), .stat-cell:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
        }
        @media (max-width: 600px) {
          .hero-right { display: none !important; }
          .hero-stats { padding: 0 16px 56px !important; }
        }
      `}</style>
    </section>
  );
}

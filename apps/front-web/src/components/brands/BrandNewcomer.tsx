'use client';

import Link from 'next/link';
import { brandMediaUrl } from '@/components/brands/brand-media';
import { BrandFollowButton } from '@/components/brands/BrandFollowButton';
import type { BrandListItem } from '@/components/brands/types';
import { env } from '@/config/env';

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getDaysAgo(dateStr?: string): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function freshLabel(dateStr?: string): string {
  const d = getDaysAgo(dateStr);
  if (d === null) return 'Nouveau';
  if (d === 0) return "Rejoint aujourd'hui";
  if (d === 1) return 'Rejoint hier';
  return `Rejoint il y a ${d} jours`;
}

function resolveCover(brand: BrandListItem): string | undefined {
  if (brand.coverImage) return mediaUrl(brand.coverImage);
  if (brand.collections?.[0]?.coverImage) return mediaUrl(brand.collections[0].coverImage);
  const img = brand.collections?.[0]?.products?.[0]?.images?.[0] ?? brand.products?.[0]?.images?.[0];
  return img ? mediaUrl(img) : undefined;
}

type BrandNewcomerProps = {
  brands: BrandListItem[];
};

export function BrandNewcomer({ brands }: BrandNewcomerProps) {
  if (!brands.length) return null;

  const count = brands.length;

  return (
    <section
      aria-label="Nouvelles marques"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(28px, 5vw, 44px) var(--layout-container-padding) clamp(8px, 2vw, 12px)',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'clamp(20px, 3vw, 28px)', maxWidth: '720px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', letterSpacing: '2.8px', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Nouveaux sur Kollect
        </p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 14px' }}>
          {count === 1 ? 'Une nouvelle marque' : 'Des marques qui viennent'}
          <br />
          <span style={{ color: 'rgba(0,0,0,0.42)' }}>
            {count === 1 ? 'vient de rejoindre la plateforme.' : 'de rejoindre la plateforme.'}
          </span>
        </h2>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: 0, maxWidth: 560 }}>
          {count === 1
            ? "Ce créateur vient tout juste d'ouvrir sa boutique sur Kollect. Suis-le dès maintenant pour être parmi les premiers à recevoir ses drops."
            : "Ces créateurs viennent tout juste d'ouvrir leur boutique sur Kollect. Suis-les dès maintenant pour être parmi les premiers à recevoir leurs drops."}
        </p>
      </div>

      {/* Layout adaptatif */}
      {count === 1 && <HeroLayout brand={brands[0]} />}
      {count === 2 && <DuoLayout brands={brands} />}
      {count >= 3 && <CarouselLayout brands={brands} />}

      <style>{`
        @keyframes newcomerPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(34,197,94,0.8); }
          50% { opacity: 0.4; box-shadow: 0 0 2px rgba(34,197,94,0.3); }
        }
        .newcomer-card { transition: transform 220ms ease, box-shadow 220ms ease; }
        .newcomer-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important; }
        @media (max-width: 640px) {
          .newcomer-hero-layout { grid-template-columns: 1fr !important; min-height: unset !important; }
          .newcomer-hero-layout > *:first-child { min-height: 200px !important; }
          .newcomer-duo-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ── 1 marque — grand bloc hero horizontal ── */
function HeroLayout({ brand }: { brand: BrandListItem }) {
  const logo = mediaUrl(brandMediaUrl(brand.logo) ?? undefined);
  const cover = resolveCover(brand);
  const productCount = brand._count?.products ?? 0;

  return (
    <div
      className="newcomer-card newcomer-hero-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: '#0a0a0a',
        boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
        minHeight: 340,
      }}
    >
      {/* Gauche — cover */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 280 }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.3) 0%, transparent 70%)' }} />
        <NewBadge />
      </div>

      {/* Droite — infos */}
      <div style={{ padding: 'clamp(28px, 4vw, 44px)', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LogoAvatar logo={logo} name={brand.name} size={67} radius={14} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#fff', letterSpacing: '-0.5px' }}>
                {brand.name}
              </span>
              {brand.isVerified && <VerifiedBadge />}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              {freshLabel(brand.createdAt)}
              {productCount > 0 && ` · ${productCount} pièce${productCount > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {brand.bio && (
          <p style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0, maxWidth: 440 }}>
            {brand.bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <BrandFollowButton brandId={brand.id} initialFollowerCount={brand.followerCount ?? 0} variant="pill" labelVariant="subscribe" />
          <Link
            href={`/brand/${brand.slug}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 999, backgroundColor: '#fff', color: '#0a0a0a', fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'background 180ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            Voir la boutique <span aria-hidden style={{ opacity: 0.6 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── 2 marques — côte à côte, même hauteur ── */
function DuoLayout({ brands }: { brands: BrandListItem[] }) {
  return (
    <div className="newcomer-duo-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {brands.map((brand) => <NewcomerCard key={brand.id} brand={brand} />)}
    </div>
  );
}

/* ── 3+ marques — carousel scroll horizontal ── */
function CarouselLayout({ brands }: { brands: BrandListItem[] }) {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
      {brands.map((brand) => (
        <div key={brand.id} style={{ flex: '0 0 clamp(280px, 32vw, 360px)', scrollSnapAlign: 'start' }}>
          <NewcomerCard brand={brand} />
        </div>
      ))}
    </div>
  );
}

/* ── Card standard (duo + carousel) ── */
function NewcomerCard({ brand }: { brand: BrandListItem }) {
  const logo = mediaUrl(brandMediaUrl(brand.logo) ?? undefined);
  const cover = resolveCover(brand);
  const productCount = brand._count?.products ?? 0;

  return (
    <div
      className="newcomer-card"
      style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', backgroundColor: '#0a0a0a', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', height: 140, backgroundColor: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)' }} />
        <NewBadge />

        {/* Logo chevauchant */}
        <div style={{ position: 'absolute', bottom: -24, left: 20 }}>
          <LogoAvatar logo={logo} name={brand.name} size={48} radius={12} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '36px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.4px' }}>{brand.name}</span>
          {brand.isVerified && <VerifiedBadge />}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{freshLabel(brand.createdAt)}</span>
          {productCount > 0 && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{productCount} pièce{productCount > 1 ? 's' : ''}</span>
            </>
          )}
        </div>

        {brand.bio && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {brand.bio}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4, flexWrap: 'wrap' }}>
          <BrandFollowButton brandId={brand.id} initialFollowerCount={brand.followerCount ?? 0} variant="pill" labelVariant="subscribe" />
          <Link
            href={`/brand/${brand.slug}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, backgroundColor: '#fff', color: '#0a0a0a', fontWeight: 700, fontSize: 12, textDecoration: 'none', transition: 'background 180ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            Voir la boutique <span aria-hidden style={{ opacity: 0.6 }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Petits composants réutilisables ── */
function NewBadge() {
  return (
    <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(34,197,94,0.35)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'newcomerPulse 2s ease-in-out infinite' }} />
      <span style={{ fontSize: 9, fontWeight: 800, color: '#22C55E', letterSpacing: '2px', textTransform: 'uppercase' }}>Nouveau</span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600, color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
      ✓ Vérifiée
    </span>
  );
}

function LogoAvatar({ logo, name, size, radius }: { logo?: string; name: string; size: number; radius: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', backgroundColor: '#1a1a1a', flexShrink: 0 }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38, color: 'rgba(255,255,255,0.4)', backgroundColor: '#1a1a1a' }}>
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}

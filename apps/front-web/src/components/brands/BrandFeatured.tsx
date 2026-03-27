'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';
import { BrandFollowButton } from '@/components/brands/BrandFollowButton';
import { brandMediaUrl } from '@/components/brands/brand-media';
import type { BrandListItem } from '@/components/brands/types';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { BrandProductCard, type BrandProductCardItem } from '@/components/brands/brand-shop/BrandProductCard';

type BrandFeaturedProps = {
  brands: BrandListItem[];
};

type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

const FALLBACK_TAGLINES = [
  'Des pièces qui partent vite — il reste à voir quoi sur la boutique.',
  '72h en avant-plan : après, une autre marque prend la couverture.',
  'Streetwear sénégalais : l’histoire complète est sur leur page.',
  'Peu de stocks, beaucoup de style — ne passe pas à côté.',
  'Nouveau sur Kollect : ouvre la page avant que tout parte.',
];

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

function taglineIndex(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % FALLBACK_TAGLINES.length;
}

function resolveTagline(brand: BrandListItem): string {
  const bio = (brand.bio ?? '').trim();
  if (bio.length >= 10) return bio;
  return FALLBACK_TAGLINES[taglineIndex(brand.id)];
}

function logoSrc(brand: BrandListItem): string | undefined {
  const u = brandMediaUrl(brand.logo);
  return mediaUrl(u ?? undefined);
}

export function BrandFeatured({ brands }: BrandFeaturedProps) {
  const featured = useMemo(() => {
    if (!brands.length) return null;
    const i = Math.floor(Date.now() / 86400000 / 3) % brands.length;
    return brands[i];
  }, [brands]);

  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (!featured?.slug) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const res = await apiClient.get<{ data: FeaturedProduct[] }>(
          `/produits/brand/${encodeURIComponent(featured.slug)}?page=1&limit=4&sortBy=popular`,
        );
        const body = res.data;
        const list = body && typeof body === 'object' && Array.isArray(body.data) ? body.data : [];
        if (!cancelled) setProducts(list.filter((p) => p.slug));
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [featured?.slug]);

  if (!featured) return null;

  const tagline = resolveTagline(featured);
  const logo = logoSrc(featured);
  const n = products.length;

  return (
    <section
      aria-label="Marque à la une"
      style={{
        margin: '0 auto 40px',
        maxWidth: '1280px',
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Accent top */}
      <div style={{ height: 2, backgroundColor: 'var(--color-accent)', width: '100%' }} />

      {/* BLOC 1 — Header */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#0a0a0a',
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 28px)',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '-8%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(55%, 420px)',
            height: '140%',
            background: 'radial-gradient(ellipse at center, rgba(255, 59, 48, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(18px, 3vw, 24px)',
          }}
        >
          {/* Badge ligne éditoriale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 11px',
                borderRadius: 999,
                border: '1px solid rgba(255, 59, 48, 0.45)',
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '2px',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              <span className="brand-featured-pulse-dot" />
              À la une
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Couverture · 72h
            </span>
          </div>

          {/* Profil : logo + identité + actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(16px, 3vw, 24px)',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              }}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 24,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {featured.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Nom + tagline + actions */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Nom + badge vérifié */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(1.25rem, 2.4vw, 1.5rem)',
                    color: '#fff',
                    letterSpacing: '-0.6px',
                    lineHeight: 1.15,
                  }}
                >
                  {featured.name}
                </span>
                {featured.isVerified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#4ADE80',
                      backgroundColor: 'rgba(74, 222, 128, 0.12)',
                      border: '1px solid rgba(74, 222, 128, 0.35)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Vérifiée
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.88rem, 1.5vw, 0.97rem)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.48)',
                  lineHeight: 1.55,
                  maxWidth: 520,
                }}
              >
                {tagline}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <BrandFollowButton
                  brandId={featured.id}
                  initialFollowerCount={featured.followerCount ?? 0}
                  variant="pill"
                  labelVariant="subscribe"
                />
                <Link
                  href={`/brand/${featured.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 20px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '-0.1px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.18)',
                    transition: 'background 180ms ease, transform 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Voir la marque
                  <span aria-hidden style={{ fontSize: '1em', opacity: 0.7 }}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOC 2 — Produits (même esprit que la landing : eyebrow + titre + rail) */}
      {(productsLoading || n > 0) && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: 'clamp(28px, 4vw, 40px) clamp(14px, 2.5vw, 22px) clamp(22px, 3vw, 32px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              marginTop: 0,
              marginBottom: 'clamp(20px, 3vw, 28px)',
              maxWidth: '720px',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                margin: '0 0 14px',
              }}
            >
              Dans la boutique
            </p>
            <h3
              style={{
                fontSize: 'clamp(1.35rem, 2.8vw, 1.85rem)',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-0.8px',
                lineHeight: 1.12,
                margin: '0 0 10px',
              }}
            >
              Les pièces qui font le buzz
            </h3>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.48)',
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              Aperçu des best-sellers chez {featured.name} — clique pour ouvrir la fiche produit ou passe par « Voir la marque » pour tout voir.
            </p>
          </div>

          {productsLoading ? (
            <div
              className="brand-featured-prod-rail"
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                justifyContent: 'flex-start',
                paddingBottom: '12px',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: '0 0 min(242px, 78vw)',
                    scrollSnapAlign: 'start',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="brand-featured-sk"
                    style={{
                      aspectRatio: '3/4',
                      backgroundColor: '#F3F3F3',
                    }}
                  />
                  <div style={{ padding: 'var(--spacing-md) var(--spacing-md) 18px', backgroundColor: '#fff' }}>
                    <div style={{ height: 12, borderRadius: 4, backgroundColor: '#EEE', marginBottom: 8, width: '80%' }} />
                    <div style={{ height: 12, borderRadius: 4, backgroundColor: '#EEE', width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="brand-featured-prod-rail"
              style={{
                display: 'flex',
                gap: '14px',
                width: '100%',
                justifyContent: n === 1 ? 'center' : 'flex-start',
                overflowX: n > 1 ? 'auto' : 'visible',
                paddingBottom: '12px',
                scrollSnapType: n > 1 ? 'x mandatory' : undefined,
                WebkitOverflowScrolling: n > 1 ? 'touch' : undefined,
              }}
            >
              {products.map((p) => {
                const productItem: BrandProductCardItem = {
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  images: p.images,
                };
                return (
                  <div
                    key={p.id}
                    style={{
                      flex: '0 0 min(242px, 78vw)',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <BrandProductCard
                      brandSlug={featured.slug}
                      brandName={featured.name}
                      product={productItem}
                      accent="#FF3B30"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes brandFeaturedPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.15); }
        }
        @keyframes brandFeaturedSk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .brand-featured-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--color-accent);
          box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.45);
          animation: brandFeaturedPulse 1.4s ease-in-out infinite;
        }
        .brand-featured-sk {
          animation: brandFeaturedSk 1.4s ease-in-out infinite;
        }
        .brand-featured-card-face:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        .brand-featured-prod-rail { scrollbar-width: thin; }
      `}</style>
    </section>
  );
}

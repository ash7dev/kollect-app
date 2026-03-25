'use client';

import Link from 'next/link';
import type { BrandListItem } from '@/components/brands/types';
import { brandMediaUrl } from '@/components/brands/brand-media';
import { resolveBrandBanner } from '@/components/brands/resolveBrandBanner';
import { brandAccentCss, brandAccentSoft } from '@/components/brands/brandAccent';
import { BrandFollowButton } from '@/components/brands/BrandFollowButton';
import { env } from '@/config/env';

function toAbsoluteUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function BrandSpotlight({ brands }: { brands: BrandListItem[] }) {
  if (brands.length === 0) return null;

  return (
    <section
      aria-label="Marques en vedette"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 var(--layout-container-padding)',
        marginBottom: 8,
      }}
    >
      <div
        className="brand-spotlight-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: brands.length > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
          gap: 16,
        }}
      >
        {brands.map((brand, index) => (
          <SpotlightTile key={brand.id} brand={brand} priority={index === 0} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .brand-spotlight-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function SpotlightTile({ brand, priority }: { brand: BrandListItem; priority: boolean }) {
  // Debug logs pour voir les données reçues
  console.log('🔍 [BrandSpotlight] Brand data:', {
    id: brand.id,
    name: brand.name,
    coverImage: brand.coverImage,
    hasProducts: !!brand.products,
    productsLength: brand.products?.length,
    hasCollections: !!brand.collections,
    collectionsLength: brand.collections?.length,
    firstProductImages: brand.products?.[0]?.images,
    firstCollectionCover: brand.collections?.[0]?.coverImage,
    firstCollectionProductImages: brand.collections?.[0]?.products?.[0]?.images,
  });
  
  const banner = toAbsoluteUrl(resolveBrandBanner(brand));
  console.log('🖼️ [BrandSpotlight] Resolved banner:', banner);
  
  const logo = toAbsoluteUrl(brandMediaUrl(brand.logo));
  const followers = brand.followerCount ?? 0;
  const products = brand._count?.products ?? 0;
  const accent = brandAccentCss(brand.id);
  const accentSoft = brandAccentSoft(brand.id, 0.1);

  const followersLabel =
    followers > 999 ? `${(followers / 1000).toFixed(1)}k` : followers > 0 ? String(followers) : '0';
  const productsLabel = products > 0 ? String(products) : null;

  return (
    <article
      className="brand-spotlight-tile"
      style={{
        position: 'relative',
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: `0 2px 24px rgba(0,0,0,0.14), 0 0 0 1px ${accentSoft}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Link
        href={`/brand/${brand.slug}`}
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
        aria-label={`Voir la vitrine ${brand.name}`}
      />

      {/* Banner */}
      <div
        className="brand-spotlight-img-wrap"
        style={{
          position: 'relative',
          height: 'min(280px, 48vw)',
          minHeight: 200,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt=""
            width={800}
            height={440}
            loading={priority ? 'eager' : 'lazy'}
            className="brand-spotlight-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(145deg, ${brandAccentSoft(brand.id, 0.5)} 0%, #0a0a0a 100%)`,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Accent top line */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
      </div>

      {/* Info block */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#0f0f0f',
          flex: 1,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo pop + name row */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-end',
            padding: '0 20px',
            marginTop: -36,
            marginBottom: 14,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#fff',
              border: '3px solid #0f0f0f',
              boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={68} height={68} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#111',
                  background: '#f0f0f0',
                }}
              >
                {brand.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + verified */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
                  fontWeight: 900,
                  color: '#fff',
                  margin: 0,
                  letterSpacing: '-0.4px',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {brand.name}
              </h3>
              {brand.isVerified && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 6px',
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#4ADE80',
                    backgroundColor: 'rgba(74,222,128,0.1)',
                    border: '1px solid rgba(74,222,128,0.25)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Vérifiée
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {brand.bio && (
          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.42)',
              margin: '0 20px 16px',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {brand.bio}
          </p>
        )}

        {/* Footer : stats + actions — toujours en bas grâce au marginTop auto */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px 18px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            gap: 12,
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 3,
            marginTop: 'auto',
          }}
        >
          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" aria-hidden>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.38)' }}>
                {followersLabel}
              </span>
            </span>
            {productsLabel && (
              <>
                <span style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.1)' }} aria-hidden />
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" aria-hidden>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.38)' }}>
                    {productsLabel} pièces
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <BrandFollowButton
              brandId={brand.id}
              initialFollowerCount={followers}
              variant="compact"
              labelVariant="subscribe"
              colorVariant="accent"
            />
          </div>
        </div>
      </div>

      <style>{`
        .brand-spotlight-tile {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .brand-spotlight-tile:hover {
          transform: translateY(-5px);
          box-shadow: 0 28px 64px rgba(0,0,0,0.32) !important;
        }
        .brand-spotlight-tile:hover .brand-spotlight-img {
          transform: scale(1.06);
        }
      `}</style>
    </article>
  );
}

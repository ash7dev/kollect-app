'use client';

import Link from 'next/link';
import type { BrandListItem } from '@/components/brands/types';
import { brandMediaUrl } from '@/components/brands/brand-media';
import { resolveBrandBanner } from '@/components/brands/resolveBrandBanner';
import { brandAccentCss, brandAccentSoft } from '@/components/brands/brandAccent';
import { BrandFollowButton } from '@/components/brands/BrandFollowButton';

type BrandCardProps = {
  brand: BrandListItem;
  priorityImage?: boolean;
};

export function BrandCard({ brand, priorityImage }: BrandCardProps) {
  const banner = resolveBrandBanner(brand);
  const logo = brandMediaUrl(brand.logo);
  const followers = brand.followerCount ?? 0;
  const accent = brandAccentCss(brand.id);

  return (
    <div
      className="brand-card-root"
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        aspectRatio: '3 / 4',
        backgroundColor: '#111',
        cursor: 'pointer',
      }}
    >
      <Link
        href={`/brand/${brand.slug}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
        }}
        aria-label={`Voir la marque ${brand.name}`}
      />

      {/* Image */}
      <div className="brand-card-img-wrap" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt=""
            width={600}
            height={800}
            loading={priorityImage ? 'eager' : 'lazy'}
            decoding="async"
            className="brand-card-img"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(160deg, ${brandAccentSoft(brand.id, 0.5)} 0%, #0a0a0a 60%)`,
            }}
          />
        )}
      </div>

      {/* Gradient overlay — bottom heavy */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Top accent line */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 3,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          opacity: 0.8,
        }}
      />

      {/* Follow button — top right */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 4,
          pointerEvents: 'auto',
        }}
      >
        <BrandFollowButton brandId={brand.id} initialFollowerCount={followers} variant="compact" />
      </div>

      {/* Bottom info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          padding: '20px 18px 22px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 14,
          pointerEvents: 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 900,
                color: '#111',
                backgroundColor: '#f5f5f5',
              }}
            >
              {brand.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + label */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            className="brand-card-name"
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 5px',
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {brand.name}
          </p>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              color: accent,
            }}
          >
            Découvrir la marque
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      <style>{`
        .brand-card-root {
          transition: box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .brand-card-root:hover {
          box-shadow: 0 20px 50px rgba(0,0,0,0.28);
        }
        .brand-card-root:hover .brand-card-img {
          transform: scale(1.06);
        }
        .brand-card-root:hover .brand-card-name {
          color: ${accent} !important;
        }
      `}</style>
    </div>
  );
}

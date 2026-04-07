/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import Link from 'next/link';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';

function formatPriceWithCurrency(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

type PublicCollectionHeroProps = {
  collection: PublicCollection;
};

export function PublicCollectionHero({ collection }: PublicCollectionHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const { name, coverImage, teaserVideo, brand, status, _count, originalPrice, discountType, discountValue } = collection;
  const productCount = _count?.products ?? 0;

  // Résoudre le média : vidéo > image > fallback produit
  const videoSrc = teaserVideo ? mediaUrl(teaserVideo) : null;
  const imageSrc = !videoSrc
    ? (isVideo(coverImage)
        ? mediaUrl(collection.products?.[0]?.images?.[0] ?? null)
        : mediaUrl(coverImage) ?? mediaUrl(collection.products?.[0]?.images?.[0] ?? null))
    : null;

  const logoSrc = mediaUrl(brand.logo);
  const accent = '#FF3B30';

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#070707',
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderRadius: '0 0 32px 32px',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <style>{`
        @keyframes colHeroFadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes colHeroSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .col-hero-visible { animation: colHeroFadeIn 0.9s ease-out forwards; }
        .col-hero-title   { animation: colHeroSlideUp 0.7s ease-out 0.3s both; }
      `}</style>

      {/* ── Background ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className={isVisible ? 'col-hero-visible' : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'brightness(0.65)',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.8s ease-out',
            }}
          />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            aria-hidden
            className={isVisible ? 'col-hero-visible' : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'brightness(0.65)',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.8s ease-out',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(145deg, ${accent}44, #000)`,
          }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.9) 100%)',
        }} />
      </div>

      {/* ── Top row : back link + brand logo ── */}
      <div style={{
        position: 'absolute',
        top: 96,
        left: 0,
        right: 0,
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <Link
          href={`/brand/${brand.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            textDecoration: 'none',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.5s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {brand.name}
        </Link>

        {/* Brand logo */}
        {logoSrc && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#fff',
            padding: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.4s',
          }}>
            <img src={logoSrc} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}
      </div>

      {/* ── Bottom content : titre centré ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 40px 52px',
        textAlign: 'center',
      }}>
        {/* Brand name */}
        <p
          className={isVisible ? 'col-hero-title' : ''}
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 12px',
          }}
        >
          {brand.name}
          {brand.isVerified && <span style={{ color: accent, marginLeft: 8 }}>✓</span>}
        </p>

        {/* Collection name */}
        <h1
          className={isVisible ? 'col-hero-title' : ''}
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1,
            color: '#fff',
            margin: '0 0 20px',
            textTransform: 'uppercase',
            textShadow: '0 8px 48px rgba(0,0,0,0.5)',
          }}
        >
          {name}
        </h1>

        {/* Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.7s',
        }}>
          {status === 'TEASER' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              backgroundColor: 'rgba(255,136,0,0.85)',
              backdropFilter: 'blur(10px)',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#fff',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff', display: 'inline-block' }} />
              À Venir
            </span>
          )}

          {/* Badge Promotion Collection */}
          {originalPrice && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              backgroundColor: '#FF3B30',
              backdropFilter: 'blur(10px)',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(255,59,48,0.4)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 11 18-5M3 18l18-5" />
              </svg>
              PROMO {discountType === 'PERCENTAGE' ? `-${discountValue}%` : `-${formatPriceWithCurrency(discountValue ?? 0)}`}
            </span>
          )}

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {productCount} pièce{productCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Accent line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: isVisible ? 0.85 : 0,
        zIndex: 2,
        transition: 'opacity 0.8s ease-out 1s',
      }} />
    </section>
  );
}

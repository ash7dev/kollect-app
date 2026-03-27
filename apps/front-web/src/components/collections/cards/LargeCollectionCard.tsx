/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';

type LargeCollectionCardProps = {
  collection: PublicCollection;
};

function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isVideo(url: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export function LargeCollectionCard({ collection }: LargeCollectionCardProps) {
  const [hovered, setHovered] = useState(false);

  const productCount = collection._count?.products ?? 0;
  const rawCover = collection.coverImage ?? collection.teaserVideo ?? null;
  const coverIsVideo = isVideo(rawCover);

  // Fallback : première image produit si la cover est une vidéo ou absente
  const fallbackImage = !coverIsVideo
    ? null
    : (collection.products?.[0]?.images?.[0] ?? null);

  const coverVideo = coverIsVideo ? mediaUrl(rawCover) : null;
  const coverImage = coverIsVideo
    ? mediaUrl(fallbackImage)
    : mediaUrl(rawCover);

  const brandHref = `/brand/${collection.brand.slug}/${collection.slug}`;

  return (
    <a
      href={brandHref}
      style={{
        display: 'block',
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)'
          : '0 4px 20px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
        {coverVideo ? (
          <video
            src={coverVideo}
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : coverImage ? (
          <img
            src={coverImage}
            alt={collection.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(145deg, #1a1a1a, #333)',
          }} />
        )}

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)',
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
        }} />

        {/* Badge Vedette */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '8px 16px',
          borderRadius: 999,
          backgroundColor: '#FF3B30',
          color: '#fff',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 12px rgba(255,59,48,0.4)',
        }}>
          Vedette
        </div>

        {/* Brand Logo */}
        {collection.brand.logo && (
          <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#fff',
            padding: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <img
              src={mediaUrl(collection.brand.logo) ?? ''}
              alt={collection.brand.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Hover overlay content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          transform: hovered ? 'translateY(0)' : 'translateY(20px)',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#fff',
                margin: '0 0 4px',
                textTransform: 'uppercase',
              }}>
                {collection.name}
              </h3>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {collection.brand.name}
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                {productCount} produit{productCount > 1 ? 's' : ''}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: '-0.3px',
              color: '#000',
              margin: '0 0 4px',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}>
              {collection.name}
            </h3>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.45)', margin: 0 }}>
              par {collection.brand.name}
              {collection.brand.isVerified && (
                <span style={{ color: '#FF3B30', marginLeft: 6 }}>✓</span>
              )}
            </p>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>
            {productCount} article{productCount > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </a>
  );
}

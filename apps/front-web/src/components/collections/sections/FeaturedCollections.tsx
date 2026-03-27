/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import type { PublicCollection } from '@/types/drops';

type FeaturedCollectionsProps = {
  collections: PublicCollection[];
  isFirstSection?: boolean;
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

function getCoverMedia(collection: PublicCollection) {
  const raw = collection.coverImage ?? collection.teaserVideo ?? null;
  if (isVideo(raw)) {
    const fallback = mediaUrl(collection.products?.[0]?.images?.[0] ?? null);
    return { video: mediaUrl(raw), image: fallback };
  }
  return { video: null, image: mediaUrl(raw) };
}

function FeaturedCard({
  collection,
  size = 'normal',
  index,
  isVisible,
}: {
  collection: PublicCollection;
  size?: 'hero' | 'normal';
  index: number;
  isVisible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { video, image } = getCoverMedia(collection);
  const productCount = collection._count?.products ?? 0;
  const href = `/brand/${collection.brand.slug}/${collection.slug}`;

  return (
    <a
      href={href}
      className={isVisible ? 'featured-card' : ''}
      style={{
        display: 'block',
        position: 'relative',
        borderRadius: size === 'hero' ? 28 : 20,
        overflow: 'hidden',
        textDecoration: 'none',
        cursor: 'pointer',
        backgroundColor: '#111',
        aspectRatio: size === 'hero' ? '16 / 7' : '4 / 3',
        animationDelay: `${0.1 + index * 0.12}s`,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease',
        transform: hovered ? 'scale(1.015)' : 'scale(1)',
        boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      {video ? (
        <video
          src={video}
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
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      ) : image ? (
        <img
          src={image}
          alt={collection.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'transform 0.6s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
        }} />
      )}

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)',
        transition: 'opacity 0.3s ease',
        opacity: hovered ? 0.9 : 1,
      }} />

      {/* Top row — badges */}
      <div style={{
        position: 'absolute',
        top: size === 'hero' ? 28 : 18,
        left: size === 'hero' ? 28 : 18,
        right: size === 'hero' ? 28 : 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 999,
          backgroundColor: collection.status === 'TEASER'
            ? 'rgba(255,136,0,0.9)'
            : 'rgba(255,59,48,0.9)',
          backdropFilter: 'blur(10px)',
        }}>
          {collection.status === 'TEASER' && (
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'inline-block',
            }} />
          )}
          <span style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#fff',
          }}>
            {collection.status === 'TEASER' ? 'À Venir' : 'Vedette'}
          </span>
        </div>

        {/* Brand logo */}
        {collection.brand.logo && (
          <div style={{
            width: size === 'hero' ? 52 : 40,
            height: size === 'hero' ? 52 : 40,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: 7,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <img
              src={mediaUrl(collection.brand.logo) ?? ''}
              alt={collection.brand.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: size === 'hero' ? '32px' : '20px',
      }}>
        {/* Brand name */}
        <p style={{
          fontSize: 11,
          fontWeight: 900,
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 6px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          {collection.brand.name}
          {collection.brand.isVerified && (
            <span style={{ color: '#FF3B30', marginLeft: 6 }}>✓</span>
          )}
        </p>

        {/* Collection name */}
        <h3 style={{
          fontSize: size === 'hero' ? 'clamp(2rem, 4vw, 3rem)' : 'clamp(1.2rem, 2vw, 1.6rem)',
          fontWeight: 900,
          letterSpacing: '-0.8px',
          color: '#fff',
          margin: '0 0 16px',
          textTransform: 'uppercase',
          lineHeight: 1.05,
        }}>
          {collection.name}
        </h3>

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
          }}>
            {productCount} pièce{productCount > 1 ? 's' : ''}
          </span>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: size === 'hero' ? '10px 20px' : '8px 14px',
            borderRadius: 999,
            backgroundColor: hovered ? '#fff' : 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'background-color 0.25s ease',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 900,
              color: hovered ? '#000' : '#fff',
              whiteSpace: 'nowrap',
              transition: 'color 0.25s ease',
            }}>
              {collection.status === 'TEASER' ? 'Voir le teaser' : 'Explorer'}
            </span>
            <svg
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke={hovered ? '#000' : '#fff'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'stroke 0.25s ease', flexShrink: 0 }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

export function FeaturedCollections({ collections, isFirstSection = false }: FeaturedCollectionsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    const el = document.getElementById('featured-collections');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (collections.length === 0) return null;

  const [hero, ...rest] = collections;

  return (
    <section
      id="featured-collections"
      style={{
        margin: isFirstSection ? 0 : '32px 24px 0',
        borderRadius: isFirstSection ? 0 : 32,
        padding: '80px 40px',
        backgroundColor: '#0a0a0a',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      <style>{`
        @keyframes featuredSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .featured-card {
          opacity: 0;
          animation: featuredSlideIn 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .featured-card { opacity: 1; animation: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: 999,
            border: '2px solid #FF3B30',
            backgroundColor: 'rgba(255,59,48,0.08)',
            color: '#FF3B30',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Vedettes
          </div>

          <h2 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#fff',
            margin: '0 0 16px',
            textTransform: 'uppercase',
          }}>
            Collections Vedettes
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Les sélections les plus populaires de nos marques partenaires
          </p>
        </div>

        {/* Hero card */}
        <div style={{ marginBottom: rest.length > 0 ? 20 : 0 }}>
          <FeaturedCard collection={hero} size="hero" index={0} isVisible={isVisible} />
        </div>

        {/* Rest grid */}
        {rest.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(rest.length, 3)}, 1fr)`,
            gap: 20,
          }}>
            {rest.map((collection, i) => (
              <FeaturedCard
                key={collection.id}
                collection={collection}
                size="normal"
                index={i + 1}
                isVisible={isVisible}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

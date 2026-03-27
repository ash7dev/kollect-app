'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import type { BrandProductCardItem } from './BrandProductCard';

type CollectionCardData = {
  name: string;
  slug: string;
  products: BrandProductCardItem[];
  coverImage?: string | null;
  coverImageFallback?: string | null;
  href?: string;
  productCount?: number;
};

type BrandCollectionCardsProps = {
  collections: CollectionCardData[];
  accent: string;
};

export function BrandCollectionCards({ collections, accent }: BrandCollectionCardsProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Observer pour détecter quand les collections sont visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('collection-cards');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="collection-cards"
      style={{ 
        padding: '60px 40px', 
        backgroundColor: '#fff',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        fontFamily: FONT_FAMILY_INTER,
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes collectionSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .collection-card {
          opacity: 0;
          animation: collectionSlideIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .collection-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
        }}>
          {collections.map((collection, index) => (
            <CollectionCard 
              key={collection.slug}
              collection={collection}
              accent={accent}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function mediaUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isVideo(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function CollectionCard({
  collection,
  accent,
  isVisible,
  index,
}: {
  collection: CollectionCardData;
  accent: string;
  isVisible: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Prend coverImage si dispo et ce n'est pas une vidéo, sinon fallback produit
  const coverImage = (() => {
    if (collection.coverImage && !isVideo(collection.coverImage)) return mediaUrl(collection.coverImage);
    if (collection.coverImageFallback) return mediaUrl(collection.coverImageFallback);
    for (const p of collection.products) {
      const img = p.images?.[0];
      if (img) return mediaUrl(img);
    }
    return null;
  })();

  const productCount = collection.productCount ?? collection.products.length;

  return (
    <a
      href={collection.href ?? `#col-${collection.slug}`}
      className={isVisible ? 'collection-card' : ''}
      style={{
        display: 'block',
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        backgroundColor: '#111',
        textDecoration: 'none',
        cursor: 'pointer',
        animationDelay: isVisible ? `${0.1 + (index * 0.1)}s` : '0s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'transform 500ms ease, filter 500ms ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            filter: hovered ? 'brightness(0.55)' : 'brightness(0.72)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(145deg, ${accent}33, #000)`,
        }} />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* Badge collection */}
      <div style={{
        position: 'absolute', top: 18, left: 18,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 900, letterSpacing: '2px',
          textTransform: 'uppercase', color: accent,
        }}>
          Collection
        </span>
      </div>

      {/* Content bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 24px 24px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <h3 style={{
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.8px',
            color: '#fff',
            margin: '0 0 6px',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}>
            {collection.name}
          </h3>
          <p style={{
            fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
          }}>
            {productCount} pièce{productCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* CTA */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 14, flexShrink: 0,
          backgroundColor: hovered ? '#fff' : 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'background-color 250ms ease',
        }}>
          <span style={{
            fontSize: 12, fontWeight: 900,
            color: hovered ? '#000' : '#fff',
            whiteSpace: 'nowrap',
            transition: 'color 250ms ease',
          }}>
            Découvrir
          </span>
          <svg
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke={hovered ? '#000' : '#fff'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'stroke 250ms ease', flexShrink: 0 }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

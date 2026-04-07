'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { formatPriceWithCurrency } from '@/lib/price-utils';

export type SimilarProductItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  images?: string[] | null;
  stock?: number | null;
  sizes?: string[];
  colors?: string[];
  collection?: { name?: string | null } | null;
};

type SimilarProductsProps = {
  products: SimilarProductItem[];
  accent: string;
  title?: string;
};

function mediaUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Card Component ──────────────────────────────────────────────────────────────

function SimilarProductCard({ product, accent }: { product: SimilarProductItem; accent: string }) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Observer pour détecter quand la card est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const disabled = typeof product.stock === 'number' && product.stock <= 0;
  const image = product.images?.[0] ? mediaUrl(product.images[0]) : null;
  const priceFormatted = new Intl.NumberFormat('fr-FR').format(product.price);

  return (
    <>
      {/* Animations CSS */}
      <style>{`
        @keyframes cardFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(25px) scale(0.97); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .similar-product-card {
          opacity: 0;
          animation: cardFadeIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .similar-product-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <div
        ref={cardRef}
        className={isVisible ? 'similar-product-card' : ''}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: hovered ? '#fff' : 'transparent',
          boxShadow: hovered
            ? '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
            : '0 0 0 rgba(0,0,0,0)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 240ms ease, box-shadow 240ms ease',
          cursor: 'pointer',
          fontFamily: FONT_FAMILY_INTER,
          willChange: 'box-shadow',
          flexShrink: 0,
          minWidth: 280,
          maxWidth: 280,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image ── */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', flexShrink: 0, margin: 8 }}>
          <Link
            href={`/product/${encodeURIComponent(product.slug)}`}
            aria-label={`Voir ${product.name}`}
            style={{ display: 'block' }}
          >
            <div style={{ aspectRatio: '3 / 4', backgroundColor: '#F0F0F0', overflow: 'hidden' }}>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    transition: 'transform 380ms ease',
                    transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #E2E2E2, #EBEBEB)' }} />
              )}
            </div>
          </Link>

          {/* Badge rupture */}
          {disabled && (
            <div aria-hidden style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, fontWeight: 900,
              }}>Rupture</span>
            </div>
          )}

          {/* Badge Promotion */}
          {product.originalPrice && (
            <div aria-hidden style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none', zIndex: 10 }}>
              <span style={{
                padding: '6px 12px', borderRadius: 12,
                backgroundColor: '#FF3B30', color: '#fff', fontSize: 12, fontWeight: 900,
                boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5M3 18l18-5" />
                </svg>
                {product.discountType === 'PERCENTAGE' ? `-${product.discountValue}%` : `-${formatPriceWithCurrency(product.discountValue ?? 0)}`}
              </span>
            </div>
          )}

        </div>

        {/* ── Infos ── */}
        <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          {product.collection?.name && (
            <p style={{
              margin: '0 0 6px', fontSize: 11, fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase', color: accent,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {product.collection.name}
            </p>
          )}

          {/* Nom */}
          <p style={{
            margin: '0 0 10px', fontSize: 15, fontWeight: 800,
            color: hovered ? accent : '#111',
            lineHeight: 1.3, letterSpacing: '-0.3px',
            minHeight: '2.6em',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            transition: 'color 220ms ease',
          }}>
            {product.name}
          </p>

          {/* Prix */}
          <div style={{ margin: '0 0 14px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.originalPrice && (
              <span style={{ fontSize: 13, color: '#999', textDecoration: 'line-through', fontWeight: 600, marginLeft: 2 }}>
                {formatPriceWithCurrency(product.originalPrice)}
              </span>
            )}
            <p style={{ margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
              <span style={{ 
                fontSize: 24, 
                fontWeight: 900, 
                color: product.originalPrice ? '#FF3B30' : '#000', 
                letterSpacing: '-1px' 
              }}>
                {priceFormatted}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: product.originalPrice ? '#FF3B30' : '#888' }}>FCFA</span>
            </p>
          </div>

          <div style={{
            display: 'flex', gap: 8, alignItems: 'stretch',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            {/* Bouton principal */}
            <Link
              href={`/product/${encodeURIComponent(product.slug)}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Voir ${product.name}`}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: disabled ? 'rgba(0,0,0,0.07)' : '#000',
                color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
                fontSize: 13, fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
                transition: 'background-color 150ms ease',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block',
              }}
            >
              {disabled ? 'Épuisé' : 'Voir le produit'}
            </Link>

            {/* Bouton secondaire ↗ */}
            <Link
              href={`/product/${encodeURIComponent(product.slug)}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Voir ${product.name}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, flexShrink: 0,
                borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
                color: '#000',
                fontSize: 17,
                textDecoration: 'none',
                transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = '#000';
                el.style.color = '#fff';
                el.style.borderColor = '#000';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = '#fff';
                el.style.color = '#000';
                el.style.borderColor = 'rgba(0,0,0,0.15)';
              }}
            >
              ↗
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SimilarProducts({ products, accent, title = "Découvrez d'autres produits" }: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{ 
      margin: '48px 0 24px', 
      padding: '0 24px 24px',
      borderTop: '1px solid rgba(0,0,0,0.08)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 20, 
          fontWeight: 800, 
          color: '#0A0A0A', 
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ 
            width: 3, 
            height: 18, 
            borderRadius: 2, 
            background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' 
          }} />
          {title}
        </h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        margin: '0 -24px',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', // Hide scrollbar for Webkit
          msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
          paddingBottom: 8, // Space for scroll hint
        }}>
          {/* Scroll indicator styles */}
          <style>{`
            .similar-products-container::-webkit-scrollbar {
              display: none;
            }
            .similar-products-container {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            /* Scroll hint gradient */
            .similar-products-container::after {
              content: '';
              position: absolute;
              right: 0;
              top: 0;
              bottom: 8px;
              width: 40px;
              background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 100%);
              pointer-events: none;
              z-index: 10;
            }
          `}</style>
          
          {products.slice(0, 4).map((product) => (
            <SimilarProductCard 
              key={product.id} 
              product={product} 
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div style={{
        textAlign: 'center',
        marginTop: 12,
        fontSize: 12,
        color: 'rgba(0,0,0,0.5)',
        fontWeight: 500,
      }}>
        Faites défiler pour voir plus →
      </div>
    </section>
  );
}

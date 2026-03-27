/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo } from 'react';
import type { BrandProductCardItem } from './BrandProductCard';

type BrandGalleryProps = {
  products: BrandProductCardItem[];
  brandName: string;
};

// Fonction pour mélanger le tableau de produits
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction pour générer des hauteurs aléatoires
function getRandomHeight(): number {
  const heights = [160, 180, 200, 220, 240, 260, 280];
  return heights[Math.floor(Math.random() * heights.length)];
}

// Fonction pour obtenir l'URL de l'image aléatoire
function getRandomImage(product: BrandProductCardItem): string | null {
  if (!product.images || product.images.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * product.images.length);
  return product.images[randomIndex];
}

export function BrandGalleryNew({ products, brandName }: BrandGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Mélanger les produits à chaque chargement
  const shuffledProducts = useMemo(() => {
    return shuffleArray(products).map((product, index) => ({
      ...product,
      displayImage: getRandomImage(product),
      randomHeight: getRandomHeight(),
      isWide: Math.random() > 0.7, // 30% de chance d'être large
    }));
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{
      backgroundColor: '#000000',
      borderRadius: '24px',
      padding: '40px 20px',
      margin: '60px 0',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        color: '#ffffff',
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 900,
          letterSpacing: '-2px',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Galerie {brandName}
        </h2>
        <p style={{
          fontSize: '16px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Découvrez nos créations uniques
        </p>
      </div>

      {/* Grid Pinterest avec layout aléatoire */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        gridAutoFlow: 'dense',
      }}>
        {shuffledProducts.map((item, index) => {
          const isHovered = hoveredIndex === index;

          if (!item.displayImage) return null;

          return (
            <div
              key={`${item.id}-${index}`}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                cursor: 'pointer',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered 
                  ? '0 20px 40px rgba(255,59,48,0.3)' 
                  : '0 4px 20px rgba(0,0,0,0.3)',
                // Layout aléatoire
                ...(item.isWide && {
                  gridColumn: 'span 2',
                }),
                height: `${item.randomHeight}px`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                window.location.href = `/product/${item.slug}`;
              }}
            >
              {/* Image */}
              <img
                src={item.displayImage}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '16px',
                }}
                loading="lazy"
              />

              {/* Overlay au hover */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                  color: '#ffffff',
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: '4px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}>
                      Voir le produit →
                    </div>
                  </div>
                </div>
              )}

              {/* Badge stock */}
              {item.stock !== undefined && item.stock !== null && item.stock <= 5 && item.stock > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#FF3B30',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Plus que {item.stock}
                </div>
              )}

              {/* Badge épuisé */}
              {item.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Épuisé
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Boutons */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {products.length > 20 && (
          <button
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
          >
            Voir plus de photos
          </button>
        )}
      </div>
    </section>
  );
}

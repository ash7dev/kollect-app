/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo, useEffect } from 'react';

export type DiscoveryProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  stock?: number | null;
  brand: { slug: string; name: string };
};

type DiscoveryGalleryProps = {
  products: DiscoveryProduct[];
};

// Fonction pour mélanger aléatoirement
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
  const heights = [200, 240, 280, 320, 360, 400];
  return heights[Math.floor(Math.random() * heights.length)];
}

// Fonction pour obtenir toutes les images avec le contexte du produit
type FlatImageItem = {
  productId: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  productStock?: number | null;
  brandName: string;
  brandSlug: string;
  imageUrl: string;
};

export function DiscoveryGallery({ products }: DiscoveryGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Aplatir toutes les images de tous les produits, puis les mélanger
  const galleryItems = useMemo(() => {
    const allImages: FlatImageItem[] = [];
    
    products.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          allImages.push({
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            productPrice: product.price,
            productStock: product.stock,
            brandName: product.brand.name,
            brandSlug: product.brand.slug,
            imageUrl: img,
          });
        });
      }
    });

    return shuffleArray(allImages).map((item) => ({
      ...item,
      randomHeight: getRandomHeight(),
      isWide: Math.random() > 0.85, // 15% de chance d'être large
    }));
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{
      backgroundColor: '#ffffff',
      padding: '40px 20px',
      margin: '0 auto',
      maxWidth: '1600px',
    }}>
      {/* Grid Pinterest avec layout aléatoire */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        gridAutoFlow: 'dense',
      }}>
        {galleryItems.map((item, index) => {
          const isHovered = hoveredIndex === index;

          if (!item.imageUrl) return null;

          return (
            <div
              key={`${item.productId}-${index}`}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                cursor: 'pointer',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered 
                  ? '0 20px 40px rgba(255,59,48,0.3)' 
                  : '0 4px 12px rgba(0,0,0,0.05)',
                // Layout aléatoire
                ...(item.isWide && {
                  gridColumn: 'span 2',
                }),
                height: `${item.randomHeight}px`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                window.location.href = `/product/${item.productSlug}`;
              }}
            >
              {/* Image */}
              <img
                src={item.imageUrl}
                alt={item.productName}
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
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
                color: '#ffffff',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <div style={{ width: '100%' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '4px',
                    letterSpacing: '0.5px'
                  }}>
                    {item.brandName}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.productName}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 900,
                      color: '#FF3B30'
                    }}>
                      {item.productPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      Acheter →
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge épuisé (Stock) */}
              {item.productStock === 0 && (
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
    </section>
  );
}

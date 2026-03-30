/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { BrandProductCardItem } from './BrandProductCard';

type BrandGalleryProps = {
  products: BrandProductCardItem[];
  brandName: string;
};

// Fonction pour générer des hauteurs et largeurs aléatoires style Pinterest
function generateRandomDimensions(index: number, seed: number): { height: number; width: string } {
  const heights = [200, 240, 280, 320, 360, 400, 440, 480];
  const widths = ['normal', 'wide', 'tall']; // normal, 2x largeur, 2x hauteur
  
  // Utiliser le seed pour la reproductibilité
  const random = (n: number) => {
    const x = Math.sin(n + seed) * 10000;
    return x - Math.floor(x);
  };
  
  const height = heights[Math.floor(random(index) * heights.length)];
  const widthType = widths[Math.floor(random(index + 100) * widths.length)];
  
  return {
    height,
    width: widthType === 'wide' ? 'span 2' : widthType === 'tall' ? 'span 1' : 'span 1'
  };
}

// Fonction pour mélanger le tableau de produits
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = (n: number) => {
    const x = Math.sin(n + seed) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Fonction pour obtenir l'URL de l'image
function getImageUrl(product: BrandProductCardItem, imageIndex: number = 0): string | null {
  if (!product.images || product.images.length === 0) return null;
  return product.images[imageIndex % product.images.length];
}

export function BrandGallery({ products, brandName }: BrandGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Générer un seed aléatoire à chaque chargement de composant
  const [seed] = useState(() => Math.floor(Math.random() * 10000));
  
  // Observer pour détecter quand la galerie est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('brand-gallery');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);
  
  // Mélanger les produits et générer les dimensions
  const galleryItems = useMemo(() => {
    const shuffledProducts = shuffleArray(products, seed);
    
    return shuffledProducts.map((product, index) => {
      const dimensions = generateRandomDimensions(index, seed);
      const imageIndex = Math.floor(Math.random() * (product.images?.length || 1));
      
      return {
        ...product,
        ...dimensions,
        displayImage: getImageUrl(product, imageIndex),
        originalIndex: products.indexOf(product)
      };
    });
  }, [products, seed]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section 
      id="brand-gallery"
      style={{
        backgroundColor: '#000000',
        borderRadius: '24px',
        padding: '40px 20px',
        margin: '60px 0',
        position: 'relative',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes fadeInStagger {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .gallery-item {
          opacity: 0;
          animation: fadeInStagger 0.6s ease-out forwards;
        }
        
        .gallery-header {
          opacity: 0;
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          grid-auto-flow: dense;
          position: relative;
        }
        
        @media (max-width: 1200px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }
        
        @media (max-width: 900px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }
        }
        
        @media (max-width: 600px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }
        }
        
        @media (max-width: 400px) {
          .gallery-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .gallery-item,
          .gallery-header {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      {/* Header */}
      <div 
        className={isVisible ? 'gallery-header' : ''}
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#ffffff',
          animationDelay: isVisible ? '0.2s' : '0s',
        }}
      >
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

      {/* Masonry Grid Style Pinterest avec layout aléatoire */}
      <div className="gallery-grid">
        {galleryItems.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const staggerDelay = 0.1 + (index * 0.05); // Délai progressif

          if (!item.displayImage) return null;

          return (
            <div
              key={`${item.id}-${index}`}
              className={isVisible ? 'gallery-item' : ''}
              style={{
                breakInside: 'avoid',
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
                ...(item.width === 'span 2' && {
                  gridColumn: 'span 2',
                }),
                height: `${item.height}px`,
                animationDelay: isVisible ? `${staggerDelay}s` : '0s',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                // Rediriger vers la page du produit
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

              {/* Badge rapide (optionnel) */}
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
    </section>
  );
}

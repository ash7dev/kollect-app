'use client';

import { useState, useEffect } from 'react';
import type { BrandProductCardItem } from '@/components/brands/brand-shop/BrandProductCard';
import { BrandProductCard } from '@/components/brands/brand-shop/BrandProductCard';

type BrandProductsGridProps = {
  brandSlug: string;
  brandName?: string;
  products: BrandProductCardItem[];
  accent: string;
};

/** Découpe un tableau en rangées de N éléments */
function chunkBy<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
}

export function BrandProductsGrid({ brandSlug, brandName, products, accent }: BrandProductsGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Observer pour détecter quand la grille est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('products-grid');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  if (!products.length) return null;

  const rows = chunkBy(products, 4);

  return (
    <div 
      id="products-grid"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 20,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes rowSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .products-row {
          opacity: 0;
          animation: rowSlideIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .products-row {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      {rows.map((row, rowIndex) => {
        const isLastIncomplete = rowIndex === rows.length - 1 && row.length < 4;
        const rowDelay = 0.2 + (rowIndex * 0.1); // Délai progressif par rangée

        return (
          <div
            key={rowIndex}
            className={isVisible ? 'products-row' : ''}
            style={{
              display: 'flex',
              gap: 20,
              // Rangée complète : étirer les 4 cards sur toute la largeur
              // Rangée incomplète : centrer les cards (1, 2 ou 3) sans les étirer
              justifyContent: isLastIncomplete ? 'center' : 'stretch',
              animationDelay: isVisible ? `${rowDelay}s` : '0s',
            }}
          >
            {row.map((p) => (
              <div
                key={p.id}
                style={{
                  // Chaque card occupe exactement 1/4 de la largeur disponible (gaps inclus)
                  flex: isLastIncomplete ? '0 0 calc(25% - 15px)' : '1 1 0',
                  minWidth: 0,
                }}
              >
                <BrandProductCard brandSlug={brandSlug} brandName={brandName} product={p} accent={accent} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
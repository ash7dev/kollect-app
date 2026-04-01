'use client';

import { useState, useEffect } from 'react';
import type { BrandProductCardItem } from '@/components/brands/brand-shop/BrandProductCard';
import { BrandProductCard } from '@/components/brands/brand-shop/BrandProductCard';

type BrandProductsGridProps = {
  brandSlug: string;
  brandName?: string;
  products: BrandProductCardItem[];
  accent: string;
  isTeaser?: boolean;
};

export function BrandProductsGrid({ brandSlug, brandName, products, accent, isTeaser }: BrandProductsGridProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const element = document.getElementById('products-grid');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!products.length) return null;

  const cols = Math.min(products.length, 4);
  const cardWidth = Math.floor((1200 - 20 * 3) / 4);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      <style>{`
        .brand-products-grid {
          display: grid;
          grid-template-columns: repeat(${cols}, ${cardWidth}px);
          justify-content: center;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .brand-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          #products-grid { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
      <div id="products-grid" className="brand-products-grid">

      {products.map((p) => (
        <div key={p.id}>
          <BrandProductCard
            brandSlug={brandSlug}
            brandName={brandName}
            product={p}
            accent={accent}
            isTeaser={isTeaser}
          />
        </div>
      ))}
      </div>
    </div>
  );
}

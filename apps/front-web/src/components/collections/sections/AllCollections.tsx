'use client';

import { useState, useEffect } from 'react';
import { BrandCollectionCards } from '@/components/brands/brand-shop/BrandCollectionCards';
import type { PublicCollection } from '@/types/drops';

type AllCollectionsProps = {
  collections: PublicCollection[];
};


export function AllCollections({ collections }: AllCollectionsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('all-collections');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section 
      id="all-collections"
      style={{
        padding: '80px 40px',
        backgroundColor: '#fafafa',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes allSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(25px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .all-card {
          opacity: 0;
          animation: allSlideIn 0.5s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .all-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: 999,
            border: '2px solid rgba(0,0,0,0.1)',
            backgroundColor: 'rgba(0,0,0,0.02)',
            color: 'rgba(0,0,0,0.6)',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Catalogue
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#000',
            margin: '0 0 16px',
            textTransform: 'uppercase',
          }}>
            Toutes les Collections
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.1rem)',
            lineHeight: 1.6,
            color: 'rgba(0,0,0,0.5)',
            margin: 0,
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Explorez l&apos;ensemble de notre catalogue de collections
          </p>
        </div>

        {/* Grid */}
        <BrandCollectionCards
          accent="#FF3B30"
          collections={collections.map(c => ({
            name: c.name,
            slug: c.slug,
            coverImage: c.coverImage,
            coverImageFallback: c.products?.[0]?.images?.[0] ?? null,
            href: `/brand/${c.brand.slug}/${c.slug}`,
            productCount: c._count?.products ?? 0,
            products: [],
          }))}
        />

        {/* Load More (optionnel pour plus tard) */}
        {collections.length > 12 && (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <button
              style={{
                padding: '14px 32px',
                borderRadius: 999,
                border: '2px solid #000',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.color = '#fff';
              }}
            >
              Charger Plus
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { BrandCollectionCards } from '@/components/brands/brand-shop/BrandCollectionCards';
import type { PublicCollection } from '@/types/drops';

type ComingSoonCollectionsProps = {
  collections: PublicCollection[];
};

export function ComingSoonCollections({ collections }: ComingSoonCollectionsProps) {
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

    const element = document.getElementById('coming-soon-collections');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section 
      id="coming-soon-collections"
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
        @keyframes teaserSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .teaser-card {
          opacity: 0;
          animation: teaserSlideIn 0.7s ease-out forwards;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .coming-soon-badge {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,136,0,0.3),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .teaser-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .coming-soon-badge {
            animation: none;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 20px',
            borderRadius: 999,
            border: '2px solid #FF8800',
            backgroundColor: '#FF880008',
            marginBottom: 20,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#FF8800',
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#FF8800',
            }}>
              À Venir
            </span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#000',
            margin: '0 0 16px',
            textTransform: 'uppercase',
          }}>
            Bientôt Disponibles
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
            Soyez les premiers à découvrir nos prochaines collections exclusives
          </p>
        </div>

        {/* Grid */}
        <BrandCollectionCards
          accent="#FF8800"
          collections={collections.map(c => ({
            name: c.name,
            slug: c.slug,
            coverImage: c.coverImage,
            href: `/brand/${c.brand.slug}/${c.slug}`,
            productCount: c._count?.products ?? 0,
            products: [],
          }))}
        />

        {/* Notification CTA */}
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '32px',
            borderRadius: 20,
            backgroundColor: '#fff',
            border: '2px solid rgba(255,136,0,0.2)',
            boxShadow: '0 8px 32px rgba(255,136,0,0.1)',
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#000',
              marginBottom: 8,
            }}>
              Ne manquez aucune sortie
            </div>
            <p style={{
              fontSize: 14,
              color: 'rgba(0,0,0,0.6)',
              margin: '0 0 20px',
              textAlign: 'center',
            }}>
              Recevez une notification dès qu&apos;une nouvelle collection est disponible
            </p>
            <button
              style={{
                padding: '14px 32px',
                borderRadius: 999,
                border: '2px solid #FF8800',
                backgroundColor: '#FF8800',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(255,136,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FF8800';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF8800';
                e.currentTarget.style.color = '#fff';
              }}
            >
              S&apos;inscrire aux Notifications
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

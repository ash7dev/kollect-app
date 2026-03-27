'use client';

import { useState, useEffect } from 'react';

type BrandReviewsProps = {
  accent: string;
};

const REVIEWS = [
  {
    stars: 5,
    text: 'Livraison rapide et produit authentique. Je recommande !',
    author: 'Amadou D.',
    date: 'Il y a 3 jours',
  },
  {
    stars: 5,
    text: 'Le confort est incroyable. Service client au top, ils ont répondu en 5 minutes.',
    author: 'Fatou S.',
    date: 'Il y a 1 semaine',
  },
  {
    stars: 5,
    text: 'Ma deuxième commande. Qualité irréprochable, je reviendrai.',
    author: 'Ibrahima N.',
    date: 'Il y a 2 semaines',
  },
];

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24"
          fill={i < count ? color : 'none'}
          stroke={i < count ? color : 'rgba(0,0,0,0.15)'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function BrandReviews({ accent }: BrandReviewsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const avgRating = (REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length).toFixed(1);

  // Observer pour détecter quand les reviews sont visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('brand-reviews');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="brand-reviews"
      style={{ 
        padding: '80px 28px', 
        backgroundColor: '#fafafa',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes reviewSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .review-card {
          opacity: 0;
          animation: reviewSlideIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .review-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '5px 14px', borderRadius: 999,
              border: `1px solid ${accent}`,
              color: accent,
              fontSize: 10, fontWeight: 900, letterSpacing: '2.5px',
              textTransform: 'uppercase', marginBottom: 16,
            }}>
              Témoignages
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 900, letterSpacing: '-1px',
              color: '#000', margin: 0,
            }}>
              Avis clients
            </h2>
          </div>

          {/* Score global */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 24px', borderRadius: 18,
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <div>
              <p style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '-2px', color: '#000', lineHeight: 1 }}>
                {avgRating}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', margin: '4px 0 0', letterSpacing: '0.5px' }}>
                sur 5 · {REVIEWS.length} avis
              </p>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.08)' }} />
            <div>
              <Stars count={5} color="#F5A623" />
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.35)', margin: '5px 0 0' }}>
                100% recommandent
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          className="brand-reviews-grid"
        >
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className={isVisible ? 'review-card' : ''}
              style={{
                padding: '28px 24px',
                borderRadius: 20,
                backgroundColor: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'transform 220ms ease, box-shadow 220ms ease',
                animationDelay: isVisible ? `${0.2 + (i * 0.1)}s` : '0s',
              }}
            >
              <Stars count={r.stars} color="#F5A623" />

              <p style={{
                fontSize: 14, lineHeight: 1.75,
                color: 'rgba(0,0,0,0.7)', margin: 0,
                fontStyle: 'italic',
                flexGrow: 1,
              }}>
                &ldquo;{r.text}&rdquo;
              </p>

              <div style={{
                paddingTop: 16,
                borderTop: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Avatar initiales */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: `${accent}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, color: accent,
                    flexShrink: 0,
                  }}>
                    {r.author.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 900, margin: 0, color: '#000' }}>
                    {r.author}
                  </p>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', margin: 0, fontWeight: 600 }}>
                  {r.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .brand-review-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.09) !important;
        }
        @media (max-width: 768px) {
          .brand-reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

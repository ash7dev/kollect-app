'use client';

import { useState, useEffect } from 'react';

type BrandTrustBadgesProps = {
  brandName: string;
  accent: string;
  whatsapp?: string | null;
};

const BADGES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Produits authentiques',
    desc: '100 % originaux, garantis par la marque.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Livraison rapide',
    desc: 'Dakar et banlieue, livré en 1–2 h.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Qualité premium',
    desc: 'Pièces sélectionnées avec soin.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Service client',
    desc: 'Disponible via WhatsApp 7j/7.',
  },
];

export function BrandTrustBadges({ brandName, accent, whatsapp }: BrandTrustBadgesProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Observer pour détecter quand les badges sont visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('trust-badges');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="trust-badges"
      style={{ 
        padding: '80px 28px', 
        backgroundColor: '#fff',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes trustBadgeSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(25px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .trust-badge-card {
          opacity: 0;
          animation: trustBadgeSlideIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .trust-badge-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            padding: '5px 14px', borderRadius: 999,
            border: `1px solid ${accent}`,
            color: accent,
            fontSize: 10, fontWeight: 900, letterSpacing: '2.5px',
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            Pourquoi nous choisir
          </span>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 900, letterSpacing: '-1px',
            color: '#000', margin: 0,
          }}>
            Pourquoi {brandName} ?
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}
          className="brand-trust-grid"
        >
          {BADGES.map((b, i) => (
            <div
              key={i}
              className={isVisible ? 'trust-badge-card' : ''}
              style={{
                padding: '32px 28px',
                borderRadius: 20,
                backgroundColor: '#f8f8f8',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'transform 220ms ease, box-shadow 220ms ease',
                animationDelay: isVisible ? `${0.2 + (i * 0.1)}s` : '0s',
              }}
            >
              {/* Icon bubble */}
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: `${accent}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent,
              }}>
                {b.icon}
              </div>

              <div>
                <p style={{
                  fontSize: 15, fontWeight: 900,
                  color: '#000', margin: '0 0 8px',
                  letterSpacing: '-0.3px',
                }}>
                  {b.title}
                </p>
                <p style={{
                  fontSize: 13, color: 'rgba(0,0,0,0.5)',
                  lineHeight: 1.65, margin: 0,
                }}>
                  {i === 3 && whatsapp
                    ? `Répondez-nous sur WhatsApp.`
                    : b.desc}
                </p>
              </div>

              {/* Accent line bottom */}
              <div style={{
                marginTop: 'auto',
                height: 2, borderRadius: 999,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                opacity: 0.35,
              }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .brand-trust-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }
        @media (max-width: 900px) {
          .brand-trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .brand-trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

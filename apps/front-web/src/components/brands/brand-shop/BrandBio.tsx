'use client';

import { useState, useEffect } from 'react';

type BrandBioProps = {
  bio: string;
  accent: string;
};

export function BrandBio({ bio, accent }: BrandBioProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Observer pour détecter quand la bio est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('brand-bio');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="brand-bio"
      style={{ 
        padding: '72px 40px', 
        backgroundColor: '#fff',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes bioSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes bioLineGrow {
          from { width: 0; }
          to { width: 40px; }
        }
        
        .bio-content {
          opacity: 0;
          animation: bioSlideIn 0.6s ease-out forwards;
        }
        
        .bio-line {
          width: 0;
          animation: bioLineGrow 0.8s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .bio-content,
          .bio-line {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .bio-line {
            width: 40px;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 64,
          alignItems: 'center',
        }}
          className="brand-bio-grid"
        >
          {/* Left — label */}
          <div className={isVisible ? 'bio-content' : ''} style={{ animationDelay: '0.1s' }}>
            <div 
              className={isVisible ? 'bio-line' : ''}
              style={{
                width: 40, height: 3, borderRadius: 999,
                backgroundColor: accent,
                marginBottom: 20,
                animationDelay: '0.2s',
              }}
            />
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '3px',
              textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
              margin: 0,
            }}>
              À propos
            </p>
          </div>

          {/* Right — bio text */}
          <div className={isVisible ? 'bio-content' : ''} style={{ animationDelay: '0.3s' }}>
            <p style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              lineHeight: 1.85,
              color: 'rgba(0,0,0,0.55)',
            margin: 0,
            fontWeight: 400,
          }}>
            {bio}
          </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .brand-bio-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}

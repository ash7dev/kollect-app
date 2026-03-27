'use client';

import { useState, useEffect } from 'react';

export function CollectionsHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '60vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes heroSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes patternMove {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
        
        .hero-content {
          opacity: 0;
          animation: heroSlideIn 0.8s ease-out forwards;
        }
        
        .hero-pattern {
          background-image: 
            linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%);
          background-size: 40px 40px;
          background-position: 0 0;
          animation: patternMove 20s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .hero-content {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .hero-pattern {
            animation: none;
          }
        }
      `}</style>

      {/* Background Pattern */}
      <div 
        className="hero-pattern"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
        }}
      />

      {/* Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Content */}
      <div 
        className="hero-content"
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: '#fff',
          padding: '0 20px',
          maxWidth: 1200,
        }}
      >
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.05)',
          marginBottom: 24,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          animationDelay: '0.2s',
        }}>
          Marketplace
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 900,
          letterSpacing: '-4px',
          lineHeight: 0.9,
          margin: '0 0 24px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animationDelay: '0.3s',
        }}>
          Collections
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
          fontWeight: 400,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 40px',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
          animationDelay: '0.4s',
        }}>
          Découvrez les sélections exclusives de nos marques partenaires et explorez les dernières tendances streetwear
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          animationDelay: '0.5s',
        }}>
          <button
            onClick={() => {
              const element = document.getElementById('featured-collections');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '14px 32px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            }}
          >
            Explorer les Vedettes
          </button>

          <button
            onClick={() => {
              const element = document.getElementById('all-collections');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '14px 32px',
              borderRadius: 999,
              border: '1.5px solid rgba(255,255,255,0.3)',
              backgroundColor: 'transparent',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            Toutes les Collections
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.6,
          animationDelay: '1s',
        }}
      >
        <div style={{
          width: 2,
          height: 40,
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: 2,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#fff',
            borderRadius: 2,
            animation: 'pulse 2s infinite',
          }} />
        </div>
      </div>
    </section>
  );
}

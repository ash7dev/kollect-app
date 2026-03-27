'use client';

import { useFollowBrand } from '@/hooks/useFollowBrand';
import { useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type BrandShopBannerProps = {
  brandId: string;
  brandName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  accent: string;
  collectionsCount?: number;
  productsCount?: number;
  followerCount?: number;
  isVerified?: boolean;
};

export function BrandShopBanner({
  brandId,
  brandName,
  logoUrl,
  bannerUrl,
  accent,
  collectionsCount,
  productsCount,
  followerCount: initialFollowerCount = 0,
  isVerified,
}: BrandShopBannerProps) {
  const { isFollowing, followerCount, toggle, isLoading } = useFollowBrand(brandId, initialFollowerCount);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="accueil"
      aria-label={`Boutique de la marque ${brandName}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#070707',
        minHeight: '78vh',
        marginTop: 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderRadius: '0 0 32px 32px',
      }}
    >
      {/* Animations CSS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        
        .pulse-hover:hover {
          animation: pulse 0.3s ease-in-out;
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
      {/* ── Background full-bleed ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            aria-hidden
            className={isVisible ? 'fade-in-up' : ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'brightness(0.72) saturate(1.1)',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.8s ease-out',
            }}
          />
        ) : (
          <div
            aria-hidden
            className={isVisible ? 'shimmer' : ''}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(145deg, ${accent}44, #000)`,
            }}
          />
        )}

        {/* Gradient overlay — assombrit le bas pour la lisibilité */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.88) 100%)',
          }}
        />
      </div>

      {/* ── Contenu ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '52px 40px 52px',
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {isVerified && (
          <p className={isVisible ? 'slide-in-left' : ''} style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '2.5px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            margin: '0 0 14px',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.2s',
          }}>
            ✓ Marque vérifiée
          </p>
        )}

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className={isVisible ? 'scale-in pulse-hover' : ''}
              style={{
                width: 64, height: 64, borderRadius: 18, objectFit: 'cover',
                border: '2.5px solid rgba(255,255,255,0.2)',
                boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 4px ${accent}22`,
                flexShrink: 0,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-out 0.3s, transform 0.3s ease',
              }}
            />
          )}
          <h1 className={isVisible ? 'slide-in-left' : ''} style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1,
            color: '#fff',
            margin: 0,
            textTransform: 'uppercase',
            textShadow: '0 8px 48px rgba(0,0,0,0.5)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.4s',
          }}>
            {brandName}
          </h1>
        </div>

        {/* Badges + Follow */}
        <div className={isVisible ? 'fade-in-up' : ''} style={{ 
          marginTop: 20, 
          display: 'flex', 
          gap: 8, 
          flexWrap: 'wrap', 
          alignItems: 'center',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.6s',
          fontFamily: FONT_FAMILY_INTER,
        }}>
          {typeof productsCount === 'number' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.13)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 12, fontWeight: 800,
              fontFamily: FONT_FAMILY_INTER,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {productsCount} produit{productsCount > 1 ? 's' : ''}
            </span>
          )}
          {typeof collectionsCount === 'number' && collectionsCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.13)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 12, fontWeight: 800,
              fontFamily: FONT_FAMILY_INTER,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {collectionsCount} collection{collectionsCount > 1 ? 's' : ''}
            </span>
          )}

          {/* Follow button + count */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => void toggle()}
              disabled={isLoading}
              className="pulse-hover"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 20px', borderRadius: 999,
                border: isFollowing
                  ? '1.5px solid rgba(255,255,255,0.35)'
                  : 'none',
                backgroundColor: isFollowing ? 'transparent' : '#fff',
                color: isFollowing ? '#fff' : '#000',
                fontSize: 12, fontWeight: 900,
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 220ms ease',
                letterSpacing: '0.3px',
                boxShadow: isFollowing ? 'none' : '0 2px 12px rgba(0,0,0,0.25)',
                fontFamily: FONT_FAMILY_INTER,
              }}
            >
              {isFollowing ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Abonné
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  S&apos;abonner
                </>
              )}
            </button>

            {followerCount >= 10 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.2px',
                fontFamily: FONT_FAMILY_INTER,
              }}>
                {new Intl.NumberFormat('fr-FR').format(followerCount)} abonnés
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div
        aria-hidden
        className={isVisible ? 'shimmer' : ''}
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: isVisible ? 0.85 : 0,
          zIndex: 2,
          transition: 'opacity 0.8s ease-out 1s',
        }}
      />
    </section>
  );
}

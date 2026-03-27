'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { BrandCartModal } from '@/components/brands/brand-shop/BrandCartModal';

type BrandFloatingCartProps = {
  brandSlug: string;
  brandName: string;
  accent: string;
};

export function BrandFloatingCart({ brandSlug, brandName, accent }: BrandFloatingCartProps) {
  const [visible, setVisible] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const totalQty = useBrandCartStore((s) => s.getTotalQuantity(brandSlug));
  const badge = useMemo(() => (totalQty > 99 ? '99+' : String(totalQty)), [totalQty]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 280);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Animations CSS */}
      <style>{`
        @keyframes cartSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes cartBadgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .floating-cart {
          opacity: 0;
          animation: cartSlideIn 0.4s ease-out forwards;
        }
        
        .cart-badge-pulse {
          animation: cartBadgePulse 2s infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .floating-cart {
            opacity: 1;
            transform: none;
            animation: none;
          }
          .cart-badge-pulse {
            animation: none;
          }
        }
      `}</style>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`Ouvrir le panier de ${brandName}`}
        className={visible ? 'floating-cart' : ''}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 24,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 52,
          padding: totalQty > 0 ? '0 20px 0 16px' : '0 16px',
          borderRadius: 26,
          border: 'none',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease, background-color 200ms ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#222';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0a0a0a';
        }}
      >
        {/* Cart icon */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 3H2" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
          </svg>

          {/* Badge — n'apparait que si pas de label (panier vide mais bouton visible) */}
          {totalQty === 0 && (
            <span
              aria-hidden
              className={totalQty > 0 ? 'cart-badge-pulse' : ''}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 16,
                height: 16,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(255,255,255,0.15)',
              }}
            />
          )}
        </div>

        {/* Label avec quantité */}
        {totalQty > 0 ? (
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>
            {badge} article{totalQty > 1 ? 's' : ''} —{' '}
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 13 }}>voir panier</span>
          </span>
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            Panier vide
          </span>
        )}

        {/* Accent dot quand il y a des articles */}
        {totalQty > 0 && (
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: accent,
              flexShrink: 0,
              boxShadow: `0 0 8px ${accent}99`,
            }}
          />
        )}
      </button>

      <BrandCartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        brandSlug={brandSlug}
        brandName={brandName}
        accent={accent}
      />
    </>
  );
}

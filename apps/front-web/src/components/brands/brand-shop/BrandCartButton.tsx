'use client';

import { useMemo, useState } from 'react';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { BrandCartModal } from '@/components/brands/brand-shop/BrandCartModal';

type BrandCartButtonProps = {
  brandSlug: string;
  brandName: string;
};

export function BrandCartButton({ brandSlug, brandName }: BrandCartButtonProps) {
  const totalQty = useBrandCartStore((s) => s.getTotalQuantity(brandSlug));
  const [open, setOpen] = useState(false);

  const badge = useMemo(() => (totalQty > 99 ? '99+' : String(totalQty)), [totalQty]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le panier"
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          zIndex: 1500,
          width: 52,
          height: 52,
          borderRadius: 18,
          border: '1px solid rgba(0,0,0,0.10)',
          backgroundColor: '#fff',
          boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 3H2" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
          </svg>

          {totalQty > 0 && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                minWidth: 26,
                height: 22,
                padding: '0 7px',
                borderRadius: 999,
                backgroundColor: '#FF3B30',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </button>

      <BrandCartModal open={open} onClose={() => setOpen(false)} brandSlug={brandSlug} brandName={brandName} />
    </>
  );
}


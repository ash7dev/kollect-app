/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { useAuth } from '@/providers/AuthProvider';
import { AuthRequiredModal } from './AuthRequiredModal';
import { CheckoutModal } from './CheckoutModal';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { formatColorName } from '@/utils/colorUtils';

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' CFA';
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px', textAlign: 'center', gap: 20,
    }}>
      {/* Bag icon */}
      <div style={{
        width: 88, height: 88, borderRadius: 28,
        background: 'linear-gradient(145deg, #F3F4F6, #E9EAEC)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <div>
        <p style={{ fontSize: 17, fontWeight: 900, margin: '0 0 8px', color: '#0A0A0A', letterSpacing: '-0.4px' }}>
          Panier vide
        </p>
        <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.42)', margin: 0, lineHeight: 1.65, maxWidth: 220 }}>
          Découvre nos drops et ajoute tes pièces préférées.
        </p>
      </div>

      <Link
        href="/explorer"
        onClick={onClose}
        style={{
          marginTop: 4,
          padding: '12px 28px', borderRadius: 14,
          background: '#0A0A0A', color: '#fff',
          fontSize: 13, fontWeight: 800, textDecoration: 'none',
          letterSpacing: '-0.2px',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        Explorer
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

// ─── Cart item row ────────────────────────────────────────────────────────────

function CartItemRow({
  item, brandSlug,
  onQtyChange, onRemove, onVariantChange,
}: {
  item: import('@/stores/brandCartStore').BrandCartItem;
  brandSlug: string;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
  onVariantChange: (size?: string | null, color?: string | null) => void;
}) {
  const maxReached = typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock;

  return (
    <div style={{
      display: 'flex', gap: 14,
      padding: '14px',
      borderRadius: 18,
      background: '#fff',
      border: '1.5px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* Image */}
      <Link
        href={`/product/${encodeURIComponent(item.slug)}`}
        style={{
          display: 'block', flexShrink: 0,
          width: 76, height: 76, borderRadius: 12,
          overflow: 'hidden', background: '#F3F4F6',
        }}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg,#F3F4F6,#E9EAEC)' }} />
        )}
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 800,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#0A0A0A',
            letterSpacing: '-0.2px',
          }}>
            {item.name}
          </p>
          {/* Remove */}
          <button
            type="button" onClick={onRemove} aria-label="Retirer"
            className="gcd-rm-btn"
            style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 8,
              border: '1.5px solid rgba(0,0,0,0.09)', background: '#FAFAFA',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2.3" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 15, fontWeight: 900, letterSpacing: '-0.5px', color: '#0A0A0A' }}>
          {fmtPrice(item.price * item.quantity)}
        </p>

        {/* Variants */}
        {((item.availableSizes && item.availableSizes.length > 1) ||
          (item.availableColors && item.availableColors.length > 1)) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {item.availableSizes && item.availableSizes.length > 1 && (
              <select
                value={item.selectedSize ?? ''}
                onChange={e => onVariantChange(e.target.value || null, undefined)}
                style={{
                  padding: '3px 8px', borderRadius: 8,
                  border: `1.5px solid ${item.selectedSize ? 'rgba(0,0,0,0.12)' : '#EF4444'}`,
                  fontSize: 11, fontWeight: 700, background: '#F5F5F5',
                  cursor: 'pointer', fontFamily: FONT_FAMILY_INTER, outline: 'none', color: '#111',
                }}
              >
                <option value="">Taille…</option>
                {item.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {item.availableColors && item.availableColors.length > 1 && (
              <select
                value={item.selectedColor ?? ''}
                onChange={e => onVariantChange(undefined, e.target.value || null)}
                style={{
                  padding: '3px 8px', borderRadius: 8,
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  fontSize: 11, fontWeight: 700, background: '#F5F5F5',
                  cursor: 'pointer', fontFamily: FONT_FAMILY_INTER, outline: 'none', color: '#111',
                }}
              >
                <option value="">Couleur…</option>
                {item.availableColors.map(c => <option key={c} value={c}>{formatColorName(c)}</option>)}
              </select>
            )}
          </div>
        )}

        {/* Qty stepper */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.09)',
          background: '#FAFAFA', overflow: 'hidden', alignSelf: 'flex-start',
        }}>
          <button
            type="button"
            onClick={() => onQtyChange(item.quantity - 1)}
            style={{
              width: 30, height: 30, border: 'none', background: 'transparent',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', color: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >−</button>
          <span style={{
            minWidth: 26, textAlign: 'center',
            fontSize: 13, fontWeight: 900, lineHeight: '30px',
            borderLeft: '1px solid rgba(0,0,0,0.07)',
            borderRight: '1px solid rgba(0,0,0,0.07)',
          }}>
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={maxReached}
            onClick={() => onQtyChange(item.quantity + 1)}
            style={{
              width: 30, height: 30, border: 'none', background: 'transparent',
              fontSize: 16, fontWeight: 700, cursor: maxReached ? 'not-allowed' : 'pointer',
              color: '#0A0A0A', opacity: maxReached ? 0.3 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >+</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GlobalCartDrawer() {
  const cartOpen  = useBrandCartStore(s => s.cartOpen);
  const closeCart = useBrandCartStore(s => s.closeCart);
  const itemsByBrand  = useBrandCartStore(s => s.itemsByBrand);
  const setQuantity   = useBrandCartStore(s => s.setQuantity);
  const removeItem    = useBrandCartStore(s => s.removeItem);
  const clearBrand    = useBrandCartStore(s => s.clearBrand);
  const clearAll      = useBrandCartStore(s => s.clearAll);
  const updateVariant = useBrandCartStore(s => s.updateVariant);
  const getActiveBrandInfo = useBrandCartStore(s => s.getActiveBrandInfo);

  const { user, isInitialized } = useAuth();
  const [visible, setVisible]       = useState(false);
  const [showAuth, setShowAuth]     = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const brandInfo = getActiveBrandInfo();
  const items     = brandInfo ? (itemsByBrand[brandInfo.slug] ?? []) : [];
  const subtotal  = items.reduce((s, x) => s + x.quantity * x.price, 0);
  const isEmpty   = items.length === 0;

  // Slide animation
  useEffect(() => {
    if (cartOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [cartOpen]);

  // Escape + scroll lock
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen && !showAuth && !showCheckout) return null;

  const handleCommander = () => {
    if (!isInitialized) return;
    closeCart();
    if (!user) { setShowAuth(true); return; }
    setShowCheckout(true);
  };

  const handleClear = () => {
    clearAll();
    toast.message('Panier vidé');
  };

  return (
    <>
      <style>{`
        @keyframes gcd-in { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
        .gcd-rm-btn:hover { background:#FEE2E2 !important; border-color:#FCA5A5 !important; }
        .gcd-rm-btn:hover svg { stroke:#EF4444 !important; }
        .gcd-clear-btn:hover { background:rgba(239,68,68,0.07) !important; color:#EF4444 !important; }
        .gcd-order-btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 12px 32px rgba(0,0,0,0.22) !important; }
      `}</style>

      {/* Drawer + backdrop — seulement quand cartOpen */}
      {cartOpen && (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: visible ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(6px)' : 'none',
          WebkitBackdropFilter: visible ? 'blur(6px)' : 'none',
          transition: 'background 300ms ease, backdrop-filter 300ms ease',
        }}
        onMouseDown={e => { if (e.target === e.currentTarget) closeCart(); }}
      >
        {/* Drawer panel */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 'min(440px, 100%)',
          background: '#F7F8FA',
          display: 'flex', flexDirection: 'column',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 360ms cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.18)',
          borderRadius: '20px 0 0 20px',
          overflow: 'hidden',
          fontFamily: FONT_FAMILY_INTER,
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: '20px 20px 16px',
            background: '#fff',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Bag icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: '#0A0A0A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 900, letterSpacing: '-0.5px', color: '#0A0A0A' }}>
                    Mon panier
                  </p>
                  {brandInfo && !isEmpty && (
                    <p style={{ margin: '1px 0 0', fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.38)' }}>
                      {brandInfo.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Count badge + close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!isEmpty && (
                  <span style={{
                    padding: '4px 10px', borderRadius: 20,
                    background: '#0A0A0A', color: '#fff',
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.3px',
                  }}>
                    {items.reduce((s, x) => s + x.quantity, 0)} article{items.reduce((s, x) => s + x.quantity, 0) > 1 ? 's' : ''}
                  </span>
                )}
                <button
                  type="button" onClick={closeCart} aria-label="Fermer le panier"
                  style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    border: '1.5px solid rgba(0,0,0,0.09)', background: '#F7F8FA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Items ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {isEmpty ? (
              <EmptyCart onClose={closeCart} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    brandSlug={brandInfo!.slug}
                    onQtyChange={qty => setQuantity(brandInfo!.slug, item.productId, qty)}
                    onRemove={() => removeItem(brandInfo!.slug, item.productId)}
                    onVariantChange={(size, color) => updateVariant(brandInfo!.slug, item.productId, size, color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {!isEmpty && (
            <div style={{
              padding: '16px 16px 24px',
              background: '#fff',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {/* Subtotal row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '4px 2px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Sous-total
                </span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px' }}>
                  {fmtPrice(subtotal)}
                </span>
              </div>

              {/* Commander */}
              <button
                type="button"
                onClick={handleCommander}
                className="gcd-order-btn"
                style={{
                  width: '100%', padding: '15px 20px', borderRadius: 16,
                  border: 'none',
                  background: '#0A0A0A',
                  color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  letterSpacing: '-0.3px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  transition: 'filter 0.15s, transform 0.15s, box-shadow 0.15s',
                }}
              >
                Commander
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              {/* Vider */}
              <button
                type="button"
                onClick={() => { clearBrand(brandInfo!.slug); toast.message('Panier vidé'); }}
                className="gcd-clear-btn"
                style={{
                  width: '100%', padding: '11px',
                  borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.09)',
                  background: 'transparent', color: 'rgba(0,0,0,0.45)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {showAuth && <AuthRequiredModal onClose={() => setShowAuth(false)} />}

      {showCheckout && brandInfo && (
        <CheckoutModal
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          brandSlug={brandInfo.slug}
          brandName={brandInfo.name}
        />
      )}
    </>
  );
}

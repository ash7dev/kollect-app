'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { useAuth } from '@/providers/AuthProvider';
import { AuthRequiredModal } from '@/components/checkout/AuthRequiredModal';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';

type BrandCartModalProps = {
  open: boolean;
  onClose: () => void;
  brandSlug: string;
  brandName: string;
  accent?: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price);
}

export function BrandCartModal({ open, onClose, brandSlug, brandName, accent = '#0a0a0a' }: BrandCartModalProps) {
  const itemsByBrand = useBrandCartStore((s) => s.itemsByBrand);
  const items = itemsByBrand[brandSlug] ?? [];
  const totalQty = useBrandCartStore((s) => s.getTotalQuantity(brandSlug));
  const subtotal = useBrandCartStore((s) => s.getSubtotal(brandSlug));
  const setQuantity = useBrandCartStore((s) => s.setQuantity);
  const removeItem = useBrandCartStore((s) => s.removeItem);
  const clearBrand = useBrandCartStore((s) => s.clearBrand);
  const updateVariant = useBrandCartStore((s) => s.updateVariant);

  const { user, isInitialized } = useAuth();
  const [visible, setVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCommander = () => {
    if (!isInitialized) return;
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCheckout(true);
    }
  };

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const isEmpty = items.length === 0;

  return (
  <>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Panier ${brandName}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        backgroundColor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background-color 300ms ease, backdrop-filter 300ms ease',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer */}
      <div style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: 'min(460px, 100%)',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 360ms cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '-32px 0 80px rgba(0,0,0,0.2)',
        borderRadius: '20px 0 0 20px',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '20px 20px 0',
          backgroundColor: '#fafafa',
          position: 'relative',
        }}>
          {/* Accent top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingTop: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 10, fontWeight: 900, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
                margin: '0 0 6px',
              }}>
                Votre sélection
              </p>
              <h2 style={{
                fontSize: 20, fontWeight: 900, margin: 0,
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {brandName}
              </h2>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.4)', margin: '5px 0 0' }}>
                {totalQty === 0
                  ? 'Panier vide'
                  : `${totalQty} article${totalQty > 1 ? 's' : ''} sélectionné${totalQty > 1 ? 's' : ''}`}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                width: 40, height: 40, borderRadius: 14, flexShrink: 0,
                border: '1.5px solid rgba(0,0,0,0.08)',
                backgroundColor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)', margin: '16px 0 0' }} />
        </div>

        {/* ── Items ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {isEmpty ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16, textAlign: 'center', padding: '40px 0',
            }}>
              {/* Empty bag illustration */}
              <div style={{
                width: 72, height: 72, borderRadius: 24,
                backgroundColor: `${accent}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, margin: '0 0 8px', color: '#000' }}>
                  Panier vide
                </p>
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', margin: 0, lineHeight: 1.6, maxWidth: 220 }}>
                  Parcourez la boutique et ajoutez vos pièces préférées.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: 8,
                  padding: '11px 24px', borderRadius: 14,
                  backgroundColor: '#000', color: '#fff',
                  fontSize: 13, fontWeight: 900, cursor: 'pointer',
                  border: 'none',
                }}
              >
                Explorer la boutique
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: 18,
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    padding: 12,
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Image — carré fixe */}
                  <Link
                    href={`/product/${encodeURIComponent(item.slug)}`}
                    onClick={onClose}
                    style={{ display: 'block', flexShrink: 0, width: 72, height: 72, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0' }}
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(145deg, ${accent}15, #f0f0f0)` }} />
                    )}
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 800, margin: 0,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 900, margin: 0, letterSpacing: '-0.4px' }}>
                      {formatPrice(item.price ?? 0)}&nbsp;<span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)' }}>CFA</span>
                    </p>

                    {/* Variant selectors */}
                    {((item.availableSizes && item.availableSizes.length > 1) || (item.availableColors && item.availableColors.length > 1)) && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                        {item.availableSizes && item.availableSizes.length > 1 && (
                          <select
                            value={item.selectedSize ?? ''}
                            onChange={e => updateVariant(brandSlug, item.productId, e.target.value || null, undefined)}
                            style={{
                              padding: '3px 8px', borderRadius: 8, border: '1.5px solid',
                              borderColor: item.selectedSize ? 'rgba(0,0,0,0.15)' : '#EF4444',
                              fontSize: 11, fontWeight: 700, color: '#111',
                              background: '#f5f5f5', cursor: 'pointer', fontFamily: 'inherit',
                              outline: 'none',
                            }}
                          >
                            <option value="">Taille…</option>
                            {item.availableSizes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                        {item.availableColors && item.availableColors.length > 1 && (
                          <select
                            value={item.selectedColor ?? ''}
                            onChange={e => updateVariant(brandSlug, item.productId, undefined, e.target.value || null)}
                            style={{
                              padding: '3px 8px', borderRadius: 8, border: '1.5px solid',
                              borderColor: 'rgba(0,0,0,0.15)',
                              fontSize: 11, fontWeight: 700, color: '#111',
                              background: '#f5f5f5', cursor: 'pointer', fontFamily: 'inherit',
                              outline: 'none',
                            }}
                          >
                            <option value="">Couleur…</option>
                            {item.availableColors.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    {/* Warning si taille requise non sélectionnée */}
                    {item.availableSizes && item.availableSizes.length > 1 && !item.selectedSize && (
                      <p style={{ fontSize: 10.5, color: '#EF4444', fontWeight: 600, margin: 0 }}>
                        ⚠ Choisis une taille
                      </p>
                    )}

                    {/* Qty + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Stepper */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.09)',
                        backgroundColor: '#fafafa', overflow: 'hidden',
                      }}>
                        <button
                          type="button"
                          aria-label="Diminuer"
                          onClick={() => setQuantity(brandSlug, item.productId, item.quantity - 1)}
                          style={{
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', backgroundColor: 'transparent',
                            fontSize: 16, fontWeight: 700, cursor: 'pointer', color: '#000',
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          minWidth: 28, textAlign: 'center',
                          fontSize: 13, fontWeight: 900,
                          borderLeft: '1px solid rgba(0,0,0,0.07)',
                          borderRight: '1px solid rgba(0,0,0,0.07)',
                          lineHeight: '32px',
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter"
                          disabled={typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock}
                          onClick={() => setQuantity(brandSlug, item.productId, item.quantity + 1)}
                          style={{
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', backgroundColor: 'transparent',
                            fontSize: 16, fontWeight: 700, cursor: 'pointer', color: '#000',
                            opacity: typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock ? 0.3 : 1,
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(brandSlug, item.productId)}
                        aria-label="Retirer"
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          border: '1.5px solid rgba(0,0,0,0.09)',
                          backgroundColor: '#fafafa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!isEmpty && (
          <div style={{
            padding: '16px 20px 24px',
            backgroundColor: '#fafafa',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}>
            {/* Subtotal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.45)', margin: 0, letterSpacing: '0.5px' }}>
                SOUS-TOTAL
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
                {formatPrice(subtotal)}
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.45)', marginLeft: 5 }}>CFA</span>
              </p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleCommander}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 16,
                border: 'none',
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: '#fff',
                fontSize: 15, fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                boxShadow: `0 8px 24px ${accent}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginBottom: 10,
              }}
            >
              Commander
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => { clearBrand(brandSlug); toast.message('Panier vidé'); }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                border: '1.5px solid rgba(0,0,0,0.09)',
                backgroundColor: 'transparent',
                color: 'rgba(0,0,0,0.5)',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Auth modal */}
    {showAuthModal && (
      <AuthRequiredModal
        onClose={() => setShowAuthModal(false)}
      />
    )}

    {/* Checkout modal */}
    {showCheckout && (
      <CheckoutModal
        open={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
        brandSlug={brandSlug}
        brandName={brandName}
        accent={accent}
      />
    )}
  </>
  );
}

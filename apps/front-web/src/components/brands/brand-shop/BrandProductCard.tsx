'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export type BrandProductCardItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[] | null;
  stock?: number | null;
  sizes?: string[];
  colors?: string[];
  collection?: { name?: string | null } | null;
};

type BrandProductCardProps = {
  brandSlug: string;
  brandName?: string;
  product: BrandProductCardItem;
  accent: string;
  isTeaser?: boolean;
};

function mediaUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ── Conflict dialog ───────────────────────────────────────────────────────────

type ConflictDialogProps = {
  conflictingBrands: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

function ConflictDialog({ conflictingBrands, onConfirm, onCancel }: ConflictDialogProps) {
  const label =
    conflictingBrands.length > 1
      ? `${conflictingBrands.length} autres marques`
      : `« ${conflictingBrands[0]} »`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conflit de panier"
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        backgroundColor: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 24,
        padding: '28px 24px 24px', maxWidth: 380, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        fontFamily: FONT_FAMILY_INTER,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF3F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#FF3B30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 3H2" />
            <circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" />
          </svg>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
          Panier non vide
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', lineHeight: 1.65, margin: '0 0 6px' }}>
          Votre panier contient des articles de <strong style={{ color: '#000' }}>{label}</strong>.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, margin: '0 0 24px' }}>
          Voulez-vous vider ce panier et ajouter ce produit ?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: 14,
            border: '1.5px solid rgba(0,0,0,0.12)', backgroundColor: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#000',
          }}>Annuler</button>
          <button type="button" onClick={onConfirm} style={{
            flex: 1, padding: '13px', borderRadius: 14, border: 'none',
            backgroundColor: '#0a0a0a', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer',
          }}>Vider et ajouter</button>
        </div>
      </div>
    </div>
  );
}

// ── Teaser Modal ─────────────────────────────────────────────────────────────

export function TeaserModal({ productName, accent, onCancel }: { productName: string, accent: string, onCancel: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Produit bientôt disponible"
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        backgroundColor: '#0a0a0a', 
        borderRadius: 28,
        padding: '40px 32px 32px', maxWidth: 420, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        fontFamily: FONT_FAMILY_INTER,
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'cardFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Lueur d'accentuation */}
        <div style={{
           position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
           background: `radial-gradient(circle at 50% 0%, ${accent}33 0%, transparent 50%)`,
           pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            color: accent
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M12 14v4M10 16h4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Bientôt disponible
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 32px' }}>
            <strong style={{ color: '#fff' }}>{productName}</strong> fait partie d'un drop exclusif à venir.<br/>
            La page détaillée sera accessible le jour J.
          </p>
          <button type="button" onClick={onCancel} style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            backgroundColor: '#fff', color: '#000', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            transition: 'transform 0.1s ease, opacity 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Je reste à l'affût
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function BrandProductCard({ brandSlug, brandName, product, accent, isTeaser }: BrandProductCardProps) {
  const addItem = useBrandCartStore((s) => s.addItem);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [conflictingBrands, setConflictingBrands] = useState<string[] | null>(null);
  const [showTeaserModal, setShowTeaserModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Observer pour détecter quand la card est visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const disabledAddToCart = isOutOfStock || isTeaser;
  
  const image = product.images?.[0] ? mediaUrl(product.images[0]) : null;
  const priceFormatted = new Intl.NumberFormat('fr-FR').format(product.price);

  const doAdd = () => {
    const sizes = product.sizes ?? [];
    const colors = product.colors ?? [];
    // Auto-select if only one option
    const autoSize = sizes.length === 1 ? sizes[0] : null;
    const autoColor = colors.length === 1 ? colors[0] : null;
    addItem({
      productId: product.id,
      brandSlug,
      brandName,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image,
      stock: product.stock ?? null,
      selectedSize: autoSize,
      selectedColor: autoColor,
      availableSizes: sizes,
      availableColors: colors,
    });
    toast.success('Ajouté au panier !');
  };

  const handleAddToCart = () => {
    if (disabledAddToCart) return;
    const { itemsByBrand } = useBrandCartStore.getState();
    const conflicts = Object.entries(itemsByBrand)
      .filter(([slug, items]) => slug !== brandSlug && items.length > 0)
      .map(([slug]) => slug);
    if (conflicts.length > 0) { setConflictingBrands(conflicts); return; }
    doAdd();
  };

  const handleConflictConfirm = () => {
    if (!conflictingBrands) return;
    const { clearBrand } = useBrandCartStore.getState();
    conflictingBrands.forEach((s) => clearBrand(s));
    setConflictingBrands(null);
    doAdd();
  };

  return (
    <>
      {/* Animations CSS */}
      <style>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .product-card {
          opacity: 0;
          animation: cardFadeIn 0.6s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
        @media (max-width: 640px) {
          .product-card-info { padding: 6px 10px 12px !important; }
          .product-card-price { font-size: 18px !important; }
          .product-card-actions {
            opacity: 1 !important;
            transform: none !important;
            pointer-events: auto !important;
          }
        }
      `}</style>
      <div
        ref={cardRef}
        className={isVisible ? 'product-card' : ''}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          // REPOS  : transparent, pas d'ombre
          // SURVOL : fond blanc + ombre douce (élévation glass)
          backgroundColor: hovered ? '#fff' : 'transparent',
          boxShadow: hovered
            ? '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
            : '0 0 0 rgba(0,0,0,0)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 240ms ease, box-shadow 240ms ease',
          cursor: 'pointer',
          fontFamily: FONT_FAMILY_INTER,
          // Évite tout décalage de layout au survol
          willChange: 'box-shadow',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image ── */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', flexShrink: 0, margin: 8 }}>
          {isTeaser ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTeaserModal(true); }}
              aria-label={`Produit ${product.name} à venir`}
              style={{ display: 'block', width: '100%', border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ aspectRatio: '3 / 4', backgroundColor: '#F0F0F0', overflow: 'hidden' }}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image} alt=""
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 380ms ease',
                      transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #E2E2E2, #EBEBEB)' }} />
                )}
              </div>
            </button>
          ) : (
            <Link
              href={`/product/${encodeURIComponent(product.slug)}`}
              aria-label={`Voir ${product.name}`}
              style={{ display: 'block' }}
            >
              <div style={{ aspectRatio: '3 / 4', backgroundColor: '#F0F0F0', overflow: 'hidden' }}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image} alt=""
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 380ms ease',
                      transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #E2E2E2, #EBEBEB)' }} />
                )}
              </div>
            </Link>
          )}

          {/* Badge rupture */}
          {isOutOfStock && !isTeaser && (
            <div aria-hidden style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, fontWeight: 900,
              }}>Rupture</span>
            </div>
          )}
          {/* Badge Teaser overlay */}
          {isTeaser && (
            <div aria-hidden style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                backgroundColor: 'rgba(255,59,48,0.95)', color: '#fff', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.2px'
              }}>Bientôt disponible</span>
            </div>
          )}

        </div>

        {/* ── Infos ── */}
        <div className="product-card-info" style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          {product.collection?.name && (
            <p style={{
              margin: '0 0 6px', fontSize: 11, fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase', color: accent,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {product.collection.name}
            </p>
          )}

          {/* Nom — noir au repos, accent au survol */}
          <p style={{
            margin: '0 0 10px', fontSize: 15, fontWeight: 800,
            color: hovered ? accent : '#111',
            lineHeight: 1.3, letterSpacing: '-0.3px',
            minHeight: '2.6em', // Forces 2 lines of vertical space for consistency
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            transition: 'color 220ms ease',
          }}>
            {product.name}
          </p>

          {/* Prix */}
          <p style={{ margin: '0 0 14px', marginTop: 'auto', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
            <span className="product-card-price" style={{ fontSize: 24, fontWeight: 900, color: '#000', letterSpacing: '-1px' }}>
              {priceFormatted}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>FCFA</span>
          </p>

          <div className="product-card-actions" style={{
            display: 'flex', gap: 8, alignItems: 'stretch',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            {/* Bouton principal */}
            <button
              type="button"
              disabled={disabledAddToCart}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: isTeaser ? `1.5px solid ${accent}` : 'none',
                backgroundColor: isTeaser ? 'rgba(255,59,48,0.05)' : disabledAddToCart ? 'rgba(0,0,0,0.07)' : '#000',
                color: isTeaser ? accent : disabledAddToCart ? 'rgba(0,0,0,0.3)' : '#fff',
                fontSize: 12, fontWeight: 900,
                cursor: isTeaser ? 'default' : disabledAddToCart ? 'not-allowed' : 'pointer',
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease',
              }}
            >
              {isTeaser ? 'DROP IMMINENT' : isOutOfStock ? 'Épuisé' : 'Ajouter au panier'}
            </button>

            {/* Bouton secondaire ↗ — carré outline */}
            {isTeaser ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTeaserModal(true); }}
                aria-label={`Produit ${product.name} à venir`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, flexShrink: 0,
                  borderRadius: 12,
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: 17,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = '#000';
                  el.style.color = '#fff';
                  el.style.borderColor = '#000';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = '#fff';
                  el.style.color = '#000';
                  el.style.borderColor = 'rgba(0,0,0,0.15)';
                }}
              >
                ↗
              </button>
            ) : (
              <Link
                href={`/product/${encodeURIComponent(product.slug)}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Voir ${product.name}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, flexShrink: 0,
                  borderRadius: 12,
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  backgroundColor: '#fff',
                  color: '#000',
                  fontSize: 17,
                  textDecoration: 'none',
                  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundColor = '#000';
                  el.style.color = '#fff';
                  el.style.borderColor = '#000';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundColor = '#fff';
                  el.style.color = '#000';
                  el.style.borderColor = 'rgba(0,0,0,0.15)';
                }}
              >
                ↗
              </Link>
            )}
          </div>
        </div>
      </div>

      {conflictingBrands && (
        <ConflictDialog
          conflictingBrands={conflictingBrands}
          onConfirm={handleConflictConfirm}
          onCancel={() => setConflictingBrands(null)}
        />
      )}
      
      {showTeaserModal && (
        <TeaserModal 
          productName={product.name} 
          accent={accent} 
          onCancel={() => setShowTeaserModal(false)} 
        />
      )}
    </>
  );
}
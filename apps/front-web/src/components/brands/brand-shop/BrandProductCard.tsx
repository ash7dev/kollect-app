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

// ── Card ──────────────────────────────────────────────────────────────────────

export function BrandProductCard({ brandSlug, brandName, product, accent }: BrandProductCardProps) {
  const addItem = useBrandCartStore((s) => s.addItem);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [conflictingBrands, setConflictingBrands] = useState<string[] | null>(null);
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

  const disabled = typeof product.stock === 'number' && product.stock <= 0;
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
    if (disabled) return;
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

          {/* Badge rupture */}
          {disabled && (
            <div aria-hidden style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
              <span style={{
                padding: '5px 12px', borderRadius: 999,
                backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, fontWeight: 900,
              }}>Rupture</span>
            </div>
          )}

        </div>

        {/* ── Infos ── */}
        <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

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
            <span style={{ fontSize: 24, fontWeight: 900, color: '#000', letterSpacing: '-1px' }}>
              {priceFormatted}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>FCFA</span>
          </p>

          <div style={{
            display: 'flex', gap: 8, alignItems: 'stretch',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            {/* Bouton principal */}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: disabled ? 'rgba(0,0,0,0.07)' : '#000',
                color: disabled ? 'rgba(0,0,0,0.3)' : '#fff',
                fontSize: 13, fontWeight: 900,
                cursor: disabled ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
                transition: 'background-color 150ms ease',
              }}
            >
              {disabled ? 'Épuisé' : 'Ajouter au panier'}
            </button>

            {/* Bouton secondaire ↗ — carré outline */}
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
    </>
  );
}
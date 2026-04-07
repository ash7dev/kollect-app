'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { useAuth } from '@/providers/AuthProvider';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { AuthRequiredModal } from '@/components/checkout/AuthRequiredModal';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { Footer } from '@/components/landing/Footer';
import { fetchProducts } from '@/lib/api';
import type { PublicProduct } from '@/types/product';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { formatPrice, formatPriceWithCurrency } from '@/lib/price-utils';

type ConflictDialogProps = {
  conflictingBrands: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

const COLOR_SWATCH_MAP: Record<string, string> = {
  noir: '#111111',
  black: '#111111',
  blanc: '#F5F5F5',
  white: '#F5F5F5',
  rouge: '#E53935',
  red: '#E53935',
  bleu: '#2563EB',
  blue: '#2563EB',
  vert: '#16A34A',
  green: '#16A34A',
  jaune: '#FACC15',
  yellow: '#FACC15',
  orange: '#F97316',
  rose: '#EC4899',
  pink: '#EC4899',
  violet: '#8B5CF6',
  purple: '#8B5CF6',
  marron: '#7C4A2D',
  brown: '#7C4A2D',
  beige: '#D6C6A5',
  gris: '#9CA3AF',
  gray: '#9CA3AF',
  grey: '#9CA3AF',
  argent: '#CBD5E1',
  silver: '#CBD5E1',
  or: '#D4AF37',
  gold: '#D4AF37',
  marine: '#1E3A8A',
  bordeaux: '#7F1D1D',
  kaki: '#5F6F52',
  creme: '#F3E9D2',
  crème: '#F3E9D2',
};

function getColorSwatch(value: string) {
  const normalized = value.trim().toLowerCase();
  const background = COLOR_SWATCH_MAP[normalized] ?? value;
  const isLightTone = ['blanc', 'white', 'beige', 'creme', 'crème', 'argent', 'silver'].includes(normalized);

  return {
    background,
    borderColor: isLightTone ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)',
  };
}

function ConflictDialog({ conflictingBrands, onConfirm, onCancel }: ConflictDialogProps) {
  const label =
    conflictingBrands.length > 1
      ? `${conflictingBrands.length} autres marques`
      : `« ${conflictingBrands[0]} »`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        backgroundColor: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 24,
        padding: '28px 24px 24px', maxWidth: 380, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
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

export function ProductDetailPage({ product }: { product: PublicProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors.length > 0 ? product.colors[0] : null,
  );
  const [conflictingBrands, setConflictingBrands] = useState<string[] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [otherProducts, setOtherProducts] = useState<PublicProduct[]>([]);

  const addItem = useBrandCartStore((s) => s.addItem);
  const { user, isInitialized } = useAuth();

  // Récupérer les autres produits depuis la base de données
  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts(8);
      // Exclure le produit actuel et prendre les 4 premiers
      const filtered = products
        .filter(p => p.id !== product.id)
        .slice(0, 4);
      setOtherProducts(filtered);
    };
    loadProducts();
  }, [product.id]);

  const images = product.images.length > 0 ? product.images : [];
  const priceFormatted = formatPrice(product.price);
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const needsSize = product.sizes.length > 0 && !selectedSize;
  const canAdd = !outOfStock && !needsSize;

  const doAdd = () => {
    addItem({
      productId: product.id,
      brandSlug: product.brand.slug,
      brandName: product.brand.name,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: images[0] ?? null,
      stock: product.stock ?? null,
      selectedSize: selectedSize ?? null,
      selectedColor: selectedColor ?? null,
      availableSizes: product.sizes,
      availableColors: product.colors,
    });
    toast.success('Ajouté au panier !');
  };

  const handleAddToCart = () => {
    if (!canAdd) return;
    const { itemsByBrand } = useBrandCartStore.getState();
    const conflicts = Object.entries(itemsByBrand)
      .filter(([slug, items]) => slug !== product.brand.slug && items.length > 0)
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

  const handleCommander = () => {
    if (!canAdd) return;
    // Vérifier conflit de marque avant d'ouvrir checkout
    const { itemsByBrand } = useBrandCartStore.getState();
    const conflicts = Object.entries(itemsByBrand)
      .filter(([slug, items]) => slug !== product.brand.slug && items.length > 0)
      .map(([slug]) => slug);
    if (conflicts.length > 0) { setConflictingBrands(conflicts); return; }
    doAdd();
    if (!isInitialized) return;
    if (!user) { setShowAuth(true); return; }
    setShowCheckout(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .pdp-wrap { max-width: 1200px; margin: 0 auto; padding: 100px 24px 80px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
        .pdp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        .pdp-actions { display: flex; gap: 12px; margin-bottom: 32px; }
        @media (max-width: 768px) {
          .pdp-wrap { padding: 80px 16px 60px; }
          .pdp-grid { grid-template-columns: 1fr; gap: 32px; }
          .pdp-actions { flex-direction: column; }
        }
      ` }} />
      <div className="pdp-wrap">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 36 }}>
          <Link
            href={`/brand/${product.brand.slug}`}
            style={{
              fontSize: 13, fontWeight: 700,
              color: 'rgba(0,0,0,0.4)',
              textDecoration: 'none',
              letterSpacing: '0.2px',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#000'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(0,0,0,0.4)'; }}
          >
            {product.brand.name}
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#000', letterSpacing: '-0.1px' }}>
            {product.name}
          </span>
        </div>

        {/* Main layout */}
        <div className="pdp-grid">
          {/* ── Left: Gallery ── */}
          <div style={{
            borderRadius: 24,
            backgroundColor: '#FAFAFA',
            padding: 16,
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
            {/* Main image */}
            <div style={{
              borderRadius: 16,
              backgroundColor: '#F0F0F0',
              aspectRatio: '3 / 4',
              marginBottom: 14,
              overflow: 'hidden',
            }}>
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #E2E2E2, #EBEBEB)' }} />
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: i === activeImage ? '2.5px solid #000' : '2px solid transparent',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      flexShrink: 0,
                      transition: 'border-color 150ms ease',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Brand link */}
            <Link
              href={`/brand/${product.brand.slug}`}
              style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
                textDecoration: 'none', marginBottom: 14, display: 'inline-block',
              }}
            >
              {product.brand.name}
            </Link>

            {/* Promotion Badge Overlay */}
            {product.originalPrice && (
              <div style={{ marginBottom: 12, marginTop: 4 }}>
                <span style={{
                  padding: '6px 14px', borderRadius: 10,
                  backgroundColor: '#FF3B30', color: '#fff', fontSize: 13, fontWeight: 900,
                  boxShadow: '0 4px 15px rgba(255,59,48,0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  letterSpacing: '0.4px', textTransform: 'uppercase'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-5M3 18l18-5" />
                  </svg>
                  -{product.discountType === 'PERCENTAGE' ? `${product.discountValue}%` : formatPriceWithCurrency(product.discountValue ?? 0)}
                </span>
              </div>
            )}

            {/* Name */}
            <h1 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 900,
              margin: '0 0 18px',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
              color: '#000',
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 26 }}>
              {product.originalPrice && (
                <span style={{ fontSize: 15, color: '#999', textDecoration: 'line-through', fontWeight: 600, marginLeft: 2 }}>
                  {formatPriceWithCurrency(product.originalPrice)}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ 
                  fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', 
                  fontWeight: 900, 
                  color: product.originalPrice ? '#FF3B30' : '#16a34a', 
                  letterSpacing: '-1px' 
                }}>
                  {priceFormatted}
                </span>
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 800, 
                  color: product.originalPrice ? '#FF3B30' : '#16a34a', 
                  letterSpacing: '0.5px' 
                }}>FCFA</span>
              </div>
            </div>

            {/* Product Type and Gender */}
            <div style={{ marginBottom: 22, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {product.productType && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}>
                  {/* Icône type */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.7)' }}>
                    <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.86 1.09l-.58.73a4.5 4.5 0 0 0-.7 1.3l-.36 1.01a2 2 0 0 1-1.7 1.21H10.05a2 2 0 0 1-1.7-1.21l-.36-1.01a4.5 4.5 0 0 0-.7-1.3l-.58-.73a8 8 0 0 1-.86-1.09L4.62 8.57a2 2 0 0 1 .05-2.35l.8-1.2a8 8 0 0 1 1.05-1.22l.58-.73a4.5 4.5 0 0 0 .7-1.3l.36-1.01A2 2 0 0 1 9.86 1h4.28a2 2 0 0 1 1.7 1.21l.36 1.01a4.5 4.5 0 0 0 .7 1.3l.58.73a8 8 0 0 1 1.05 1.22l.8 1.2a2 2 0 0 1 .05 2.35z"/>
                    <line x1="12" y1="4" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'rgba(0,0,0,0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    {product.productType}
                  </span>
                </div>
              )}
              {product.gender && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}>
                  {/* Icône genre */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.7)' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'rgba(0,0,0,0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}>
                    {product.gender}
                  </span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Couleur</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choisir la couleur ${color}`}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: 34,
                        height: 34,
                        padding: 0,
                        borderRadius: '50%',
                        border: selectedColor === color
                          ? '2px solid #000'
                          : '1.5px solid rgba(0,0,0,0.14)',
                        background: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 150ms ease, border-color 150ms ease',
                        transform: selectedColor === color ? 'scale(1.06)' : 'scale(1)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: getColorSwatch(color).background,
                          border: `1px solid ${getColorSwatch(color).borderColor}`,
                          display: 'block',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 900, margin: '0 0 12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>
                  Pointure
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: selectedSize === size
                          ? '2px solid #000'
                          : '1.5px solid rgba(0,0,0,0.12)',
                        backgroundColor: selectedSize === size ? '#000' : '#fff',
                        color: selectedSize === size ? '#fff' : '#000',
                        fontSize: 14, fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {needsSize && (
                  <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', margin: '10px 0 0', fontWeight: 600 }}>
                    Veuillez sélectionner une pointure
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="pdp-actions">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor: canAdd ? '#0a0a0a' : 'rgba(0,0,0,0.08)',
                  color: canAdd ? '#fff' : 'rgba(0,0,0,0.3)',
                  fontSize: 13, fontWeight: 900, letterSpacing: '-0.1px',
                  cursor: canAdd ? 'pointer' : 'not-allowed',
                  transition: 'background-color 150ms ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {outOfStock ? 'Épuisé' : 'Ajouter au panier'}
              </button>

              <button
                type="button"
                onClick={handleCommander}
                disabled={!canAdd}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor: canAdd ? '#0a0a0a' : 'rgba(0,0,0,0.08)',
                  color: canAdd ? '#fff' : 'rgba(0,0,0,0.3)',
                  fontSize: 13, fontWeight: 900, letterSpacing: '-0.1px',
                  cursor: canAdd ? 'pointer' : 'not-allowed',
                  transition: 'background-color 150ms ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Commander
              </button>
            </div>

            {/* Informations */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 24 }}>
              <p style={{
                fontSize: 11, fontWeight: 900, margin: '0 0 14px',
                color: 'rgba(0,0,0,0.4)', letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Informations
              </p>
              {product.description ? (
                <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 1.75, margin: 0 }}>
                  {product.description}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Livraison rapide dans Dakar (1-2h)', 'Produit 100% authentique', 'Paiement à la livraison disponible'].map((text) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 900 }}>✓</span>
                      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', fontWeight: 500 }}>{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{/* pdp-wrap */}

      {conflictingBrands && (
        <ConflictDialog
          conflictingBrands={conflictingBrands}
          onConfirm={handleConflictConfirm}
          onCancel={() => setConflictingBrands(null)}
        />
      )}

      {showAuth && <AuthRequiredModal onClose={() => setShowAuth(false)} />}

      {showCheckout && (
        <CheckoutModal
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          brandSlug={product.brand.slug}
          brandName={product.brand.name}
        />
      )}

      {/* Découvrez d'autres produits */}
      <SimilarProducts 
        products={otherProducts}
        accent="#FF3B30"
      />
    </>
  );
}

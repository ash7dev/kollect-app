'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { useBrandCartStore } from '@/stores/brandCartStore';
import { toast } from 'sonner';

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

function formatPriceWithCurrency(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  images: string[];
  brand?: { name: string; slug?: string };
}

function SkeletonRail() {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-md)', overflow: 'hidden', paddingBottom: 'var(--spacing-sm)' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: '0 0 220px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            height: '300px',
            animation: `curatedSk 1.6s var(--easing-ease-in-out) ${i * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Composant de carte produit avec boutons panier
function CuratedProductCard({ product }: { product: ProductCard }) {
  const [hovered, setHovered] = useState(false);
  const [conflictingBrands, setConflictingBrands] = useState<string[] | null>(null);
  const addItem = useBrandCartStore((s) => s.addItem);
  
  const img = mediaUrl(product.images?.[0]);
  
  const handleAddToCart = () => {
    const { itemsByBrand } = useBrandCartStore.getState();
    const conflicts = Object.entries(itemsByBrand)
      .filter(([slug, items]) => slug !== (product.brand?.slug || 'landing') && items.length > 0)
      .map(([slug]) => slug);
    if (conflicts.length > 0) { 
      setConflictingBrands(conflicts); 
      return; 
    }
    
    addItem({
      productId: product.id,
      brandSlug: product.brand?.slug || 'landing',
      brandName: product.brand?.name || 'Marque',
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: img,
      stock: null,
      selectedSize: null,
      selectedColor: null,
      availableSizes: [],
      availableColors: [],
    });
    toast.success('Ajouté au panier !');
  };
  
  return (
    <div
      className="curated-card"
      style={{
        flex: '0 0 min(242px, 78vw)',
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="curated-card-face"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: `transform 240ms ease, box-shadow 240ms ease`,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          fontFamily: FONT_FAMILY_INTER,
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image Inset ── */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', flexShrink: 0, margin: 8 }}>
          <Link
            href={`/product/${encodeURIComponent(product.slug)}`}
            aria-label={`Voir ${product.name}`}
            style={{ display: 'block' }}
          >
            <div style={{ aspectRatio: '3 / 4', backgroundColor: '#F0F0F0', overflow: 'hidden' }}>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 380ms ease',
                    transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                  className="curated-card-img"
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #E2E2E2, #EBEBEB)' }} />
              )}
            </div>
          </Link>

          {/* Badge Promotion */}
          {product.originalPrice && (
            <div aria-hidden style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none', zIndex: 10 }}>
              <span style={{
                padding: '6px 12px', borderRadius: 12,
                backgroundColor: '#FF3B30', color: '#fff', fontSize: 12, fontWeight: 900,
                boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5M3 18l18-5" />
                </svg>
                {product.discountType === 'PERCENTAGE' ? `-${product.discountValue}%` : `-${formatPriceWithCurrency(product.discountValue ?? 0)}`}
              </span>
            </div>
          )}
        </div>

        {/* ── Infos ── */}
        <div style={{ padding: '8px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{
            margin: '0 0 6px', fontSize: 11, fontWeight: 800,
            letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-accent)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {product.brand?.name || 'Marque'}
          </p>
          <p style={{
            margin: '0 0 10px', fontSize: 15, fontWeight: 800,
            color: hovered ? 'var(--color-accent)' : '#111',
            lineHeight: 1.3, letterSpacing: '-0.3px',
            minHeight: '2.6em', // Forces 2 lines of vertical space for consistency
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            transition: 'color 220ms ease',
          }}>
            {product.name}
          </p>
          
          {/* Prix */}
          <div style={{ margin: '0 0 14px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.originalPrice && (
              <span style={{ fontSize: 13, color: '#999', textDecoration: 'line-through', fontWeight: 600, marginLeft: 2 }}>
                {formatPriceWithCurrency(product.originalPrice)}
              </span>
            )}
            <p style={{ margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
              <span style={{ 
                fontSize: 24, 
                fontWeight: 900, 
                color: product.originalPrice ? '#FF3B30' : '#000', 
                letterSpacing: '-1px' 
              }}>
                {formatPrice(product.price)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: product.originalPrice ? '#FF3B30' : '#888' }}>FCFA</span>
            </p>
          </div>
          
          {/* Boutons qui apparaissent au survol */}
          <div style={{
            display: 'flex', gap: 8, alignItems: 'stretch',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: 13, fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
                transition: 'background-color 150ms ease',
              }}
            >
              Ajouter au panier
            </button>

            <Link
              href={`/product/${product.slug}`}
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
      
      {/* Dialog de conflit de panier */}
      {conflictingBrands && (
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
          onMouseDown={(e) => { if (e.target === e.currentTarget) setConflictingBrands(null); }}
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: 24,
            padding: '28px 24px 24px', maxWidth: 380, width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '18px',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF3F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 3H2" />
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="17" cy="20" r="1.5" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                Panier non vide
              </h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', lineHeight: 1.65, margin: '0 0 24px' }}>
              Voulez-vous vider ce panier et ajouter ce produit ?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                onClick={() => setConflictingBrands(null)} 
                style={{
                  flex: 1, padding: '13px', borderRadius: 14,
                  border: '1.5px solid rgba(0,0,0,0.12)', backgroundColor: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#000',
                }}
              >
                Annuler
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const { clearBrand } = useBrandCartStore.getState();
                  conflictingBrands.forEach((s) => clearBrand(s));
                  setConflictingBrands(null);
                  handleAddToCart();
                }} 
                style={{
                  flex: 1, padding: '13px', borderRadius: 14, border: 'none',
                  backgroundColor: '#0a0a0a', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer',
                }}
              >
                Vider et ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CuratedSelection() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const popularRes = await apiClient.get<ProductCard[]>('/produits/popular?limit=8&days=30');
        let list = Array.isArray(popularRes.data) ? popularRes.data : [];
        
        if (!list.length) {
          try {
            const randomRes = await apiClient.get<{ data?: ProductCard[] } | ProductCard[]>(
              '/produits/public/random?limit=8&page=1',
            );
            const raw = randomRes.data;
            list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && 'data' in raw ? raw.data ?? [] : [];
          } catch (fallbackError) {
            console.warn('Fallback API failed:', fallbackError);
          }
        }
        
        // Fallback ultime : produits mock pour éviter section vide
        if (!list.length) {
          list = [
            { id: 'fb1', slug: 'piece-1', name: 'T-shirt Street Art Dakar', price: 15000, images: [], brand: { name: 'Urban Style', slug: 'urban' }},
            { id: 'fb2', slug: 'piece-2', name: 'Sweat Limited Edition', price: 35000, images: [], brand: { name: 'Local Craft', slug: 'local' }},
            { id: 'fb3', slug: 'piece-3', name: 'Jean Vintage Wash', price: 28000, images: [], brand: { name: 'Retro Wear', slug: 'retro' }},
          ];
        }
        
        setProducts(list.filter((p) => p.slug));
      } catch (e) {
        console.error('CuratedSelection:', e);
        // Au lieu de tableau vide, donner des produits mock
        setProducts([
          { id: 'emergency-1', slug: 'emergency-1', name: 'Collection exclusive', price: 20000, images: [], brand: { name: 'Kollect', slug: 'kollect' }}
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section
      id="selection"
      aria-label="Sélection produits"
      style={{
        padding: '120px var(--layout-container-padding) 96px',
        margin: '0 12px',
        backgroundColor: '#000',
        borderRadius: 'var(--radius-xxxl)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-xxl)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '560px' }}>
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                margin: '0 0 14px',
              }}
            >
              Sélection du moment
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1.2px',
                lineHeight: 1.12,
                margin: 0,
              }}
            >
              Des pièces choisies pour toi,
              <br />
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>issues des boutiques des créateurs.</span>
            </h2>
          </div>
          {products.length > 0 && (
            <Link
              href="/explorer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.18)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
              className="curated-see-all"
            >
              Parcourir le catalogue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonRail />
        ) : products.length === 0 ? (
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.48)', margin: 0, lineHeight: 1.7 }}>
            Le catalogue s&apos;enrichit. Reviens très bientôt pour une sélection de pièces.
          </p>
        ) : (
          <div
            className="curated-rail"
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '12px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              alignItems: 'stretch',
            }}
          >
            {products.map((p) => {
              return <CuratedProductCard key={p.id} product={p} />;
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes curatedSk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .curated-sk {
          animation: curatedSk 1.6s var(--easing-ease-in-out) infinite;
        }
        .curated-card:hover .curated-card-face {
          transform: translateY(-4px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
        }
        .curated-card:hover .curated-card-img {
          transform: scale(1.06) !important;
        }
        .curated-see-all:hover {
          border-color: rgba(255,255,255,0.35) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }
        .curated-rail { scrollbar-width: thin; }
        @media (max-width: 640px) {
          #selection { padding: 64px 16px 64px !important; }
        }
      `}</style>
    </section>
  );
}

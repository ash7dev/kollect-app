'use client';

import type { CollectionProduct } from '@/types/drops';
import { ProductCard } from './ProductCard';

// ─── Icons ───────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="cd-shimmer" style={{ aspectRatio: '3/4' }} />
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="cd-shimmer" style={{ height: 13, width: '70%' }} />
        <div className="cd-shimmer" style={{ height: 15, width: '40%' }} />
        <div className="cd-shimmer" style={{ height: 10, width: '55%', marginTop: 4 }} />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyProducts() {
  return (
    <div className="cd-empty">
      <div className="cd-empty-icon">
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
          stroke="rgba(0,0,0,0.25)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
      <p className="cd-empty-title">Aucun produit</p>
      <p className="cd-empty-sub">Cette collection ne contient pas encore de produits.</p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  products: CollectionProduct[];
  isLoading: boolean;
  onAddProduct?: () => void;
};

export function ProductsSection({ products, isLoading, onAddProduct }: Props) {
  return (
    <section>
      <div className="cd-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="cd-section-label">Produits</span>
          {!isLoading && products.length > 0 && (
            <span className="cd-section-count">{products.length}</span>
          )}
        </div>
        {onAddProduct && (
          <button
            type="button"
            onClick={onAddProduct}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 11,
              border: 'none', background: '#0A0A0A',
              color: '#fff', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '-0.1px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
          >
            <PlusIcon />
            Ajouter un produit
          </button>
        )}
      </div>

      <div className="cd-products-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : products.length === 0 ? (
          <EmptyProducts />
        ) : (
          products.map(product => <ProductCard key={product.id} product={product} />)
        )}
      </div>
    </section>
  );
}

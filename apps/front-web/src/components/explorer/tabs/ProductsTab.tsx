/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { BrandProductCard } from '@/components/brands/brand-shop/BrandProductCard';
import { GridSkeleton } from '@/components/explorer/GridSkeleton';
import { ExplorerEmpty } from '@/components/explorer/ExplorerEmpty';
import { FilterTags } from '@/components/explorer/FilterTags';
import { ProductFilters, DEFAULT_PRODUCT_FILTERS } from '@/components/explorer/filters/ProductFilters';
import type { ProductFilterState } from '@/components/explorer/filters/ProductFilters';
import type { ActiveFilter } from '@/components/explorer/FilterTags';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type ExplorerProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  stock?: number | null;
  collection?: { name?: string | null } | null;
  brand: { id: string; slug: string; name: string };
};

type ProductsTabProps = {
  query: string;
};

function buildActiveTags(f: ProductFilterState): ActiveFilter[] {
  const tags: ActiveFilter[] = [];
  if (f.sortBy !== 'popular') tags.push({ key: 'sortBy', label: { recent: 'Récent', 'price-asc': 'Prix ↑', 'price-desc': 'Prix ↓' }[f.sortBy] ?? f.sortBy });
  if (f.minPrice) tags.push({ key: 'minPrice', label: `Min ${f.minPrice} FCFA` });
  if (f.maxPrice) tags.push({ key: 'maxPrice', label: `Max ${f.maxPrice} FCFA` });
  f.sizes.forEach(s => tags.push({ key: `size-${s}`, label: s }));
  f.colors.forEach(c => tags.push({ key: `color-${c}`, label: c }));
  if (f.inStock) tags.push({ key: 'inStock', label: 'En stock' });
  return tags;
}

export function ProductsTab({ query }: ProductsTabProps) {
  const [products, setProducts] = useState<ExplorerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_PRODUCT_FILTERS);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetch = useCallback(async (q: string, f: ProductFilterState, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('query', q);
      if (f.minPrice) params.set('minPrice', f.minPrice);
      if (f.maxPrice) params.set('maxPrice', f.maxPrice);
      if (f.sizes.length) params.set('sizes', f.sizes.join(','));
      if (f.colors.length) params.set('colors', f.colors.join(','));
      if (f.inStock) params.set('inStock', 'true');
      params.set('sortBy', f.sortBy);
      params.set('page', String(p));
      params.set('limit', '20');
      const res = await apiClient.get<{ data: ExplorerProduct[]; meta: { totalPages: number } }>(
        `/produits/search?${params.toString()}`,
      );
      const data = res.data?.data ?? [];
      setProducts(prev => p === 1 ? data : [...prev, ...data]);
      setHasMore(p < (res.data?.meta?.totalPages ?? 1));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetch(query, filters, 1);
  }, [query, filters, fetch]);

  const activeTags = buildActiveTags(filters);

  const removeTag = (key: string) => {
    if (key === 'sortBy') return setFilters(f => ({ ...f, sortBy: 'popular' }));
    if (key === 'minPrice') return setFilters(f => ({ ...f, minPrice: '' }));
    if (key === 'maxPrice') return setFilters(f => ({ ...f, maxPrice: '' }));
    if (key === 'inStock') return setFilters(f => ({ ...f, inStock: false }));
    if (key.startsWith('size-')) return setFilters(f => ({ ...f, sizes: f.sizes.filter(s => `size-${s}` !== key) }));
    if (key.startsWith('color-')) return setFilters(f => ({ ...f, colors: f.colors.filter(c => `color-${c}` !== key) }));
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', fontFamily: FONT_FAMILY_INTER }}>
      {/* Sidebar filtres */}
      <aside style={{
        width: 240, flexShrink: 0,
        position: 'sticky', top: 100,
        borderRight: '1px solid rgba(0,0,0,0.07)',
        paddingRight: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: '-0.3px', color: '#000', margin: '0 0 4px' }}>Filtres</p>
        <ProductFilters filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
      </aside>

      {/* Résultats */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <FilterTags filters={activeTags} onRemove={removeTag} onClearAll={() => setFilters(DEFAULT_PRODUCT_FILTERS)} />

        {loading && page === 1 ? (
          <GridSkeleton count={12} />
        ) : products.length === 0 ? (
          <ExplorerEmpty query={query} tab="products" />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 20,
            }}>
              {products.map(p => (
                <BrandProductCard
                  key={p.id}
                  brandSlug={p.brand.slug}
                  brandName={p.brand.name}
                  product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, images: p.images, stock: p.stock, collection: p.collection }}
                  accent="#FF3B30"
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button
                  onClick={() => { const next = page + 1; setPage(next); fetch(query, filters, next); }}
                  disabled={loading}
                  style={{
                    padding: '12px 32px', borderRadius: 999,
                    border: '2px solid #000', backgroundColor: '#000', color: '#fff',
                    fontSize: 13, fontWeight: 900, cursor: 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Chargement…' : 'Voir plus'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

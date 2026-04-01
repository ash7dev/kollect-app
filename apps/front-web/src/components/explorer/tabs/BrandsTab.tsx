'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { BrandsGrid } from '@/components/brands/BrandsGrid';
import { GridSkeleton } from '@/components/explorer/GridSkeleton';
import { ExplorerEmpty } from '@/components/explorer/ExplorerEmpty';
import { FilterTags } from '@/components/explorer/FilterTags';
import { BrandFilters, DEFAULT_BRAND_FILTERS } from '@/components/explorer/filters/BrandFilters';
import type { BrandFilterState } from '@/components/explorer/filters/BrandFilters';
import type { ActiveFilter } from '@/components/explorer/FilterTags';
import type { BrandListItem } from '@/components/brands/types';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type BrandsTabProps = { query: string };

function sortBrands(list: BrandListItem[], sort: BrandFilterState['sortBy']): BrandListItem[] {
  const copy = [...list];
  if (sort === 'name-asc') return copy.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  if (sort === 'products') return copy.sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0));
  if (sort === 'recent') return copy.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  // featured: verified first, then followers
  return copy.sort((a, b) => {
    const v = Number(b.isVerified) - Number(a.isVerified);
    if (v !== 0) return v;
    return (b.followerCount ?? 0) - (a.followerCount ?? 0);
  });
}

function buildActiveTags(f: BrandFilterState): ActiveFilter[] {
  const tags: ActiveFilter[] = [];
  if (f.isVerified) tags.push({ key: 'isVerified', label: 'Vérifiées' });
  if (f.sortBy !== 'featured') tags.push({ key: 'sortBy', label: { 'name-asc': 'A → Z', products: 'Plus de pièces', recent: 'Récentes' }[f.sortBy] ?? f.sortBy });
  return tags;
}

export function BrandsTab({ query }: BrandsTabProps) {
  const [allBrands, setAllBrands] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BrandFilterState>(DEFAULT_BRAND_FILTERS);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<BrandListItem[]>('/brands');
      setAllBrands(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAllBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const brands = sortBrands(
    allBrands.filter(b => {
      if (filters.isVerified && !b.isVerified) return false;
      if (query) {
        const lq = query.toLowerCase();
        return b.name.toLowerCase().includes(lq) || (b.bio ?? '').toLowerCase().includes(lq);
      }
      return true;
    }),
    filters.sortBy,
  );

  const activeTags = buildActiveTags(filters);
  const removeTag = (key: string) => {
    if (key === 'isVerified') setFilters(f => ({ ...f, isVerified: false }));
    if (key === 'sortBy') setFilters(f => ({ ...f, sortBy: 'featured' }));
  };

  return (
    <div className="explorer-tab-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', fontFamily: FONT_FAMILY_INTER }}>
      <aside className="explorer-tab-aside" style={{
        width: 240, flexShrink: 0,
        position: 'sticky', top: 100,
        borderRight: '1px solid rgba(0,0,0,0.07)',
        paddingRight: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: '-0.3px', color: '#000', margin: '0 0 4px' }}>Filtres</p>
        <BrandFilters filters={filters} onChange={setFilters} />
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <FilterTags filters={activeTags} onRemove={removeTag} onClearAll={() => setFilters(DEFAULT_BRAND_FILTERS)} />

        {loading ? (
          <GridSkeleton count={8} />
        ) : brands.length === 0 ? (
          <ExplorerEmpty query={query} tab="brands" />
        ) : (
          <BrandsGrid brands={brands} />
        )}
      </div>
    </div>
  );
}

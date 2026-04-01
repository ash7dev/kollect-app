'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { BrandCollectionCards } from '@/components/brands/brand-shop/BrandCollectionCards';
import { GridSkeleton } from '@/components/explorer/GridSkeleton';
import { ExplorerEmpty } from '@/components/explorer/ExplorerEmpty';
import { FilterTags } from '@/components/explorer/FilterTags';
import { CollectionFilters, DEFAULT_COLLECTION_FILTERS } from '@/components/explorer/filters/CollectionFilters';
import type { CollectionFilterState } from '@/components/explorer/filters/CollectionFilters';
import type { ActiveFilter } from '@/components/explorer/FilterTags';
import type { PublicCollection } from '@/types/drops';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';

function isVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

type CollectionsTabProps = { query: string };

function buildActiveTags(f: CollectionFilterState): ActiveFilter[] {
  const tags: ActiveFilter[] = [];
  if (f.status !== 'all') tags.push({ key: 'status', label: f.status === 'DISPONIBLE' ? 'Disponibles' : 'À venir' });
  if (f.isFeatured) tags.push({ key: 'isFeatured', label: 'Vedettes' });
  if (f.sortBy !== 'recent') tags.push({ key: 'sortBy', label: 'A → Z' });
  return tags;
}

export function CollectionsTab({ query }: CollectionsTabProps) {
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CollectionFilterState>(DEFAULT_COLLECTION_FILTERS);

  const fetchCollections = useCallback(async (q: string, f: CollectionFilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (f.status !== 'all') params.set('status', f.status);
      if (f.isFeatured) params.set('isFeatured', 'true');
      params.set('includeProducts', 'true');
      const res = await apiClient.get<{ data: PublicCollection[] }>(`/collections/public?${params.toString()}`);
      let data = res.data?.data ?? [];

      // Filtre local par query
      if (q) {
        const lq = q.toLowerCase();
        data = data.filter(c => c.name.toLowerCase().includes(lq) || c.brand.name.toLowerCase().includes(lq));
      }

      // Tri local
      if (f.sortBy === 'name-asc') {
        data = [...data].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      }

      setCollections(data);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections(query, filters);
  }, [query, filters, fetchCollections]);

  const activeTags = buildActiveTags(filters);
  const removeTag = (key: string) => {
    if (key === 'status') setFilters(f => ({ ...f, status: 'all' }));
    if (key === 'isFeatured') setFilters(f => ({ ...f, isFeatured: false }));
    if (key === 'sortBy') setFilters(f => ({ ...f, sortBy: 'recent' }));
  };

  const mapped = collections.map(c => ({
    name: c.name,
    slug: c.slug,
    coverImage: isVideo(c.coverImage)
      ? (c.products?.[0]?.images?.[0] ?? null)
      : c.coverImage,
    coverImageFallback: mediaUrl(c.products?.[0]?.images?.[0] ?? null),
    href: `/brand/${c.brand.slug}/${c.slug}`,
    productCount: c._count?.products ?? 0,
    products: [],
  }));

  return (
    <div className="explorer-tab-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', fontFamily: FONT_FAMILY_INTER }}>
      <aside className="explorer-tab-aside" style={{
        width: 240, flexShrink: 0,
        position: 'sticky', top: 100,
        borderRight: '1px solid rgba(0,0,0,0.07)',
        paddingRight: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: '-0.3px', color: '#000', margin: '0 0 4px' }}>Filtres</p>
        <CollectionFilters filters={filters} onChange={setFilters} />
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <FilterTags filters={activeTags} onRemove={removeTag} onClearAll={() => setFilters(DEFAULT_COLLECTION_FILTERS)} />

        {loading ? (
          <GridSkeleton count={9} />
        ) : mapped.length === 0 ? (
          <ExplorerEmpty query={query} tab="collections" />
        ) : (
          <BrandCollectionCards accent="#FF3B30" collections={mapped} />
        )}
      </div>
    </div>
  );
}

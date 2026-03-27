'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExplorerHero, type ExplorerTab } from './ExplorerHero';
import { ProductsTab } from './tabs/ProductsTab';
import { CollectionsTab } from './tabs/CollectionsTab';
import { BrandsTab } from './tabs/BrandsTab';
import { apiClient } from '@/services/api/client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('products');
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState({ products: 0, collections: 0, brands: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const [productsRes, collectionsRes, brandsRes] = await Promise.allSettled([
        apiClient.get<{ meta: { total: number } }>('/produits/search?limit=1&page=1'),
        apiClient.get<{ meta: { total: number } }>('/collections/public?limit=1&page=1'),
        apiClient.get<unknown[]>('/brands'),
      ]);

      setCounts({
        products:
          productsRes.status === 'fulfilled'
            ? (productsRes.value.data as { meta: { total: number } })?.meta?.total ?? 0
            : 0,
        collections:
          collectionsRes.status === 'fulfilled'
            ? (collectionsRes.value.data as { meta: { total: number } })?.meta?.total ?? 0
            : 0,
        brands:
          brandsRes.status === 'fulfilled'
            ? Array.isArray(brandsRes.value.data)
              ? brandsRes.value.data.length
              : 0
            : 0,
      });
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const handleTabChange = (tab: ExplorerTab) => {
    setActiveTab(tab);
    setQuery('');
  };

  return (
    <div style={{ backgroundColor: '#f5f5f0', minHeight: '100vh', fontFamily: FONT_FAMILY_INTER }}>
      <ExplorerHero
        activeTab={activeTab}
        onTabChange={handleTabChange}
        query={query}
        onQueryChange={setQuery}
        counts={counts}
      />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 80px' }}>
        {activeTab === 'products' && <ProductsTab query={query} />}
        {activeTab === 'collections' && <CollectionsTab query={query} />}
        {activeTab === 'brands' && <BrandsTab query={query} />}
      </main>
    </div>
  );
}

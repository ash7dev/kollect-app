'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { DiscoveryGallery, type DiscoveryProduct } from './DiscoveryGallery';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function DiscoveryPage() {
  const [products, setProducts] = useState<DiscoveryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      // On récupère les produits récents
      const res = await apiClient.get<{ data: DiscoveryProduct[]; meta: { totalPages: number } }>(
        `/produits/search?page=${p}&limit=30`
      );
      const data = res.data?.data ?? [];
      setProducts(prev => p === 1 ? data : [...prev, ...data]);
      setHasMore(p < (res.data?.meta?.totalPages ?? 1));
    } catch (e) {
      console.error("Failed to fetch discovery products", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: FONT_FAMILY_INTER }}>
      <div style={{
        padding: '120px 40px 20px',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.5rem)',
          fontWeight: 900,
          letterSpacing: '-1px',
          color: '#000000',
          margin: 0,
          lineHeight: 1,
          textTransform: 'uppercase'
        }}>
          Découverte
        </h1>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#FF3B30',
          borderRadius: '50%'
        }} />
      </div>

      <DiscoveryGallery products={products} />

      {/* Infinite Scroll / Load more simple */}
      <div style={{ textAlign: 'center', padding: '0 0 80px' }}>
        {loading && (
          <div style={{ color: '#000000', fontSize: '14px', fontWeight: 600 }}>
            Chargement...
          </div>
        )}
        {!loading && hasMore && (
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchProducts(next);
            }}
            style={{
              padding: '16px 40px',
              borderRadius: '999px',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
          >
            Plus d'inspiration
          </button>
        )}
      </div>
    </main>
  );
}

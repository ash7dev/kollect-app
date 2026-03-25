'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/services/api/client';
import type { BrandListItem, BrandSortId } from '@/components/brands/types';
import { BrandsHero } from '@/components/brands/BrandsHero';
import { BrandsToolbar } from '@/components/brands/BrandsToolbar';
import { BrandSpotlight } from '@/components/brands/BrandSpotlight';
import { BrandsGrid } from '@/components/brands/BrandsGrid';
import { BrandsEmpty } from '@/components/brands/BrandsEmpty';
import { BrandsCreatorCta } from '@/components/brands/BrandsCreatorCta';
import { BrandFeatured } from '@/components/brands/BrandFeatured';

function sortBrands(list: BrandListItem[], sort: BrandSortId): BrandListItem[] {
  const copy = [...list];
  if (sort === 'name-asc') {
    copy.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return copy;
  }
  if (sort === 'products') {
    copy.sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0));
    return copy;
  }
  if (sort === 'recent') {
    copy.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return copy;
  }
  copy.sort((a, b) => {
    const v = Number(b.isVerified) - Number(a.isVerified);
    if (v !== 0) return v;
    const f = (b.followerCount ?? 0) - (a.followerCount ?? 0);
    if (f !== 0) return f;
    return (b._count?.products ?? 0) - (a._count?.products ?? 0);
  });
  return copy;
}

function BrandsGridSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18,
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '3/4',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(0,0,0,0.04)',
            animation: 'brandsSk 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes brandsSk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export function BrandsPageContent() {
  const [raw, setRaw] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<BrandSortId>('featured');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get<BrandListItem[]>('/brands?isActive=true');
      const data = Array.isArray(res.data) ? res.data : [];
      setRaw(data.filter((b) => b.slug));
    } catch {
      setFetchError('Impossible de charger les marques pour le moment.');
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredSorted = useMemo(() => {
    let list = raw;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const name = b.name.toLowerCase();
        const bio = (b.bio ?? '').toLowerCase();
        return name.includes(q) || bio.includes(q);
      });
    }
    if (verifiedOnly) list = list.filter((b) => b.isVerified);
    return sortBrands(list, sort);
  }, [raw, query, verifiedOnly, sort]);

  const spotlight = useMemo(() => filteredSorted.slice(0, Math.min(2, filteredSorted.length)), [filteredSorted]);
  const gridItems = useMemo(() => filteredSorted.slice(2), [filteredSorted]);

  const hasFilters = query.trim().length > 0 || verifiedOnly;
  const showSpotlight = spotlight.length > 0 && filteredSorted.length > 0;

  const handleSubmitSearch = useCallback(() => {
    setQuery((q) => q.trim());
  }, []);

  return (
    <>
      <BrandsHero brandCount={filteredSorted.length} loading={loading} />

      <BrandsToolbar
        query={query}
        onQueryChange={setQuery}
        onSubmitSearch={handleSubmitSearch}
        sort={sort}
        onSortChange={setSort}
        verifiedOnly={verifiedOnly}
        onVerifiedOnlyChange={setVerifiedOnly}
      />

      {!loading && filteredSorted.length > 0 && (
        <section
          aria-label="Mise en avant éditoriale"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(28px, 5vw, 44px) var(--layout-container-padding) clamp(8px, 2vw, 12px)',
          }}
        >
          <div
            style={{
              marginBottom: 'clamp(20px, 3vw, 28px)',
              maxWidth: '720px',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '2.8px',
                textTransform: 'uppercase',
                margin: '0 0 14px',
              }}
            >
              Kollect pick · Couverture
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                fontWeight: 900,
                color: '#0a0a0a',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                margin: '0 0 14px',
              }}
            >
              Une marque en lumière,
              <br />
              <span style={{ color: 'rgba(0,0,0,0.42)' }}>comme une une qui se renouvelle.</span>
            </h2>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(0,0,0,0.5)',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '560px',
              }}
            >
              Tous les trois jours, on met une marque streetwear sénégalaise à la une : pas de pub, une vraie vitrine
              éditoriale. Suis le fil, ouvre la boutique — c’est là que l’histoire de la marque prend tout son sens.
            </p>
          </div>
          <BrandFeatured brands={filteredSorted} />
        </section>
      )}

      <div style={{ padding: '32px 0 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 var(--layout-container-padding)' }}>
          {fetchError && (
            <p style={{ color: '#FF453A', fontSize: 14, marginBottom: 20, padding: '0 12px' }}>{fetchError}</p>
          )}

          {loading && <BrandsGridSkeleton />}

          {!loading && filteredSorted.length === 0 && <BrandsEmpty hasFilters={hasFilters} />}

          {!loading && filteredSorted.length > 0 && (
            <>
              {showSpotlight && (
                <div style={{ marginBottom: gridItems.length > 0 ? 40 : 0 }}>
                  <BrandSpotlight brands={spotlight} />
                </div>
              )}

              {gridItems.length > 0 && (
                <section aria-label="Toutes les marques">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 16,
                      margin: '0 12px 20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                        fontWeight: 900,
                        color: '#0a0a0a',
                        letterSpacing: '-0.3px',
                        margin: 0,
                      }}
                    >
                      Toutes les marques
                    </h2>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                      {filteredSorted.length} résultat{filteredSorted.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ margin: '0 12px' }}>
                    <BrandsGrid brands={gridItems} />
                  </div>
                </section>
              )}

              {gridItems.length === 0 && spotlight.length > 0 && filteredSorted.length <= 2 && (
                <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(0,0,0,0.4)', margin: '24px 12px 0' }}>
                  Toutes les marques sélectionnées sont affichées ci-dessus.
                </p>
              )}
            </>
          )}
        </div>

        {!loading && <BrandsCreatorCta />}
      </div>
    </>
  );
}

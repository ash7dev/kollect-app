'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
}

interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
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

export function CuratedSelection() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const popularRes = await apiClient.get<ProductCard[]>('/produits/popular?limit=8&days=30');
        let list = Array.isArray(popularRes.data) ? popularRes.data : [];
        if (!list.length) {
          const randomRes = await apiClient.get<{ data?: ProductCard[] } | ProductCard[]>(
            '/produits/public/random?limit=8&page=1',
          );
          const raw = randomRes.data;
          list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && 'data' in raw ? raw.data ?? [] : [];
        }
        setProducts(list.filter((p) => p.slug));
      } catch (e) {
        console.error('CuratedSelection:', e);
        setProducts([]);
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
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '12px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {products.map((p) => {
              const img = mediaUrl(p.images?.[0]);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  style={{
                    flex: '0 0 min(242px, 78vw)',
                    scrollSnapAlign: 'start',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  className="curated-card"
                >
                  <div
                    className="curated-card-face"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: `transform var(--duration-fast) var(--easing-ease-in-out), box-shadow var(--duration-fast) var(--easing-ease-in-out)`,
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '3/4',
                        backgroundColor: '#F3F3F3',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(145deg, #ECECEC, #F5F5F5)',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: 'var(--spacing-md) var(--spacing-md) 18px' }}>
                      {p.brand?.name && (
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(0,0,0,0.45)', letterSpacing: '1.6px', textTransform: 'uppercase', margin: '0 0 6px' }}>
                          {p.brand.name}
                        </p>
                      )}
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#000000', margin: '0 0 8px', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: '#FF3B30', margin: 0, letterSpacing: '-0.4px' }}>{formatPrice(p.price)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes curatedSk {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .curated-card-face:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        .curated-see-all:hover {
          border-color: rgba(255,255,255,0.35) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }
        .curated-rail { scrollbar-width: thin; }
      `}</style>
    </section>
  );
}

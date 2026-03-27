'use client';

import Link from 'next/link';
import { env } from '@/config/env';

type BrandCollectionCardItem = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  _count?: { products: number } | null;
};

type BrandCollectionsStripProps = {
  collections: BrandCollectionCardItem[];
};

function mediaUrl(url?: string | null) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function BrandCollectionsStrip({ collections }: BrandCollectionsStripProps) {
  if (!collections.length) return null;

  const visible = collections.slice(0, 8);

  return (
    <section id="collections" aria-label="Collections de la marque" style={{ padding: '22px 12px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 20, fontWeight: 1000, margin: 0, letterSpacing: '-0.5px' }}>Collections</h2>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.45)' }}>{visible.length} sélectionnées</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            paddingBottom: 12,
            scrollSnapType: 'x mandatory',
          }}
        >
          {visible.map((c) => {
            const img = mediaUrl(c.coverImage);
            const count = c._count?.products ?? 0;
            return (
              <Link
                key={c.id}
                href={`/collection/${encodeURIComponent(c.slug)}`}
                style={{
                  flex: '0 0 min(240px, 78vw)',
                  scrollSnapAlign: 'start',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ aspectRatio: '3 / 4', backgroundColor: '#f5f5f5', position: 'relative' }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #ececec, #f5f5f5)' }} />
                    )}

                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
                      }}
                    />

                    <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, zIndex: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 1000, margin: 0, color: '#fff', letterSpacing: '-0.3px' }}>{c.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 900, marginTop: 6, color: 'rgba(255,255,255,0.75)' }}>{count} pièce{count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


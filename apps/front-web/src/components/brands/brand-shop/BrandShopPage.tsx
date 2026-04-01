'use client';

import { useCallback, useMemo, useState } from 'react';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { BrandShopBanner } from '@/components/brands/brand-shop/BrandShopBanner';
import { BrandProductsGrid } from '@/components/brands/brand-shop/BrandProductsGrid';
import { brandAccentCss } from '@/components/brands/brandAccent';
import { brandMediaUrl } from '@/components/brands/brand-media';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import type { BrandProductCardItem } from '@/components/brands/brand-shop/BrandProductCard';
import { BrandTrustBadges } from '@/components/brands/brand-shop/BrandTrustBadges';
import { getMediaUrl, resolveBrandImage } from '@/lib/brand-utils';
import { BrandReviews } from '@/components/brands/brand-shop/BrandReviews';
import { BrandBio } from '@/components/brands/brand-shop/BrandBio';
import { BrandCollectionCards } from '@/components/brands/brand-shop/BrandCollectionCards';
import { BrandGallery } from '@/components/brands/brand-shop/BrandGallery';
import { BrandUpcomingDrop } from '@/components/brands/brand-shop/BrandUpcomingDrop';
import { BrandRecentDrop } from '@/components/brands/brand-shop/BrandRecentDrop';

type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type BrandCollection = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  status?: string | null;
  launchDate?: string | null;
  launchedAt?: string | null;
  createdAt?: string | null;
  _count?: { products: number } | null;
};

type BrandDetail = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  isVerified?: boolean;
  followerCount?: number | null;
  collections?: BrandCollection[];
  instagram?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  _count?: { products: number; collections: number; favoris?: number; reviews?: number } | null;
};

type CollectionGroup = {
  name: string;
  slug: string;
  products: BrandProductCardItem[];
};

type BrandShopPageProps = {
  brand: BrandDetail;
  initialProducts: BrandProductCardItem[];
  initialMeta: PaginatedMeta;
};



function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function groupProductsByCollection(
  products: BrandProductCardItem[],
  collections: BrandCollection[],
): CollectionGroup[] {
  const map = new Map<string, CollectionGroup>();

  for (const p of products) {
    const name = p.collection?.name ?? 'Autres';
    if (!map.has(name)) {
      const col = collections.find((c) => c.name === name);
      const slug = col?.slug ?? slugify(name);
      map.set(name, { name, slug, products: [] });
    }
    map.get(name)!.products.push(p);
  }

  // Preserve brand's collection order
  const ordered: CollectionGroup[] = [];
  for (const c of collections) {
    const group = map.get(c.name);
    if (group) ordered.push(group);
  }
  // Append any remaining groups (e.g., "Autres")
  for (const group of map.values()) {
    if (!ordered.find((o) => o.name === group.name)) ordered.push(group);
  }

  return ordered;
}

export function BrandShopPage({ brand, initialProducts, initialMeta }: BrandShopPageProps) {
  const [products, setProducts] = useState<BrandProductCardItem[]>(initialProducts);
  const [meta, setMeta] = useState<PaginatedMeta>(initialMeta);
  const [loading, setLoading] = useState(false);

  const accent = useMemo(() => brandAccentCss(brand.id), [brand.id]);
  const bannerUrl = useMemo(() => resolveBrandImage({
    coverImage: brand.coverImage,
    collections: brand.collections,
    firstProductImage: initialProducts?.[0]?.images?.[0]
  }), [brand, initialProducts]);
  const logoUrl = useMemo(() => brandMediaUrl(brand.logo), [brand.logo]);
  const collections = useMemo(() => brand.collections ?? [], [brand.collections]);
  const groupedProducts = useMemo(
    () => groupProductsByCollection(products, collections),
    [products, collections],
  );
  const hasMore = meta.page < meta.totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: BrandProductCardItem[]; meta: PaginatedMeta }>(
        API_ENDPOINTS.PRODUITS.BY_BRAND_SLUG(brand.slug, meta.page + 1, 100, 'recent'),
      );
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setProducts((prev) => [...prev, ...data]);
      if (res.data?.meta) setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  }, [brand.slug, hasMore, loading, meta]);

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      minHeight: '100vh',
      fontFamily: FONT_FAMILY_INTER
    }}>
      <style>{`
        html { scroll-behavior: smooth; scroll-padding-top: 132px; }
        .brand-tabs-strip::-webkit-scrollbar { display: none; }
        @media (max-width: 640px) {
          .bsp-products-wrapper { padding: 0 16px 60px !important; }
          .bsp-collection-header { margin-bottom: 28px !important; padding: 0 4px !important; }
          .bsp-footer { padding: 48px 16px 40px !important; }
          .bsp-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .bsp-footer-stats { gap: 20px !important; flex-wrap: wrap !important; }
        }
      `}</style>

      {/* Hero banner */}
      <BrandShopBanner
        brandId={brand.id}
        brandName={brand.name}
        logoUrl={logoUrl}
        bannerUrl={bannerUrl}
        accent={accent}
        collectionsCount={brand._count?.collections ?? Math.max(collections.length, groupedProducts.length)}
        productsCount={meta.total}
        followerCount={brand.followerCount ?? 0}
        isVerified={!!brand.isVerified}
      />

      {/* Bio */}
      {brand.bio && (
        <BrandBio bio={brand.bio} accent={accent} />
      )}

      {/* Upcoming drop — collection en TEASER avec launchDate future */}
      {(() => {
        const upcoming = collections.find(
          (c) =>
            c.status === 'TEASER' &&
            c.launchDate &&
            new Date(c.launchDate).getTime() > Date.now(),
        );
        return upcoming ? (
          <div style={{ position: 'relative' }}>
            {/* Phrase d'annonce — même style que les titres de collection */}
            <div style={{
              textAlign: 'center',
              padding: '64px 28px 32px',
              backgroundColor: '#fff',
            }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(255,59,48,0.08)',
                border: '1px solid rgba(255,59,48,0.25)',
                color: '#FF3B30',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}>
                Prochainement
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                fontWeight: 900,
                letterSpacing: '-2px',
                color: '#000',
                margin: '0 0 16px',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                {brand.name} arrive
              </h2>
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.45)',
                margin: '0 auto',
                maxWidth: 520,
                lineHeight: 1.7,
              }}>
                La communauté attend avec impatience. Sois parmi les premiers à découvrir ce qui va marquer l&apos;histoire du streetwear sénégalais.
              </p>
            </div>
            <BrandUpcomingDrop
              collection={{
                id: upcoming.id,
                name: upcoming.name,
                slug: upcoming.slug,
                coverImage: upcoming.coverImage,
                teaserVideo: upcoming.teaserVideo,
                launchDate: upcoming.launchDate,
                brand: { slug: brand.slug, name: brand.name },
              }}
            />
          </div>
        ) : null;
      })()}

      {/* Recent drop — collection DISPONIBLE sortie dans les 15 derniers jours */}
      {(() => {
        const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
        const recent = collections.find((c) => {
          if (c.status !== 'DISPONIBLE') return false;
          const ref = c.launchDate ?? c.launchedAt ?? c.createdAt;
          if (!ref) return false;
          const diff = Date.now() - new Date(ref).getTime();
          return diff >= 0 && diff <= FIFTEEN_DAYS;
        });
        return recent ? (
          <div style={{ position: 'relative' }}>
            {/* Phrase d'annonce — même style que les titres de collection */}
            <div style={{
              textAlign: 'center',
              padding: '64px 28px 32px',
              backgroundColor: '#fff',
            }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(255,149,0,0.08)',
                border: '1px solid rgba(255,149,0,0.25)',
                color: '#FF9500',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}>
                Disponible maintenant
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                fontWeight: 900,
                letterSpacing: '-2px',
                color: '#000',
                margin: '0 0 16px',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                {brand.name} est là
              </h2>
              <p style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.45)',
                margin: '0 auto',
                maxWidth: 520,
                lineHeight: 1.7,
              }}>
                La collection tant attendue est enfin là. Découvre les pièces qui vont définir le style du moment.
              </p>
            </div>
            <BrandRecentDrop
              collection={{
                id: recent.id,
                name: recent.name,
                slug: recent.slug,
                coverImage: recent.coverImage,
                teaserVideo: recent.teaserVideo,
                launchDate: recent.launchDate,
                launchedAt: recent.launchedAt,
                createdAt: recent.createdAt,
                brand: { slug: brand.slug, name: brand.name },
              }}
            />
          </div>
        ) : null;
      })()}

      {/* Collection cards */}
      {groupedProducts.length > 0 && (
        <BrandCollectionCards collections={groupedProducts} accent={accent} />
      )}

      {/* Galerie style Pinterest */}
      <BrandGallery products={products} brandName={brand.name} collections={collections} accent={accent} />

      
      {/* Products — grouped by collection */}
      <div className="bsp-products-wrapper" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px 80px' }}>
        {groupedProducts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(0,0,0,0.35)' }}>
            {(() => {
              const hasUpcoming = collections.some(c => c.status === 'TEASER' && c.launchDate && new Date(c.launchDate).getTime() > Date.now());
              if (hasUpcoming) {
                return <p style={{ fontSize: 16, fontWeight: 600 }}>Les produits du drop arrivent très bientôt.</p>;
              }
              return <p style={{ fontSize: 16, fontWeight: 600 }}>Aucun produit disponible pour le moment.</p>;
            })()}
          </div>
        )}

        {groupedProducts.map((group) => {
          const isTeaser = collections.find((c) => c.name === group.name)?.status === 'TEASER';

          return (
            <section
              key={group.slug}
              id={`col-${group.slug}`}
              aria-label={`Collection ${group.name}`}
              style={{ paddingTop: 70, marginBottom: 20 }}
            >
              {/* Collection header — centré */}
              <div className="bsp-collection-header" style={{ textAlign: 'center', marginBottom: 48, padding: '0 20px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px', borderRadius: 999,
                  backgroundColor: isTeaser ? 'rgba(255,59,48,0.08)' : `${accent}18`,
                  border: isTeaser ? '1px solid rgba(255,59,48,0.25)' : `1px solid ${accent}55`,
                  color: isTeaser ? '#FF3B30' : accent,
                  fontSize: 10, fontWeight: 900, letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}>
                  {isTeaser ? 'Bientôt disponible' : 'Collection'}
                </span>
                <h2 style={{
                  fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-2px',
                  color: '#000',
                  margin: '0 0 16px',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {group.name}
                </h2>
                <p style={{
                  fontSize: 15, fontWeight: 500,
                  color: 'rgba(0,0,0,0.45)',
                  margin: '0 auto',
                  maxWidth: 520,
                  lineHeight: 1.7,
                }}>
                  {group.products.length} pièce{group.products.length > 1 ? 's' : ''} — {isTeaser ? 'drop imminent' : 'disponibles maintenant'}
                </p>
              </div>

              <BrandProductsGrid 
                brandSlug={brand.slug} 
                brandName={brand.name} 
                products={group.products} 
                accent={accent} 
                isTeaser={isTeaser}
              />
            </section>
          );
        })}

        {/* Load more (edge case: paginated brands with 100+ products) */}
        {hasMore && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              style={{
                padding: '13px 28px', borderRadius: 14,
                border: '1.5px solid rgba(0,0,0,0.12)',
                backgroundColor: '#fff',
                fontSize: 14, fontWeight: 800,
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Chargement…' : 'Voir plus de produits'}
            </button>
          </div>
        )}
      </div>


      <BrandTrustBadges brandName={brand.name} accent={accent} whatsapp={brand.whatsapp} />
      <BrandReviews accent={accent} />

      {/* ── Footer de marque ── */}
      <section
        id="apropos"
        className="bsp-footer"
        style={{
          backgroundColor: '#0a0a0a',
          color: '#fff',
          borderRadius: '32px 32px 0 0',
          padding: '64px 28px 48px',
          marginTop: -2,
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Top row : logo + nom + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48, flexWrap: 'wrap' }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl} alt=""
                style={{
                  width: 72, height: 72, borderRadius: 20, objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 0 0 4px ${accent}22`,
                }}
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900,
                  letterSpacing: '-1px', color: '#fff', margin: 0, textTransform: 'uppercase',
                }}>
                  {brand.name}
                </h2>
                {brand.isVerified && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999,
                    backgroundColor: `${accent}22`, border: `1px solid ${accent}55`,
                    fontSize: 10, fontWeight: 900, letterSpacing: '1.5px',
                    textTransform: 'uppercase', color: accent,
                  }}>
                    ✓ Vérifiée
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 600 }}>
                Boutique officielle sur Kollect
              </p>
            </div>
          </div>

          {/* Grid : bio + stats */}
          <div className="bsp-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>

            {/* Bio */}
            <div>
              <p style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '3px',
                textTransform: 'uppercase', color: accent, marginBottom: 14,
              }}>
                À propos
              </p>
              {brand.bio ? (
                <p style={{ fontSize: 16, lineHeight: 1.9, color: 'rgba(255,255,255,0.55)', maxWidth: 580, margin: 0 }}>
                  {brand.bio}
                </p>
              ) : (
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>
                  Aucune description disponible pour cette marque.
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="bsp-footer-stats" style={{ display: 'flex', gap: 40, flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-1.5px' }}>
                  {meta.total}
                </p>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 6, margin: '6px 0 0' }}>
                  Produits
                </p>
              </div>
              {collections.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-1.5px' }}>
                    {collections.length}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 6, margin: '6px 0 0' }}>
                    Collection{collections.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {typeof brand.followerCount === 'number' && brand.followerCount > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-1.5px' }}>
                    {new Intl.NumberFormat('fr-FR').format(brand.followerCount)}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>
                    Abonnés
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collections pills */}
          {collections.length > 0 && (
            <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {collections.map((c) => (
                <a
                  key={c.id}
                  href={`#col-${c.slug}`}
                  style={{
                    padding: '7px 16px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 12, fontWeight: 700,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                  {c._count?.products ? <span style={{ marginLeft: 6, opacity: 0.45 }}>{c._count.products}</span> : null}
                </a>
              ))}
            </div>
          )}

          {/* Réseaux sociaux */}
          {(brand.instagram || brand.whatsapp || brand.website) && (
            <div style={{ marginTop: 36, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {brand.instagram && (
                <a
                  href={`https://instagram.com/${brand.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  @{brand.instagram.replace(/^@/, '')}
                </a>
              )}
              {brand.whatsapp && (
                <a
                  href={`https://wa.me/${brand.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              {brand.website && (
                <a
                  href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          )}

          {/* Bottom bar */}
          <div style={{ marginTop: 52, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
              © {new Date().getFullYear()} {brand.name} · Propulsé par <strong style={{ color: 'rgba(255,255,255,0.4)' }}>Kollect</strong>
            </p>
            <a
              href="/brands"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.55)',
                fontSize: 12, fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Explorer d&apos;autres marques
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';
import { PublicCollectionHero } from './PublicCollectionHero';
import { BrandProductsGrid } from '@/components/brands/brand-shop/BrandProductsGrid';
import { BrandsCreatorCta } from '@/components/brands/BrandsCreatorCta';
import type { PublicCollection } from '@/types/drops';
import type { BrandProductCardItem } from '@/components/brands/brand-shop/BrandProductCard';

type PublicCollectionPageProps = {
  collection: PublicCollection;
  products: BrandProductCardItem[];
};

export function PublicCollectionPage({ collection, products }: PublicCollectionPageProps) {
  const isTeaser = collection.status === 'TEASER';
  const canShowGrid = (collection.status === 'DISPONIBLE' || isTeaser) && products.length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: FONT_FAMILY_INTER }}>
      <PublicCollectionHero collection={collection} />

      {/* Products */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px' }}>
        {canShowGrid ? (
          <>
            <div style={{ marginBottom: 48 }}>
              <p style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#FF3B30',
                margin: '0 0 12px',
              }}>
                Les pièces
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 900,
                letterSpacing: '-1.5px',
                color: '#000',
                margin: 0,
                textTransform: 'uppercase',
              }}>
                {collection.name}
              </h2>
            </div>
            <BrandProductsGrid
              brandSlug={collection.brand.slug}
              products={products}
              accent="#FF3B30"
              isTeaser={isTeaser}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.3)',
              letterSpacing: '-0.3px',
            }}>
              {isTeaser
                ? 'Les produits sont déjà prêts, mais seront révélés au lancement.'
                : 'Aucun produit disponible pour l\'instant.'}
            </p>
          </div>
        )}
      </section>

      <BrandsCreatorCta />
    </div>
  );
}

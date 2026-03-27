'use client';

import { useState, useEffect } from 'react';
import { CollectionsHero } from '../hero/CollectionsHero';
import { ComingSoonCollections } from '../sections/ComingSoonCollections';
import { NewCollections } from '../sections/NewCollections';
import { FeaturedCollections } from '../sections/FeaturedCollections';
import { AllCollections } from '../sections/AllCollections';
import { BrandsCreatorCta } from '@/components/brands/BrandsCreatorCta';
import type { PublicCollection } from '@/types/drops';

type CollectionsPageProps = {
  collections: PublicCollection[];
};

export function CollectionsPage({ collections }: CollectionsPageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  const comingSoonCollections = collections.filter(c => c.status === 'TEASER');
  const newCollections = collections.filter(c =>
    c.status === 'DISPONIBLE' &&
    c.launchedAt != null &&
    new Date(c.launchedAt) >= fifteenDaysAgo
  );
  const featuredCollections = collections.filter(c => c.isFeatured && c.status === 'DISPONIBLE');
  const allCollections = collections.filter(c => c.status === 'DISPONIBLE');

  return (
    <div style={{
      backgroundColor: '#fff',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.6s ease-out',
    }}>
      <CollectionsHero />

      {comingSoonCollections.length > 0 && (
        <ComingSoonCollections collections={comingSoonCollections} />
      )}

      {newCollections.length > 0 && (
        <NewCollections collections={newCollections} />
      )}

      {featuredCollections.length > 0 && (
        <FeaturedCollections
          collections={featuredCollections}
          isFirstSection={comingSoonCollections.length === 0 && newCollections.length === 0}
        />
      )}

      <AllCollections collections={allCollections} />

      <BrandsCreatorCta />
    </div>
  );
}

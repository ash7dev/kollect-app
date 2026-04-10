'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCeoCollections } from '@/services/api/collections';

/**
 * Retourne toutes les collections du CEO authentifié.
 * La limite par défaut est 50 pour couvrir tous les cas sans paginer.
 * Si un CEO dépasse 50 drops, augmenter la limite ici.
 */
export function useCeoCollections(limit = 50) {
  return useQuery({
    queryKey: ['dashboard', 'collections', 'ceo', { limit }],
    queryFn: () => fetchCeoCollections(limit),
  });
}

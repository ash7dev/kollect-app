'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCeoCollectionDetail } from '@/services/api/collections';

export function useCeoCollection(id: string) {
  return useQuery({
    queryKey: ['dashboard', 'collections', 'ceo', id],
    queryFn: () => fetchCeoCollectionDetail(id),
    enabled: Boolean(id),
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCeoCollections } from '@/services/api/collections';

export function useCeoCollections() {
  return useQuery({
    queryKey: ['dashboard', 'collections', 'ceo'],
    queryFn: fetchCeoCollections,
  });
}


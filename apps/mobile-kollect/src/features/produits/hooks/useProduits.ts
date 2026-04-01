
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produitsService, ProduitDto, CreateProduitPayload } from '../services/produits.service';
import { useProduitsStore } from '../store/produitsStore';

const STALE_TIME = 30_000; // 30s
const REFRESH_INTERVAL = 60_000; // 1min

export function useProduits(params?: { collectionId?: string }) {
  const setProduits = useProduitsStore((s) => s.setProduits);
  const query = useQuery<ProduitDto[]>({
    queryKey: ['produits', params?.collectionId],
    queryFn: () =>
      produitsService
        .listForCEO({ collectionId: params?.collectionId })
        .then((r) => r.data || []),
    staleTime: STALE_TIME,
    refetchInterval: REFRESH_INTERVAL,
  });

  useEffect(() => {
    if (query.data) {
      setProduits(query.data);
    }
  }, [query.data, setProduits]);

  return query;
}

export function useDeletedProduits(params?: { collectionId?: string }) {
  return useQuery<ProduitDto[]>({
    queryKey: ['produits-deleted', params?.collectionId],
    queryFn: () =>
      produitsService
        .listDeletedForCEO({ collectionId: params?.collectionId })
        .then((r) => r.data || []),
    staleTime: STALE_TIME,
    refetchInterval: REFRESH_INTERVAL,
  });
}

export function useCreateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProduitPayload) => produitsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produits'] }),
  });
}



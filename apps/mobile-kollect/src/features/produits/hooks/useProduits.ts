/* eslint-disable prettier/prettier */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produitsService, ProduitDto } from '../services/produits.service';
import { useProduitsStore } from '../store/produitsStore';

const STALE_TIME = 30_000; // 30s
const REFRESH_INTERVAL = 60_000; // 1min

export function useProduits(params?: { collectionId?: string }) {
  const setProduits = useProduitsStore((s) => s.setProduits);
  return useQuery({
    queryKey: ['produits', params?.collectionId],
    queryFn: () => produitsService.listForCEO({ collectionId: params?.collectionId }).then(r => r.data),
    staleTime: STALE_TIME,
    refetchInterval: REFRESH_INTERVAL,
    onSuccess: (data: ProduitDto[]) => setProduits(data),
  });
}

export function useCreateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: produitsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produits'] }),
  });
}



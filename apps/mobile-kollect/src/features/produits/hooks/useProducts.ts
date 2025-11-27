import { useQuery } from '@tanstack/react-query';
import { produitsService } from '@/features/produits/services/produits.service';

export function useProducts(params?: { collectionId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['products', 'ceo', params],
    queryFn: () => produitsService.listForCEO(params),
    staleTime: 30000, // 30 secondes
  });
}

export function useDeletedProducts(params?: { collectionId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['products-deleted', 'ceo', params],
    queryFn: () => produitsService.listDeletedForCEO(params),
    staleTime: 30000,
  });
}

export function useProductDetails(id: string) {
  return useQuery({
    queryKey: ['product', 'ceo', id],
    queryFn: () => produitsService.getForCEO(id),
    enabled: !!id,
    staleTime: 30000,
  });
}


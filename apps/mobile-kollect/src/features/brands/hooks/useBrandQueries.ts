import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  brandService, 
  CreateBrandFormData, 
  UpdateBrandFormData 
} from '../services/brand.service';
import { useBrandStore } from '../store/brandStore';

// Query Keys
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters?: any) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
  slug: (slug: string) => [...brandKeys.all, 'slug', slug] as const,
  myBrand: () => [...brandKeys.all, 'my-brand'] as const,
  stats: (brandId: string) => [...brandKeys.all, 'stats', brandId] as const,
};

/**
 * 🏠 Hook pour récupérer MA marque (CEO Dashboard)
 */
export const useMyBrand = () => {
  const setMyBrand = useBrandStore((state) => state.setMyBrand);

  return useQuery({
    queryKey: brandKeys.myBrand(),
    queryFn: async () => {
      const brand = await brandService.getMyBrand();
      setMyBrand(brand); // Synchroniser avec le store
      return brand;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si 404 (pas de marque)
      if (error?.message?.includes('404') || error?.message?.includes('non trouvée')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * 📋 Hook pour récupérer toutes les marques (public)
 */
export const useBrands = (filters?: {
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: () => brandService.getAllBrands(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * 🔍 Hook pour récupérer une marque par slug (public)
 */
export const useBrandBySlug = (slug: string) => {
  return useQuery({
    queryKey: brandKeys.slug(slug),
    queryFn: () => brandService.getBrandBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};



/**
 * 🏪 Hook pour créer une marque avec upload de logo
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const setMyBrand = useBrandStore((state) => state.setMyBrand);

  return useMutation({
    mutationFn: (data: CreateBrandFormData) => brandService.createBrand(data),
    onSuccess: (brand) => {
      console.log('✅ [Mutation] Marque créée:', brand.id);
      
      // Mettre à jour le store
      setMyBrand(brand);
      
      // Invalider les queries
      queryClient.invalidateQueries({ queryKey: brandKeys.myBrand() });
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      // ⚠️ NE PAS invalider currentUser ici - cela déclencherait la navigation avant l'Alert
      // La mise à jour du user sera faite via refreshAuth() dans le onPress de l'Alert
    },
    onError: (error: any) => {
      console.error('❌ [Mutation] Erreur création marque:', error);
    },
  });
};

/**
 * ✏️ Hook pour mettre à jour MA marque avec upload de logo
 */
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const setMyBrand = useBrandStore((state) => state.setMyBrand);

  return useMutation({
    mutationFn: ({ brandId, data }: { brandId: string; data: UpdateBrandFormData }) =>
      brandService.updateBrand(brandId, data),
    onSuccess: (brand) => {
      console.log('✅ [Mutation] Marque mise à jour:', brand.id);
      
      // Mettre à jour le store
      setMyBrand(brand);
      
      // Invalider les queries
      queryClient.invalidateQueries({ queryKey: brandKeys.myBrand() });
      queryClient.invalidateQueries({ queryKey: brandKeys.slug(brand.slug) });
    },
  });
};

/**
 * 🗑️ Hook pour désactiver MA marque
 */
export const useDeactivateBrand = () => {
  const queryClient = useQueryClient();
  const setMyBrand = useBrandStore((state) => state.setMyBrand);

  return useMutation({
    mutationFn: (brandId: string) => brandService.deactivateBrand(brandId),
    onSuccess: (brand) => {
      console.log('✅ [Mutation] Marque désactivée:', brand.id);
      
      setMyBrand(brand);
      queryClient.invalidateQueries({ queryKey: brandKeys.myBrand() });
    },
  });
};

/**
 * 🔄 Hook pour réactiver MA marque
 */
export const useReactivateBrand = () => {
  const queryClient = useQueryClient();
  const setMyBrand = useBrandStore((state) => state.setMyBrand);

  return useMutation({
    mutationFn: (brandId: string) => brandService.reactivateBrand(brandId),
    onSuccess: (brand) => {
      console.log('✅ [Mutation] Marque réactivée:', brand.id);
      
      setMyBrand(brand);
      queryClient.invalidateQueries({ queryKey: brandKeys.myBrand() });
    },
  });
};

/**
 * 📊 Hook pour récupérer les stats complètes de MA marque
 */
export const useBrandStats = (
  brandId: string,
  period: '7days' | '30days' | '90days' = '30days',
) => {
  return useQuery({
    queryKey: [...brandKeys.stats(brandId), period],
    queryFn: () => brandService.getBrandStats(brandId, period),
    enabled: !!brandId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
};

/**
 * 📈 Hook pour récupérer les données de ventes par période
 */
export const useSalesData = (
  brandId: string, 
  period: '7days' | '30days' | '90days' = '7days'
) => {
  return useQuery({
    queryKey: [...brandKeys.stats(brandId), 'sales', period],
    queryFn: () => brandService.getSalesData(brandId, period),
    enabled: !!brandId,
    staleTime: 2 * 60 * 1000,
  });
};

// src/services/api/endpoints.ts
// Centralisation de toutes les routes API

export const API_ENDPOINTS = {
  // ============================================
  // AUTH
  // ============================================
  AUTH: {
    SYNC: '/auth/sync',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FCM_TOKEN: '/auth/fcm-token',
    HEALTH: '/auth/health',
  },

  // ============================================
  // COLLECTIONS (Public + CEO)
  // ============================================
  COLLECTIONS: {
    HOME: '/collections/home',
    FEATURED: (limit = 6) => `/collections/featured?limit=${limit}`,
    TRENDING: (limit = 10) => `/collections/trending?limit=${limit}`,
    NEW: (limit = 10) => `/collections/new?limit=${limit}`,
    COMING_SOON: (limit = 10) => `/collections/coming-soon?limit=${limit}`,
    PUBLIC_LIST: (params?: { page?: number; limit?: number; isFeatured?: boolean; includeProducts?: boolean }) => {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const isFeatured = params?.isFeatured;
      const includeProducts = params?.includeProducts;
      const search = new URLSearchParams();
      search.set('page', String(page));
      search.set('limit', String(limit));
      if (typeof isFeatured === 'boolean') search.set('isFeatured', String(isFeatured));
      if (typeof includeProducts === 'boolean') search.set('includeProducts', String(includeProducts));
      return `/collections/public?${search.toString()}`;
    },
    PUBLIC_ONE: (id: string, includeProducts = false) =>
      `/collections/public/${id}?includeProducts=${includeProducts}`,
  },

  // ============================================
  // PRODUITS (Public + CEO)
  // ============================================
  PRODUITS: {
    FEATURED: (limit = 10) => `/produits/featured?limit=${limit}`,
    POPULAR: (limit = 20, days = 30) => `/produits/popular?limit=${limit}&days=${days}`,
    NEW: (limit = 20, days = 14) => `/produits/new?limit=${limit}&days=${days}`,
    PERSONALIZED: (limit = 20) => `/produits/personalized?limit=${limit}`,
    SEARCH: (params: {
      query?: string;
      brandId?: string;
      collectionId?: string;
      minPrice?: number;
      maxPrice?: number;
      sizes?: string[];
      colors?: string[];
      inStock?: boolean;
      page?: number;
      limit?: number;
    }) => {
      const search = new URLSearchParams();
      if (params.query) search.set('query', params.query);
      if (params.brandId) search.set('brandId', params.brandId);
      if (params.collectionId) search.set('collectionId', params.collectionId);
      if (typeof params.minPrice === 'number') search.set('minPrice', String(params.minPrice));
      if (typeof params.maxPrice === 'number') search.set('maxPrice', String(params.maxPrice));
      if (params.sizes?.length) search.set('sizes', params.sizes.join(','));
      if (params.colors?.length) search.set('colors', params.colors.join(','));
      if (typeof params.inStock === 'boolean') search.set('inStock', String(params.inStock));
      search.set('page', String(params.page ?? 1));
      search.set('limit', String(params.limit ?? 20));
      return `/produits/search?${search.toString()}`;
    },
    BY_BRAND_SLUG: (slug: string, page = 1, limit = 20, sortBy: 'recent' | 'popular' | 'price-asc' | 'price-desc' = 'recent') =>
      `/produits/brand/${slug}?page=${page}&limit=${limit}&sortBy=${sortBy}`,
    BY_COLLECTION: (id: string, limit = 10) => `/produits/collection/${id}?limit=${limit}`,
    RANDOM_PUBLIC: (query: Record<string, string | number | boolean> = {}) => {
      const search = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => search.set(k, String(v)));
      const qs = search.toString();
      return `/produits/public/random${qs ? `?${qs}` : ''}`;
    },
    PUBLIC_ONE: (id: string) => `/produits/public/${id}`,
  },

  // ============================================
  // BRANDS (Boutiques)
  // ============================================
  BRANDS: {
    // Routes publiques
    LIST: '/brands',
    BY_SLUG: (slug: string) => `/brands/slug/${slug}`,
    
    // Routes CEO
    CREATE: '/brands',
    MY_BRAND: '/brands/my-brand',
    
    // Routes propriétaire (CEO + ownership)
    UPDATE: (id: string) => `/brands/${id}`,
    DEACTIVATE: (id: string) => `/brands/${id}/deactivate`,
    REACTIVATE: (id: string) => `/brands/${id}/reactivate`,
    STATS: (id: string) => `/brands/${id}/stats`,
    
    // Routes admin
    VERIFY: (id: string) => `/brands/${id}/verify`,
    FORCE_DELETE: (id: string) => `/brands/${id}/force-delete`,
  },
};

// ============================================
// EXEMPLES D'UTILISATION (Frontend)
// ============================================

/*
// 1. Lister toutes les boutiques (public)
const brands = await apiClient.get(API_ENDPOINTS.BRANDS.LIST);

// 2. Lister avec filtres
const activeBrands = await apiClient.get(API_ENDPOINTS.BRANDS.LIST, {
  params: { isActive: true, search: 'fashion' }
});

// 3. Récupérer une boutique par slug (public)
const brand = await apiClient.get(API_ENDPOINTS.BRANDS.BY_SLUG('nike-official'));

// 4. Créer une boutique (CEO)
const newBrand = await apiClient.post(API_ENDPOINTS.BRANDS.CREATE, {
  name: 'Ma Boutique',
  slug: 'ma-boutique',
  bio: 'Description...',
  // ... autres champs
});

// 5. Récupérer MA boutique (CEO dashboard)
const myBrand = await apiClient.get(API_ENDPOINTS.BRANDS.MY_BRAND);

// 6. Mettre à jour MA boutique (CEO + ownership)
const updated = await apiClient.patch(
  API_ENDPOINTS.BRANDS.UPDATE('brand-id-123'),
  { bio: 'Nouvelle description' }
);

// 7. Désactiver MA boutique (CEO + ownership)
await apiClient.delete(API_ENDPOINTS.BRANDS.DEACTIVATE('brand-id-123'));

// 8. Réactiver MA boutique (CEO + ownership)
await apiClient.patch(API_ENDPOINTS.BRANDS.REACTIVATE('brand-id-123'));

// 9. Récupérer les stats (CEO + ownership)
const stats = await apiClient.get(API_ENDPOINTS.BRANDS.STATS('brand-id-123'));
// Retourne: { totalProducts, totalCollections, totalOrders, totalRevenue, ... }

// 10. Vérifier une boutique (Admin)
await apiClient.patch(API_ENDPOINTS.BRANDS.VERIFY('brand-id-123'));

// 11. Supprimer définitivement (Admin)
await apiClient.delete(API_ENDPOINTS.BRANDS.FORCE_DELETE('brand-id-123'));
*/
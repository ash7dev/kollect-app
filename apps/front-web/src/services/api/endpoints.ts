// src/services/api/endpoints.ts
// Copie locale des endpoints — source de vérité : packages/api-client/src/endpoints.ts
// Le package @kollect/api-client n'est pas résolu dans ce workspace Next.js (pas de dist buildé).
// Si tu mets en place un vrai monorepo (turborepo/nx), remplace ce fichier par :
//   export { API_ENDPOINTS } from '@kollect/api-client';

export const API_ENDPOINTS = {
  AUTH: {
    SYNC: '/auth/sync',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FCM_TOKEN: '/auth/fcm-token',
    HEALTH: '/auth/health',
  },

  COLLECTIONS: {
    HOME: '/collections/home',
    /** CEO */
    LIST_CEO: '/collections',
    CREATE: '/collections',
    DETAIL: (id: string) => `/collections/${id}`,
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    LAUNCH: (id: string) => `/collections/${id}/launch`,
    ACTIVATE_TEASER: (id: string) => `/collections/${id}/activate-teaser`,
    FEATURED: (limit = 6) => `/collections/featured?limit=${limit}`,
    TRENDING: (limit = 10) => `/collections/trending?limit=${limit}`,
    NEW: (limit = 10) => `/collections/new?limit=${limit}`,
    COMING_SOON: (limit = 10) => `/collections/coming-soon?limit=${limit}`,
    PUBLIC_LIST: (params?: {
      page?: number;
      limit?: number;
      isFeatured?: boolean;
      includeProducts?: boolean;
    }) => {
      const search = new URLSearchParams();
      search.set('page', String(params?.page ?? 1));
      search.set('limit', String(params?.limit ?? 10));
      if (typeof params?.isFeatured === 'boolean') {
        search.set('isFeatured', String(params.isFeatured));
      }
      if (typeof params?.includeProducts === 'boolean') {
        search.set('includeProducts', String(params.includeProducts));
      }
      return `/collections/public?${search.toString()}`;
    },
    PUBLIC_ONE: (id: string, includeProducts = false) =>
      `/collections/public/${id}?includeProducts=${includeProducts}`,
    PUBLIC_BY_SLUG: (slug: string) => `/collections/public/slug/${slug}`,
  },

  PRODUITS: {
    CREATE: '/produits',
    CEO_LIST: (params?: { page?: number; limit?: number; collectionId?: string }) => {
      const s = new URLSearchParams();
      s.set('page', String(params?.page ?? 1));
      s.set('limit', String(params?.limit ?? 50));
      if (params?.collectionId) s.set('collectionId', params.collectionId);
      return `/produits?${s.toString()}`;
    },
    CEO_ONE: (id: string) => `/produits/ceo/${id}`,
    UPDATE: (id: string) => `/produits/${id}`,
    DELETE: (id: string) => `/produits/${id}`,
    FEATURED: (limit = 10) => `/produits/featured?limit=${limit}`,
    POPULAR: (limit = 20, days = 30) =>
      `/produits/popular?limit=${limit}&days=${days}`,
    NEW: (limit = 20, days = 14) =>
      `/produits/new?limit=${limit}&days=${days}`,
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
      if (typeof params.minPrice === 'number') {
        search.set('minPrice', String(params.minPrice));
      }
      if (typeof params.maxPrice === 'number') {
        search.set('maxPrice', String(params.maxPrice));
      }
      if (params.sizes?.length) search.set('sizes', params.sizes.join(','));
      if (params.colors?.length) {
        search.set('colors', params.colors.join(','));
      }
      if (typeof params.inStock === 'boolean') {
        search.set('inStock', String(params.inStock));
      }
      search.set('page', String(params.page ?? 1));
      search.set('limit', String(params.limit ?? 20));
      return `/produits/search?${search.toString()}`;
    },
    BY_BRAND_SLUG: (
      slug: string,
      page = 1,
      limit = 20,
      sortBy: 'recent' | 'popular' | 'price-asc' | 'price-desc' = 'recent',
    ) => `/produits/brand/${slug}?page=${page}&limit=${limit}&sortBy=${sortBy}`,
    BY_COLLECTION: (id: string, limit = 10) =>
      `/produits/collection/${id}?limit=${limit}`,
    RANDOM_PUBLIC: (query: Record<string, string | number | boolean> = {}) => {
      const search = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => search.set(k, String(v)));
      const qs = search.toString();
      return `/produits/public/random${qs ? `?${qs}` : ''}`;
    },
    PUBLIC_ONE: (id: string) => `/produits/public/${id}`,
  },

  BRANDS: {
    LIST: '/brands',
    BY_SLUG: (slug: string) => `/brands/slug/${slug}`,
    CREATE: '/brands',
    MY_BRAND: '/brands/my-brand',
    UPDATE: (id: string) => `/brands/${id}`,
    DEACTIVATE: (id: string) => `/brands/${id}/deactivate`,
    REACTIVATE: (id: string) => `/brands/${id}/reactivate`,
    STATS: (id: string) => `/brands/${id}/stats`,
    SALES_DATA: (id: string, period: '7days' | '30days' | '90days' = '30days') =>
      `/brands/${id}/sales-data?period=${period}`,
    VERIFY: (id: string) => `/brands/${id}/verify`,
    FORCE_DELETE: (id: string) => `/brands/${id}/force-delete`,
    FOLLOW: (id: string) => `/brands/${id}/follow`,
    IS_FOLLOWING: (id: string) => `/brands/${id}/is-following`,
    FOLLOWERS_COUNT: (id: string) => `/brands/${id}/followers/count`,
  },

  COMMANDES: {
    BOUTIQUE_STATS: '/commandes/boutique/stats',
    BOUTIQUE_LIST: (page = 1, limit = 20, status?: string) => {
      const s = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) s.set('status', status);
      return `/commandes/boutique/me?${s.toString()}`;
    },
    MY_ORDERS: (page = 1, limit = 10, status?: string) => {
      const s = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) s.set('status', status);
      return `/commandes/me?${s.toString()}`;
    },
    DETAIL: (id: string) => `/commandes/${id}`,
    CONFIRMER: (id: string) => `/commandes/${id}/confirmer`,
    ANNULER: (id: string) => `/commandes/${id}/annuler`,
  },

  PROMOTIONS: {
    CREATE_AUTO: '/promotions/auto',
    CREATE_CODE: '/promotions/code',
    CEO_LIST: (params?: { page?: number; limit?: number; isActive?: boolean; isAutoApplied?: boolean; scope?: string }) => {
      const s = new URLSearchParams();
      if (params?.page) s.set('page', String(params.page));
      if (params?.limit) s.set('limit', String(params.limit));
      if (typeof params?.isActive === 'boolean') s.set('isActive', String(params.isActive));
      if (typeof params?.isAutoApplied === 'boolean') s.set('isAutoApplied', String(params.isAutoApplied));
      if (params?.scope) s.set('scope', params.scope);
      return `/promotions?${s.toString()}`;
    },
    TOGGLE: (id: string) => `/promotions/${id}/toggle`,
    VALIDATE: (code: string, subtotal: number, brandSlug: string) => 
      `/promotions/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}&brandSlug=${encodeURIComponent(brandSlug)}`,
  },
} as const;

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
  // PRODUCTS
  // ============================================
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    BY_COLLECTION: (collectionId: string) => `/products/collection/${collectionId}`,
    BY_BRAND: (brandId: string) => `/products/brand/${brandId}`,
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
  },

  // ============================================
  // COLLECTIONS
  // ============================================
  COLLECTIONS: {
    LIST: '/collections',
    DETAILS: (id: string) => `/collections/${id}`,
    CREATE: '/collections',
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    UPCOMING: '/collections/upcoming',
    ACTIVE: '/collections/active',
  },

  // ============================================
  // BRANDS
  // ============================================
  BRANDS: {
    LIST: '/brands',
    DETAILS: (id: string) => `/brands/${id}`,
    CREATE: '/brands',
    UPDATE: (id: string) => `/brands/${id}`,
    DELETE: (id: string) => `/brands/${id}`,
    FOLLOW: (id: string) => `/brands/${id}/follow`,
    UNFOLLOW: (id: string) => `/brands/${id}/unfollow`,
    FOLLOWERS: (id: string) => `/brands/${id}/followers`,
  },

  // ============================================
  // ORDERS
  // ============================================
  ORDERS: {
    LIST: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    MY_ORDERS: '/orders/my-orders',
  },

  // ============================================
  // FAVORITES
  // ============================================
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: (productId: string) => `/favorites/${productId}`,
  },

  // ============================================
  // USERS
  // ============================================
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // ============================================
  // CART (si vous en avez besoin)
  // ============================================
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
  },
} as const;

// ============================================
// TYPE HELPERS
// ============================================

type EndpointValue = string | ((...args: any[]) => string);

type FlattenEndpoints<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends Record<string, EndpointValue>
        ? FlattenEndpoints<T[K]>
        : T[K];
    }
  : T;

export type ApiEndpoints = FlattenEndpoints<typeof API_ENDPOINTS>;

// ============================================
// HELPER: Construire une URL avec query params
// ============================================

export const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params) return endpoint;

  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Import
import { API_ENDPOINTS, buildUrl } from '@/services/api/endpoints';

// Utilisation simple
const url1 = API_ENDPOINTS.PRODUCTS.LIST; // '/products'

// Avec paramètre
const url2 = API_ENDPOINTS.PRODUCTS.DETAILS('123'); // '/products/123'

// Avec query params
const url3 = buildUrl(API_ENDPOINTS.PRODUCTS.LIST, {
  page: 1,
  limit: 20,
  category: 'sneakers'
}); // '/products?page=1&limit=20&category=sneakers'
*/
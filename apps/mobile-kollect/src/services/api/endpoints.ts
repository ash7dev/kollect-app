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
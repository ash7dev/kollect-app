import * as SecureStore from 'expo-secure-store';
import { apiUrl, ngrokSkipBrowserWarning } from '@/config/env';
import { uploadMultipleToCloudinary } from '@/utils/cloudinaryUpload';

export interface ProduitDto {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
  sku?: string | null;
  collectionId: string;
  brandId: string;
  createdAt?: string;
  updatedAt?: string; 
  isVisible?: boolean;
  isDeleted?: boolean;
  collection?: {
    id: string;
    name: string;
    status?: string;
  };
  brand?: {
    id: string;
    name: string;
  };
}

export interface CreateProduitPayload {
  collectionId: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  stock?: number;
  sizes?: string[];
  colors?: string[];
  sku?: string;
  material?: string;
  weight?: number;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export interface UpdateProduitPayload {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  stock?: number;
  sizes?: string[];
  colors?: string[];
  sku?: string | null;
  material?: string | null;
  weight?: number | null;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export interface SearchParams {
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
}

export interface BrandProductsParams {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'price-asc' | 'price-desc';
}

const API_URL = apiUrl;

// ============================================
// HELPERS
// ============================================

async function getToken(): Promise<string> {
  const token =
    (await SecureStore.getItemAsync('jwt_token')) ||
    (await SecureStore.getItemAsync('ACCESS_TOKEN')) ||
    null;

  if (!token) {
    throw new Error('No authentication token');
  }
  
  return token;
}

function getMimeType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  
  return mimeTypes[extension] || 'image/jpeg';
}

// ============================================
// SERVICE API
// ============================================

export const produitsService = {
  // ============================================
  // CEO ROUTES (Authentification requise)
  // ============================================

  async create(payload: CreateProduitPayload, imageUris?: string[]) {
    const token = await getToken();

    // Upload direct vers Cloudinary si des images locales sont fournies
    let finalImages: string[] = payload.images || [];
    if (imageUris && imageUris.length > 0) {
      const results = await uploadMultipleToCloudinary(imageUris, 'kollect/products');
      finalImages = results.map(r => r.secureUrl);
    }

    // Le backend lit @Body('data') depuis un FormData — on garde ce format sans fichiers joints
    const formData = new FormData();
    formData.append('data', JSON.stringify({ ...payload, images: finalImages }));

    const res = await fetch(`${API_URL}/produits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur création produit' }));
      throw new Error(error.message || 'Erreur création produit');
    }
    return res.json() as Promise<ProduitDto>;
  },

  async listForCEO(params?: { collectionId?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.collectionId) qs.append('collectionId', params.collectionId);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits?${qs.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  async listDeletedForCEO(params?: { collectionId?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.collectionId) qs.append('collectionId', params.collectionId);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/deleted?${qs.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits supprimés');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  async getForCEO(id: string) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/ceo/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Produit non disponible');
    return res.json() as Promise<ProduitDto>;
  },

  async update(id: string, payload: UpdateProduitPayload, imageUris?: string[]) {
    const token = await getToken();
    const formData = new FormData();
    
    const produitData = {
      ...payload,
    };
    
    formData.append('data', JSON.stringify(produitData));
    
    if (imageUris && imageUris.length > 0) {
      imageUris.forEach((imageUri, index) => {
        if (!imageUri || imageUri.trim() === '') {
          return;
        }
        
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const fileName = `product-image-${index}-${Date.now()}.${fileType}`;
        
        formData.append(`image-${index}`, {
          uri: imageUri,
          name: fileName,
          type: getMimeType(imageUri),
        } as any);
      });
    }

    const res = await fetch(`${API_URL}/produits/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur mise à jour produit' }));
      throw new Error(error.message || 'Erreur mise à jour produit');
    }
    return res.json() as Promise<ProduitDto>;
  },

  async delete(id: string) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur suppression produit' }));
      throw new Error(error.message || 'Erreur suppression produit');
    }
    return res.json() as Promise<{ message: string }>;
  },

  async restore(id: string) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/${id}/restore`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur restauration produit' }));
      throw new Error(error.message || 'Erreur restauration produit');
    }
    return res.json() as Promise<{ message: string }>;
  },

  // ============================================
  // PUBLIC ROUTES (Pas d'authentification)
  // ============================================

  /**
   * 🌟 Produits Featured (Mise en avant)
   * GET /api/produits/featured?limit=10
   */
  async getFeatured(limit: number = 10) {
    const res = await fetch(`${API_URL}/produits/featured?limit=${limit}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits featured');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 🔥 Produits Populaires
   * GET /api/produits/popular?limit=20&days=30
   */
  async getPopular(limit: number = 20, days: number = 30) {
    const res = await fetch(`${API_URL}/produits/popular?limit=${limit}&days=${days}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits populaires');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 🆕 Nouveaux Produits
   * GET /api/produits/new?limit=20&days=14
   */
  async getNew(limit: number = 20, days: number = 14) {
    const res = await fetch(`${API_URL}/produits/new?limit=${limit}&days=${days}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement nouveaux produits');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 👤 Recommandations Personnalisées
   * GET /api/produits/personalized?limit=20
   * Authentification requise
   */
  async getPersonalized(limit: number = 20) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/personalized?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement recommandations');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 🔍 Recherche Avancée de Produits
   * GET /api/produits/search
   */
  async search(params: SearchParams) {
    const qs = new URLSearchParams();
    
    if (params.query) qs.append('query', params.query);
    if (params.brandId) qs.append('brandId', params.brandId);
    if (params.collectionId) qs.append('collectionId', params.collectionId);
    if (params.minPrice !== undefined) qs.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) qs.append('maxPrice', String(params.maxPrice));
    if (params.sizes && params.sizes.length > 0) qs.append('sizes', params.sizes.join(','));
    if (params.colors && params.colors.length > 0) qs.append('colors', params.colors.join(','));
    if (params.inStock !== undefined) qs.append('inStock', String(params.inStock));
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));

    const res = await fetch(`${API_URL}/produits/search?${qs.toString()}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur recherche produits');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 🏢 Produits d'une Marque (Public)
   * GET /api/produits/brand/:slug?page=1&limit=20&sortBy=recent
   */
  async getByBrand(slug: string, params?: BrandProductsParams) {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.sortBy) qs.append('sortBy', params.sortBy);

    const res = await fetch(`${API_URL}/produits/brand/${slug}?${qs.toString()}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits de la marque');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 📦 Produits d'une Collection (Public)
   * GET /api/produits/collection/:id?limit=10
   */
  async getByCollection(id: string, limit: number = 10) {
    const res = await fetch(`${API_URL}/produits/collection/${id}?limit=${limit}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits de la collection');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 🎲 Produits Aléatoires (Public)
   * GET /api/produits/public/random
   */
  async getRandom(params?: { limit?: number; collectionId?: string }) {
    const qs = new URLSearchParams();
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.collectionId) qs.append('collectionId', params.collectionId);

    const res = await fetch(`${API_URL}/produits/public/random?${qs.toString()}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits aléatoires');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  /**
   * 📄 Détails d'un Produit (Public)
   * GET /api/produits/public/:id
   */
  async getPublic(id: string) {
    const res = await fetch(`${API_URL}/produits/public/${id}`, {
      headers: {
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    if (!res.ok) throw new Error('Produit non disponible');
    return res.json() as Promise<ProduitDto>;
  },
};

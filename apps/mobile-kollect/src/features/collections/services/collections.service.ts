/* eslint-disable @typescript-eslint/no-unused-vars */
// ✅ SERVICE API - Version complète avec toutes les routes
// src/features/collections/services/collections.service.ts

import { storage, ProductDraft } from '@/utils/storage';
import * as SecureStore from 'expo-secure-store';
import { apiUrl, ngrokSkipBrowserWarning } from '@/config/env';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from '@/utils/cloudinaryUpload';

const API_URL = apiUrl;

// ============================================
// TYPES & INTERFACES
// ============================================

export enum CollectionStatus {
  TEASER = 'TEASER',
  DISPONIBLE = 'DISPONIBLE',
  EPUISEE = 'EPUISEE',
  TERMINE = 'TERMINE',
}

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  status: CollectionStatus;
  launchDate?: string | null;
  launchedAt?: string | null;
  isFeatured: boolean;
  brandId: string;
  viewCount: number;
  brand: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
  } | null;
  _count: {
    views: number; products: number 
};
  createdAt: string;
  updatedAt: string;
  products?: ProductDto[];
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock: number;
  sizes: string[];
  sku: string;
  colors: string[];
}

export interface CreateCollectionPayload {
  brandId: string;
  name: string;
  description?: string;
  launchDate?: string | null;
  coverImage?: string;
  teaserVideo?: string;
  isFeatured?: boolean;
  products: {
    name: string;
    description?: string;
    price: number;
    images: string[];
    stock: number;
    sizes: string[];
    sku: string;
    colors: string[];
  }[];
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  launchDate?: string | null;
  coverImage?: string;
  teaserVideo?: string;
  isFeatured?: boolean;
}

export interface HomePageResponse {
  featured: CollectionDto[];
  trending: CollectionDto[];
  newReleases: CollectionDto[];
  comingSoon: CollectionDto[];
  personalized?: CollectionDto[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

function getMimeType(uri: string, isVideo: boolean = false): string {
  const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  };
  
  return mimeTypes[extension] || (isVideo ? 'video/mp4' : 'image/jpeg');
}

// ============================================
// SERVICE API
// ============================================

export const collectionsApi = {
  /**
   * 📦 Créer une collection — upload direct mobile → Cloudinary puis JSON vers backend
   */
  async create(
    payload: CreateCollectionPayload,
    onProgress?: (percent: number) => void,
  ): Promise<CollectionDto> {
    const token = await getToken();

    console.log('📦 [API] Début de la création de collection:', payload.name);

    try {
      // Compter le total d'uploads pour le progress global
      const allProductImages = payload.products.flatMap(p => p.images);
      const hasMedia = !!(payload.coverImage || payload.teaserVideo);
      const totalUploads = allProductImages.length + (hasMedia ? 1 : 0);
      let completedUploads = 0;

      const reportProgress = (singlePercent: number) => {
        if (!onProgress || totalUploads === 0) return;
        const base = (completedUploads / totalUploads) * 100;
        const slice = singlePercent / totalUploads;
        onProgress(Math.min(Math.round(base + slice), 99));
      };

      // 1. Upload média de la collection directement vers Cloudinary
      let coverImageUrl: string | undefined;
      let teaserVideoUrl: string | undefined;

      if (payload.coverImage) {
        const result = await uploadToCloudinary(payload.coverImage, {
          folder: 'kollect/collections',
          onProgress: reportProgress,
        });
        coverImageUrl = result.secureUrl;
        completedUploads++;
        console.log('✅ Cover uploadée:', coverImageUrl);
      } else if (payload.teaserVideo) {
        const result = await uploadToCloudinary(payload.teaserVideo, {
          folder: 'kollect/teasers',
          isVideo: true,
          onProgress: reportProgress,
        });
        teaserVideoUrl = result.secureUrl;
        completedUploads++;
        console.log('✅ Teaser uploadé:', teaserVideoUrl);
      }

      // 2. Upload toutes les images produits en parallèle par produit
      const productsWithUrls = await Promise.all(
        payload.products.map(async (product, i) => {
          if (!product.images || product.images.length === 0) {
            throw new Error(`Le produit "${product.name}" doit avoir au moins une image`);
          }
          const results = await uploadMultipleToCloudinary(
            product.images,
            'kollect/products',
            (p) => {
              const base = ((completedUploads + i) / totalUploads) * 100;
              onProgress?.(Math.min(Math.round(base + p / totalUploads), 99));
            },
          );
          completedUploads += product.images.length;
          return {
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            images: results.map(r => r.secureUrl),
            sizes: product.sizes,
            colors: product.colors,
          };
        }),
      );

      // 3. Envoyer JSON au backend (aucun fichier joint — le backend détecte les URLs dans le DTO)
      const collectionData = {
        name: payload.name,
        description: payload.description || '',
        launchDate: payload.launchDate,
        isFeatured: payload.isFeatured || false,
        coverImage: coverImageUrl,
        teaserVideo: teaserVideoUrl,
        products: productsWithUrls,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(collectionData));

      const response = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur lors de la création (${response.status})`);
      }

      onProgress?.(100);
      return response.json();
    } catch (error: any) {
      console.error('❌ Erreur création collection:', error);
      throw new Error(error.message || 'Erreur lors de la création');
    }
  },

  /**
   * 📋 Lister les collections du CEO
   */
  async listForCEO(params?: {
    page?: number;
    limit?: number;
    includeProducts?: boolean;
  }): Promise<PaginatedResponse<CollectionDto>> {
    const token = await getToken();
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeProducts) queryParams.append('includeProducts', 'true');
    
    const url = `${API_URL}/collections?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des collections');
    }
    
    return response.json();
  },

  /**
   * 🔍 Récupérer une collection (CEO)
   */
  async getOne(id: string, includeProducts = false): Promise<CollectionDto> {
    const token = await getToken();
    const qs = includeProducts ? '?includeProducts=true' : '';
    const url = `${API_URL}/collections/${id}${qs}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Collection non trouvée');
    }

    return response.json();
  },

  /**
   * ✏️ Mettre à jour une collection
   */
  async update(id: string, payload: UpdateCollectionPayload): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}`;

    // Si on a une image ou vidéo à uploader, utiliser FormData
    if (payload.coverImage || payload.teaserVideo) {
      const formData = new FormData();
      
      // Ajouter les autres données
      if (payload.name) formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.launchDate) formData.append('launchDate', payload.launchDate);
      if (payload.isFeatured !== undefined) formData.append('isFeatured', payload.isFeatured.toString());

      // Ajouter le média
      if (payload.coverImage) {
        const uriParts = payload.coverImage.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const fileName = `cover-${Date.now()}.${fileType}`;
        
        formData.append('file', {
          uri: payload.coverImage,
          name: fileName,
          type: getMimeType(payload.coverImage, false),
        } as any);
      } else if (payload.teaserVideo) {
        const uriParts = payload.teaserVideo.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'mp4';
        const fileName = `teaser-${Date.now()}.${fileType}`;
        
        formData.append('file', {
          uri: payload.teaserVideo,
          name: fileName,
          type: getMimeType(payload.teaserVideo, true),
        } as any);
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      return response.json();
    }

    // Sinon, utiliser JSON
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return response.json();
  },

  /**
   * 🗑️ Supprimer une collection
   */
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return response.json();
  },

  /**
   * 🎬 Activer le teaser
   */
  async activateTeaser(
    id: string,
    body: { coverImage?: string; teaserVideo?: string }
  ): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}/activate-teaser`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'activation du teaser');
    }

    return response.json();
  },

  /**
   * 🚀 Lancer une collection
   */
  async launch(id: string): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}/launch`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors du lancement de la collection');
    }

    return response.json();
  },

  // ============================================
  // ROUTES PUBLIQUES
  // ============================================

  /**
   * 📊 Page d'accueil complète
   */
  async getHomePage(): Promise<HomePageResponse> {
    const url = `${API_URL}/collections/home`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la page d\'accueil');
    }

    return response.json();
  },

  /**
   * 🌟 Collections featured
   */
  async getFeatured(limit: number = 6): Promise<CollectionDto[]> {
    const url = `${API_URL}/collections/featured?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * 🔥 Collections trending
   */
  async getTrending(limit: number = 10): Promise<CollectionDto[]> {
    const url = `${API_URL}/collections/trending?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * 🆕 Nouvelles collections
   */
  async getNew(limit: number = 10): Promise<CollectionDto[]> {
    const url = `${API_URL}/collections/new?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * ⏰ Collections à venir (coming soon)
   */
  async getComingSoon(limit: number = 10): Promise<CollectionDto[]> {
    const url = `${API_URL}/collections/coming-soon?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * 👤 Recommandations personnalisées (nécessite authentification)
   */
  async getPersonalized(limit: number = 10): Promise<CollectionDto[]> {
    const token = await getToken();
    const url = `${API_URL}/collections/personalized?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * 📋 Lister les collections publiques
   */
  async listPublic(params?: {
    page?: number;
    limit?: number;
    includeProducts?: boolean;
  }): Promise<PaginatedResponse<CollectionDto>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeProducts) queryParams.append('includeProducts', 'true');
    
    const url = `${API_URL}/collections/public?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération');
    }

    return response.json();
  },

  /**
   * 🔍 Récupérer une collection publique
   */
  async getPublic(id: string, includeProducts = false): Promise<CollectionDto> {
    const qs = includeProducts ? '?includeProducts=true' : '';
    const url = `${API_URL}/collections/public/${id}${qs}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': ngrokSkipBrowserWarning,
      },
    });

    if (!response.ok) {
      throw new Error('Collection non trouvée');
    }

    return response.json();
  },
};

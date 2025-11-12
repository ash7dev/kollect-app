/* eslint-disable @typescript-eslint/no-unused-vars */
// ✅ SERVICE API - Version complète avec toutes les routes
// src/features/collections/services/collections.service.ts

import { storage, ProductDraft } from '@/utils/storage';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';

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
    (await SecureStore.getItemAsync('JWT_TOKEN')) ||
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
   * 📦 Créer une collection avec uploads
   */
  async create(payload: CreateCollectionPayload): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections`;

    console.log('📦 [API] Début de la création de collection:', payload.name);

    try {
      const collectionData = {
        name: payload.name,
        description: payload.description || '',
        launchDate: payload.launchDate,
        isFeatured: payload.isFeatured || false,
        products: payload.products.map(p => ({
          name: p.name,
          description: p.description || '',
          price: p.price,
          stock: p.stock,
          sku: p.sku,
          images: [],
          sizes: p.sizes,
          colors: p.colors,
        })),
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(collectionData));

      // Média de la collection
      if (payload.coverImage) {
        const uriParts = payload.coverImage.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const fileName = `cover-${Date.now()}.${fileType}`;
        
        formData.append('collectionMedia', {
          uri: payload.coverImage,
          name: fileName,
          type: getMimeType(payload.coverImage, false),
        } as any);
        
      } else if (payload.teaserVideo) {
        const uriParts = payload.teaserVideo.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'mp4';
        const fileName = `teaser-${Date.now()}.${fileType}`;
        
        formData.append('collectionMedia', {
          uri: payload.teaserVideo,
          name: fileName,
          type: getMimeType(payload.teaserVideo, true),
        } as any);
      }

      // Images des produits
      for (let productIndex = 0; productIndex < payload.products.length; productIndex++) {
        const product = payload.products[productIndex];
        
        if (!product.images || product.images.length === 0) {
          throw new Error(`Le produit "${product.name}" doit avoir au moins une image`);
        }
        
        for (let imageIndex = 0; imageIndex < product.images.length; imageIndex++) {
          const imageUri = product.images[imageIndex];
          
          if (!imageUri || imageUri.trim() === '') {
            continue;
          }
          
          const fieldName = `product-${productIndex}-image-${imageIndex}`;
          const uriParts = imageUri.split('.');
          const fileType = uriParts[uriParts.length - 1] || 'jpg';
          const fileName = `product-${productIndex}-${imageIndex}-${Date.now()}.${fileType}`;
          
          formData.append(fieldName, {
            uri: imageUri,
            name: fileName,
            type: getMimeType(imageUri, false),
          } as any);
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur lors de la création (${response.status})`);
      }

      return response.json();
    } catch (error: any) {
      console.error('❌ Erreur:', error);
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
          'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error('Collection non trouvée');
    }

    return response.json();
  },
};
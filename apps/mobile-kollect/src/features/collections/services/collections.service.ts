/* eslint-disable @typescript-eslint/no-unused-vars */
// ✅ SERVICE API - Upload avec FormData natif (comme pour le logo)
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
  };
  _count: { products: number };
  createdAt: string;
  updatedAt: string;
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
   * ✅ Utilise FormData natif (comme pour le logo)
   */
  async create(payload: CreateCollectionPayload): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections`;

    console.log('📦 [API] Début de la création de collection:', payload.name);

    try {
      // 1️⃣ PRÉPARER LES DONNÉES JSON
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
          images: [], // Les images seront uploadées séparément
          sizes: p.sizes,
          colors: p.colors,
        })),
      };

      // 2️⃣ CRÉER LE FORMDATA
      const formData = new FormData();
      
      // Ajouter les données JSON
      formData.append('data', JSON.stringify(collectionData));
      console.log('✅ Données JSON préparées');

      // 3️⃣ AJOUTER LE MÉDIA DE LA COLLECTION
      if (payload.coverImage) {
        const uriParts = payload.coverImage.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const fileName = `cover-${Date.now()}.${fileType}`;
        
        formData.append('collectionMedia', {
          uri: payload.coverImage,
          name: fileName,
          type: getMimeType(payload.coverImage, false),
        } as any);
        
        console.log('📤 Cover image ajoutée');
        
      } else if (payload.teaserVideo) {
        const uriParts = payload.teaserVideo.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'mp4';
        const fileName = `teaser-${Date.now()}.${fileType}`;
        
        formData.append('collectionMedia', {
          uri: payload.teaserVideo,
          name: fileName,
          type: getMimeType(payload.teaserVideo, true),
        } as any);
        
        console.log('📤 Teaser video ajoutée');
      }

      // 4️⃣ AJOUTER LES IMAGES DES PRODUITS
      let totalImages = 0;
      
      for (let productIndex = 0; productIndex < payload.products.length; productIndex++) {
        const product = payload.products[productIndex];
        
        console.log(`\n📤 Produit ${productIndex + 1}/${payload.products.length}: ${product.name}`);
        console.log(`   ${product.images.length} image(s)`);
        
        // Vérifier que le produit a des images
        if (!product.images || product.images.length === 0) {
          throw new Error(`Le produit "${product.name}" doit avoir au moins une image`);
        }
        
        for (let imageIndex = 0; imageIndex < product.images.length; imageIndex++) {
          const imageUri = product.images[imageIndex];
          
          // Vérifier que l'URI existe
          if (!imageUri || imageUri.trim() === '') {
            console.warn(`⚠️ Image vide ignorée pour le produit ${productIndex}, image ${imageIndex}`);
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
          
          totalImages++;
          console.log(`  ✓ ${fieldName} ajoutée`);
        }
      }

      // 5️⃣ RÉSUMÉ
      console.log(`\n📊 Résumé:`);
      console.log(`  - Produits: ${payload.products.length}`);
      console.log(`  - Images: ${totalImages}`);
      console.log(`  - Média: ${payload.coverImage || payload.teaserVideo ? '✅' : '❌'}`);

      // 6️⃣ ENVOYER LA REQUÊTE AVEC FETCH
      console.log('\n🚀 Envoi vers le serveur...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          // ⚠️ NE PAS définir Content-Type pour FormData
          // React Native le fait automatiquement avec boundary
        },
        body: formData,
      });

      // 7️⃣ TRAITER LA RÉPONSE
      const statusCode = response.status;
      console.log('📡 Status:', statusCode);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.message || `Erreur lors de la création (${statusCode})`);
      }

      const responseData = await response.json();
      console.log('✅ Collection créée:', responseData.id);
      return responseData;

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la création');
    }
  },

  /**
   * 📋 Lister les collections du CEO
   */
  async listForCEO(params?: any): Promise<any> {
    const token = await getToken();
    const url = `${API_URL}/collections`;
    
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

  async launch(id: string): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}/launch`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Erreur détaillée du serveur:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        
        const errorMessage = responseData.message || 'Erreur lors du lancement de la collection';
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      console.error('Erreur lors de l\'appel API launch:', error);
      throw error;
    }
  },

  async update(id: string, payload: any): Promise<CollectionDto> {
    const token = await getToken();
    const url = `${API_URL}/collections/${id}`;

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

  async remove(id: string): Promise<{ message: string }> {
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

  async listPublic(params?: any): Promise<any> {
    const url = `${API_URL}/collections/public`;
    
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
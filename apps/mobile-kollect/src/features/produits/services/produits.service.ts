import * as SecureStore from 'expo-secure-store';

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
  createdAt?: string;  // or Date, depending on your needs
  updatedAt?: string; 
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
  images?: string[]; // Optionnel car peut être uploadé
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

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';

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

// ============================================
// SERVICE API
// ============================================

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

export const produitsService = {
  async create(payload: CreateProduitPayload, imageUris?: string[]) {
    const token = await getToken();
    const formData = new FormData();
    
    // Préparer les données JSON (sans les images si elles sont uploadées)
    const produitData = {
      ...payload,
      images: imageUris && imageUris.length > 0 ? [] : payload.images || [],
    };
    
    // Ajouter les données JSON
    formData.append('data', JSON.stringify(produitData));
    
    // Ajouter les images si fournies
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

    const res = await fetch(`${API_URL}/produits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
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
      },
    });
    if (!res.ok) throw new Error('Erreur chargement produits');
    return res.json() as Promise<{ data: ProduitDto[]; meta: any }>;
  },

  async getForCEO(id: string) {
    const token = await getToken();
    const res = await fetch(`${API_URL}/produits/ceo/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Produit non disponible');
    return res.json() as Promise<ProduitDto>;
  },

  async getPublic(id: string) {
    const res = await fetch(`${API_URL}/produits/${id}`);
    if (!res.ok) throw new Error('Produit non disponible');
    return res.json() as Promise<ProduitDto>;
  },

  async update(id: string, payload: UpdateProduitPayload, imageUris?: string[]) {
    const token = await getToken();
    const formData = new FormData();
    
    // Préparer les données JSON (sans les nouvelles images si elles sont uploadées)
    const produitData = {
      ...payload,
      // Si de nouvelles images sont uploadées, on garde les anciennes dans le payload
      // Les nouvelles seront fusionnées côté serveur
    };
    
    // Ajouter les données JSON
    formData.append('data', JSON.stringify(produitData));
    
    // Ajouter les nouvelles images si fournies
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
        'ngrok-skip-browser-warning': 'true',
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
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur suppression produit' }));
      throw new Error(error.message || 'Erreur suppression produit');
    }
    return res.json() as Promise<{ message: string }>;
  },
};



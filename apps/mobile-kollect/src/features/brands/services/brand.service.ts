 
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../../store/authStore';
import * as ImagePicker from 'expo-image-picker';

// Types

export interface EnhancedBrandStats extends BrandStats {
  ordersThisMonth: number;
  ordersChange: number;
  followersChange: number;
  conversionRate: number;
}

export interface SalesDataPoint {
  label: string;
  value: number;
  date?: string;
}
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  bio?: string;
  description?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
  isActive: boolean;
  isVerified: boolean;
  followerCount: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count?: {
    products: number;
    collections: number;
    commandes: number;
    favoris: number;
    reviews: number;
  };
}

export interface CreateBrandDto {
  name: string;
  slug: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  // Logo sera géré séparément pour l'upload
}

export interface CreateBrandFormData {
  name: string;
  slug: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
  website?: string;
  logo?: ImagePicker.ImagePickerAsset;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {
  removeLogo?: boolean; // Flag pour supprimer le logo
}

export interface UpdateBrandFormData extends UpdateBrandDto {
  logo?: ImagePicker.ImagePickerAsset; // Nouvelle image
}

export interface BrandStats {
  totalProducts: number;
  totalCollections: number;
  totalOrders: number;
  totalRevenue: number;
  totalFollowers: number;
  totalReviews: number;
  averageRating: number;
}

export interface CreateBrandResponse extends Brand {
  access_token: {
    id: string;
    slug: string;
    name: string;
    isVerified: boolean;
  };
}
const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';


// Service
class BrandService {
  /**
   * 🔑 Récupérer le token JWT
   */
  private async getToken(): Promise<string> {
    // Aligner sur la clé utilisée par l'auth store et ajouter des fallbacks
    const token =
      (await SecureStore.getItemAsync('jwt_token')) ||
      (await SecureStore.getItemAsync('JWT_TOKEN')) ||
      (await SecureStore.getItemAsync('ACCESS_TOKEN')) ||
      null;

    if (!token) throw new Error('No authentication token');
    return token;
  }

  /**
   * 📡 Requête API authentifiée (JSON)
   */
  private async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si non autorisé → forcer un logout global pour sortir immédiatement du flow CEO
      if (response.status === 401) {
        console.warn('🔒 [Brand Service] 401 Non autorisé - clear authStore');
        try {
          await useAuthStore.getState()._clearAuth();
        } catch (e) {
          console.warn('[Brand Service] Erreur lors du clearAuth après 401', e);
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return response;
  }

  /**
   * 📤 Requête API authentifiée avec FormData (pour upload)
   */
  private async authenticatedFetchFormData(
    endpoint: string,
    formData: FormData & { entries: () => IterableIterator<[string, FormDataEntryValue]> },
    method: 'POST' | 'PATCH' = 'POST'
  ): Promise<Response> {
    const token = await this.getToken();

    // Debug: Log all form data entries
    console.log('📤 [FormData] Preparing to send:');
    for (const pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        // ⚠️ NE PAS définir Content-Type pour FormData
        // Le navigateur/React Native le fait automatiquement avec boundary
      },
      body: formData,
    });

    if (!response.ok) {
      // Même logique que pour authenticatedFetch : 401 = on nettoie l'auth
      if (response.status === 401) {
        console.warn('🔒 [Brand Service] 401 Non autorisé (FormData) - clear authStore');
        try {
          await useAuthStore.getState()._clearAuth();
        } catch (e) {
          console.warn('[Brand Service] Erreur lors du clearAuth après 401 (FormData)', e);
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    return response;
  }

  /**
   * 🖼️ Créer un FormData avec image
   */
  private createFormDataWithImage(
    data: Record<string, any>,
    imageAsset?: ImagePicker.ImagePickerAsset,
    imageFieldName: string = 'logo'
  ): FormData {
    // Type assertion to tell TypeScript that FormData has entries()
    // This is safe because the method exists at runtime in React Native
    type FormDataWithEntries = FormData & {
      entries: () => IterableIterator<[string, FormDataEntryValue]>;
    };
    const formData = new FormData() as FormDataWithEntries;

    // Ajouter les champs texte
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Ajouter l'image si présente
    if (imageAsset?.uri) {
      const uriParts = imageAsset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append(imageFieldName, {
        uri: imageAsset.uri,
        name: `${imageFieldName}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    return formData;
  }

  // ========================================
  // ROUTES PUBLIQUES (avec JWT)
  // ========================================

  /**
   * 📋 Récupérer toutes les marques actives
   * GET /brands
   */
  async getAllBrands(filters?: {
    isActive?: boolean;
    isVerified?: boolean;
    search?: string;
  }): Promise<Brand[]> {
    console.log('📋 [Brand Service] Récupération des marques...');

    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.isVerified !== undefined) params.append('isVerified', String(filters.isVerified));
    if (filters?.search) params.append('search', filters.search);

    const url = `/brands${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.authenticatedFetch(url);
    const brands = await response.json();

    console.log('✅ [Brand Service] Marques récupérées:', brands.length);
    return brands;
  }

  /**
   * 🔍 Récupérer une marque par slug
   * GET /brands/slug/:slug
   */
  async getBrandBySlug(slug: string): Promise<Brand> {
    console.log('🔍 [Brand Service] Récupération marque par slug:', slug);

    const response = await this.authenticatedFetch(`/brands/slug/${slug}`);
    const brand = await response.json();

    console.log('✅ [Brand Service] Marque trouvée:', brand.id);
    return brand;
  }

  // ========================================
  // ROUTES CEO
  // ========================================

  /**
   * 🏪 Créer une marque avec logo
   * POST /brands
   */
  async createBrand(createBrandDto: CreateBrandFormData): Promise<CreateBrandResponse> {
  try {
    console.log('🏪 [Brand Service] Création de la marque...', { 
      name: createBrandDto.name,
      hasLogo: !!createBrandDto.logo 
    });
    
    const token = await this.getToken();
    
    // ✅ Liste STRICTE des champs autorisés par le backend
    const allowedFields = ['name', 'slug', 'bio', 'instagram', 'whatsapp', 'website'] as const;
    
    // Gestion avec ou sans logo
    if (createBrandDto.logo) {
      // CAS 1 : Avec logo (FormData)
      const formData = new FormData();
      
      // Ajouter le logo
      const uriParts = createBrandDto.logo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `logo-${Date.now()}.${fileType}`;
      
      formData.append('logo', {
        uri: createBrandDto.logo.uri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
      
      console.log('✅ Logo ajouté au FormData');
      
      // Ajouter uniquement les champs autorisés et non vides
      allowedFields.forEach(field => {
        const value = createBrandDto[field];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(field, String(value));
          console.log(`✅ [FormData] ${field}:`, value);
        }
      });
      
      console.log('📤 Envoi FormData à:', `${API_URL}/brands`);
      
      const response = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // ⚠️ NE PAS définir Content-Type pour FormData
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Marque créée avec logo:', result);
      return result;
    } else {
      // CAS 2 : Sans logo (JSON)
      const cleanData: Record<string, string> = {};
      
      allowedFields.forEach(field => {
        const value = createBrandDto[field];
        if (value !== undefined && value !== null && value !== '') {
          cleanData[field] = String(value);
          console.log(`✅ [JSON] ${field}:`, value);
        }
      });
      
      console.log('📤 Envoi JSON à:', `${API_URL}/brands`);
      
      const response = await fetch(`${API_URL}/brands`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur serveur:', errorData);
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Marque créée sans logo:', result);
      return result;
    }
    
  } catch (error) {
    console.error('❌ [Brand Service] Erreur création marque:', error);
    throw error;
  }
}

/**
 * 📊 Récupérer les stats complètes de MA marque
 * GET /brands/:id/stats
 */
async getBrandStats(brandId: string): Promise<EnhancedBrandStats> {
  console.log('📊 [Brand Service] Récupération des stats:', brandId);

  const response = await this.authenticatedFetch(`/brands/${brandId}/stats`);
  const stats = await response.json();

  console.log('✅ [Brand Service] Stats récupérées');
  return stats;
}

/**
 * 📈 Récupérer les données de ventes par période
 * GET /brands/:id/sales-data?period=7days
 */
async getSalesData(
  brandId: string, 
  period: '7days' | '30days' | '90days' = '7days'
): Promise<SalesDataPoint[]> {
  console.log('📈 [Brand Service] Récupération sales data:', { brandId, period });

  const response = await this.authenticatedFetch(
    `/brands/${brandId}/sales-data?period=${period}`
  );
  const data = await response.json();

  console.log('✅ [Brand Service] Sales data récupérées:', data.length);
  return data;
}
  /**
   * 🏠 Récupérer MA marque (CEO Dashboard)
   * GET /brands/my-brand
   */
  async getMyBrand(): Promise<Brand> {
    console.log('🏠 [Brand Service] Récupération de ma marque...');

    const response = await this.authenticatedFetch('/brands/my-brand');
    const brand = await response.json();

    console.log('✅ [Brand Service] Marque récupérée:', brand.id);
    return brand;
  }

  // ========================================
  // ROUTES CEO PROPRIÉTAIRE
  // ========================================

  /**
   * ✏️ Mettre à jour MA marque avec logo
   * PATCH /brands/:id
   */
  async updateBrand(brandId: string, data: UpdateBrandFormData): Promise<Brand> {
    console.log('✏️ [Brand Service] Mise à jour de la marque:', brandId);

    const { logo, removeLogo, ...brandData } = data;
    const formData = new FormData();

    // Ajouter les champs texte
    Object.entries(brandData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Gestion du logo
    if (removeLogo) {
      // Demander la suppression du logo
      formData.append('logo', '');
    } else if (logo?.uri) {
      // Upload d'un nouveau logo
      const uriParts = logo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('logo', {
        uri: logo.uri,
        name: `logo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }
    // Si ni removeLogo ni logo, le logo n'est pas modifié

    const response = await this.authenticatedFetchFormData(
      `/brands/${brandId}`,
      formData as FormData & { entries: () => IterableIterator<[string, FormDataEntryValue]> },
      'PATCH'
    );
    const brand = await response.json();

    console.log('✅ [Brand Service] Marque mise à jour');
    return brand;
  }

  /**
   * 🗑️ Désactiver MA marque (Soft Delete)
   * DELETE /brands/:id/deactivate
   */
  async deactivateBrand(brandId: string): Promise<Brand> {
    console.log('🗑️ [Brand Service] Désactivation de la marque:', brandId);

    const response = await this.authenticatedFetch(`/brands/${brandId}/deactivate`, {
      method: 'DELETE',
    });

    const brand = await response.json();
    console.log('✅ [Brand Service] Marque désactivée');
    return brand;
  }

  /**
   * 🔄 Réactiver MA marque
   * PATCH /brands/:id/reactivate
   */
  async reactivateBrand(brandId: string): Promise<Brand> {
    console.log('🔄 [Brand Service] Réactivation de la marque:', brandId);

    const response = await this.authenticatedFetch(`/brands/${brandId}/reactivate`, {
      method: 'PATCH',
    });

    const brand = await response.json();
    console.log('✅ [Brand Service] Marque réactivée');
    return brand;
  }

  

  // ========================================
  // ROUTES ADMIN
  // ========================================

  /**
   * 🛡️ Vérifier une marque (Badge vérifié)
   * PATCH /brands/:id/verify
   */
  async verifyBrand(brandId: string): Promise<Brand> {
    console.log('🛡️ [Brand Service] Vérification de la marque:', brandId);

    const response = await this.authenticatedFetch(`/brands/${brandId}/verify`, {
      method: 'PATCH',
    });

    const brand = await response.json();
    console.log('✅ [Brand Service] Marque vérifiée');
    return brand;
  }

  /**
   * 🗑️ Supprimer définitivement une marque (Hard Delete)
   * DELETE /brands/:id/force-delete
   */
  async forceDeleteBrand(brandId: string): Promise<void> {
    console.log('🗑️ [Brand Service] Suppression définitive de la marque:', brandId);

    await this.authenticatedFetch(`/brands/${brandId}/force-delete`, {
      method: 'DELETE',
    });

    console.log('✅ [Brand Service] Marque supprimée définitivement');
  }
}

export const brandService = new BrandService();
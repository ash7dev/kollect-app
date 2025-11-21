import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev/api';

async function getAuthHeaders() {
  const token =
    (await SecureStore.getItemAsync('jwt_token')) ||
    (await SecureStore.getItemAsync('JWT_TOKEN')) ||
    (await SecureStore.getItemAsync('ACCESS_TOKEN')) ||
    null;

  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  } as const;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors, keep text
  }

  if (!res.ok) {
    const message = (json && (json.message || json.error)) || `Erreur API (${res.status})`;
    throw new Error(typeof message === 'string' ? message : 'Erreur API inconnue');
  }

  return (json ?? {}) as T;
}

export const suiviService = {
  // ====== MARQUES ======
  async followBrand(brandId: string): Promise<{ success: boolean; followerCount?: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/brands/${brandId}/follow`, {
      method: 'POST',
      headers,
    });
    return handleResponse(res);
  },

  async unfollowBrand(brandId: string): Promise<{ success: boolean; followerCount?: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/brands/${brandId}/follow`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },

  async isFollowingBrand(brandId: string): Promise<boolean> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/brands/${brandId}/is-following`, {
      method: 'GET',
      headers,
    });
    const data = await handleResponse<{ isFollowing: boolean }>(res);
    return !!data.isFollowing;
  },

  async getBrandFollowersCount(brandId: string): Promise<number> {
    const res = await fetch(`${API_URL}/brands/${brandId}/followers/count`);
    const data = await handleResponse<{ count: number }>(res);
    return data.count ?? 0;
  },

  // ====== PRODUITS ======
  async followProduct(productId: string): Promise<{ success: boolean; favoriteCount?: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products/${productId}/follow`, {
      method: 'POST',
      headers,
    });
    return handleResponse(res);
  },

  async unfollowProduct(productId: string): Promise<{ success: boolean; favoriteCount?: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products/${productId}/follow`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },

  async isFollowingProduct(productId: string): Promise<boolean> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/products/${productId}/is-following`, {
      method: 'GET',
      headers,
    });
    const data = await handleResponse<{ isFollowing: boolean }>(res);
    return !!data.isFollowing;
  },

  async getProductFollowersCount(productId: string): Promise<number> {
    const res = await fetch(`${API_URL}/products/${productId}/followers/count`);
    const data = await handleResponse<{ count: number }>(res);
    return data.count ?? 0;
  },

  async getMyFavoriteProducts(): Promise<string[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/favorites/products`, {
      method: 'GET',
      headers,
    });
    const data = await handleResponse<{ productIds: string[] }>(res);
    return data.productIds ?? [];
  },
};

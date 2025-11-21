import { create } from 'zustand';
import { suiviService } from '../services/suivi.service';

interface SuiviState {
  followingBrands: Record<string, boolean>;
  followingProducts: Record<string, boolean>;
  brandFollowersCount: Record<string, number>;
  productFollowersCount: Record<string, number>;
  loading: boolean;
  error: string | null;

  // Actions marques
  fetchBrandFollowState: (brandId: string) => Promise<void>;
  followBrand: (brandId: string) => Promise<void>;
  unfollowBrand: (brandId: string) => Promise<void>;

  // Actions produits
  fetchProductFollowState: (productId: string) => Promise<void>;
  followProduct: (productId: string) => Promise<void>;
  unfollowProduct: (productId: string) => Promise<void>;
  fetchAllProductFavorites: () => Promise<void>;
}

export const useSuiviStore = create<SuiviState>((set, get) => ({
  followingBrands: {},
  followingProducts: {},
  brandFollowersCount: {},
  productFollowersCount: {},
  loading: false,
  error: null,

  async fetchBrandFollowState(brandId: string) {
    set({ loading: true, error: null });
    try {
      const [isFollowing, count] = await Promise.all([
        suiviService.isFollowingBrand(brandId),
        suiviService.getBrandFollowersCount(brandId),
      ]);
      set((state) => ({
        followingBrands: { ...state.followingBrands, [brandId]: isFollowing },
        brandFollowersCount: { ...state.brandFollowersCount, [brandId]: count },
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Erreur lors du chargement du suivi marque' });
    }
  },

  async followBrand(brandId: string) {
    set({ error: null });
    try {
      const res = await suiviService.followBrand(brandId);
      set((state) => ({
        followingBrands: { ...state.followingBrands, [brandId]: true },
        brandFollowersCount: {
          ...state.brandFollowersCount,
          [brandId]: res.followerCount ?? (state.brandFollowersCount[brandId] ?? 0) + 1,
        },
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Impossible de suivre cette marque' });
    }
  },

  async unfollowBrand(brandId: string) {
    set({ error: null });
    try {
      const res = await suiviService.unfollowBrand(brandId);
      set((state) => ({
        followingBrands: { ...state.followingBrands, [brandId]: false },
        brandFollowersCount: {
          ...state.brandFollowersCount,
          [brandId]: res.followerCount ?? Math.max((state.brandFollowersCount[brandId] ?? 1) - 1, 0),
        },
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Impossible de se désabonner de cette marque' });
    }
  },

  async fetchProductFollowState(productId: string) {
    set({ loading: true, error: null });
    try {
      const [isFollowing, count] = await Promise.all([
        suiviService.isFollowingProduct(productId),
        suiviService.getProductFollowersCount(productId),
      ]);
      set((state) => ({
        followingProducts: { ...state.followingProducts, [productId]: isFollowing },
        productFollowersCount: { ...state.productFollowersCount, [productId]: count },
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Erreur lors du chargement du suivi produit' });
    }
  },

  async followProduct(productId: string) {
    set({ error: null });
    try {
      const res = await suiviService.followProduct(productId);
      set((state) => ({
        followingProducts: { ...state.followingProducts, [productId]: true },
        productFollowersCount: {
          ...state.productFollowersCount,
          [productId]: res.favoriteCount ?? (state.productFollowersCount[productId] ?? 0) + 1,
        },
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Impossible d\'ajouter ce produit aux favoris' });
    }
  },

  async unfollowProduct(productId: string) {
    set({ error: null });
    try {
      const res = await suiviService.unfollowProduct(productId);
      set((state) => ({
        followingProducts: { ...state.followingProducts, [productId]: false },
        productFollowersCount: {
          ...state.productFollowersCount,
          [productId]: res.favoriteCount ?? Math.max((state.productFollowersCount[productId] ?? 1) - 1, 0),
        },
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Impossible de retirer ce produit des favoris' });
    }
  },

  async fetchAllProductFavorites() {
    set({ loading: true, error: null });
    try {
      const ids = await suiviService.getMyFavoriteProducts();
      const map: Record<string, boolean> = {};
      ids.forEach((id) => {
        map[id] = true;
      });
      set((state) => ({
        followingProducts: { ...state.followingProducts, ...map },
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Erreur lors du chargement des favoris produits' });
    }
  },
}));

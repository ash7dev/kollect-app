/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { brandService, Brand, CreateBrandResponse, EnhancedBrandStats } from '../services/brand.service';
// Dans brandStore.ts - ajouter le caching des stats
interface BrandState {
  myBrand: Brand | null;
  stats: EnhancedBrandStats | null;
  isLoading: boolean;
  error: string | null;

  setMyBrand: (brand: Brand | null) => void;
  setStats: (stats: EnhancedBrandStats | null) => void;
  loadMyBrand: () => Promise<void>;
  clearBrand: () => void;
  hasBrand: () => boolean;
  getBrandId: () => string | null;
}


export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      // État initial
      myBrand: null,
      stats: null,
      isLoading: false,
      error: null,

      // ============================================
      // ACTIONS
      // ============================================

      /**
       * 💾 Définir la marque dans le store
       */
      setMyBrand: (brand: Brand | null) => set({ myBrand: brand }),
      setStats: (stats: EnhancedBrandStats | null) => set({ stats }),
      /**
       * 🔄 Charger ma marque depuis l'API
       */
      loadMyBrand: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('🔄 [Brand Store] Chargement de la marque...');

          const brand = await brandService.getMyBrand();
          set({ myBrand: brand, isLoading: false });

          console.log('✅ [Brand Store] Marque chargée:', brand.id);
        } catch (error: any) {
          console.error('❌ [Brand Store] Erreur chargement marque:', error);
          
          // Si 404, c'est normal (pas encore de marque)
          if (error?.message?.includes('404') || error?.message?.includes('non trouvée')) {
            set({ myBrand: null, error: null, isLoading: false });
          } else {
            set({ 
              error: error?.message || 'Erreur lors du chargement de la marque',
              isLoading: false 
            });
          }
        }
      },

      
      /**
       * 🗑️ Effacer la marque du store
       */
      clearBrand: () => {
        set({ myBrand: null, error: null });
        console.log('🗑️ [Brand Store] Marque effacée');
      },

      // ============================================
      // HELPERS
      // ============================================

      /**
       * 🎭 Vérifier si l'utilisateur a une marque
       */
      hasBrand: () => {
        return get().myBrand !== null;
      },

      /**
       * 🆔 Obtenir l'ID de la marque
       */
      getBrandId: () => {
        return get().myBrand?.id || null;
      },
    }),
    {
      name: 'brand-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myBrand: state.myBrand,
      }),
    }
  )
);

// Hooks utilitaires
export const useHasBrand = () => useBrandStore((state) => state.hasBrand());
export const useMyBrand = () => useBrandStore((state) => state.myBrand);
export const useBrandId = () => useBrandStore((state) => state.getBrandId());

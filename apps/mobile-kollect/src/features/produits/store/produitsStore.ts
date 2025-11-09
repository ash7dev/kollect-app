import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProduitDto } from '../services/produits.service';

interface ProduitsState {
  // État
  produits: ProduitDto[];
  lastFetchedAt: number | null;
  isFetching: boolean;
  
  // Actions
  setProduits: (data: ProduitDto[]) => void;
  setIsFetching: (v: boolean) => void;
  addProduit: (produit: ProduitDto) => void;
  updateProduit: (id: string, updates: Partial<ProduitDto>) => void;
  removeProduit: (id: string) => void;
  getProduitById: (id: string) => ProduitDto | undefined;
  getProduitsByCollection: (collectionId: string) => ProduitDto[];
  clearProduits: () => void;
}

export const useProduitsStore = create<ProduitsState>()(
  persist(
    (set, get) => ({
      // État initial
      produits: [],
      lastFetchedAt: null,
      isFetching: false,
      
      // Actions
      setProduits: (data) => set({ 
        produits: data, 
        lastFetchedAt: Date.now() 
      }),
      
      setIsFetching: (v) => set({ isFetching: v }),
      
      addProduit: (produit) => 
        set((state) => ({
          produits: [...state.produits, produit]
        })),
      
      updateProduit: (id, updates) =>
        set((state) => ({
          produits: state.produits.map((produit) =>
            produit.id === id ? { ...produit, ...updates } : produit
          )
        })),
      
      removeProduit: (id) =>
        set((state) => ({
          produits: state.produits.filter((produit) => produit.id !== id)
        })),
      
      getProduitById: (id) => {
        const state = get();
        return state.produits.find((produit) => produit.id === id);
      },
      
      getProduitsByCollection: (collectionId) => {
        const state = get();
        return state.produits.filter(
          (produit) => produit.collectionId === collectionId
        );
      },
      
      clearProduits: () => set({ produits: [], lastFetchedAt: null })
    }),
    {
      name: 'produits-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        produits: state.produits,
        lastFetchedAt: state.lastFetchedAt
      }),
    }
  )
);

// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLLECTION_DRAFT_KEY = '@draft_collection';

export interface ProductDraft {
  colors: string[];
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  sizes: string[];
}

export interface CollectionDraft {
  name: string;
  description?: string;
  launchDate?: string;
  launchTime?: string;
  isFeatured?: boolean;
  coverImage?: string;
  teaserVideo?: string;
  products: ProductDraft[];
}

export const storage = {
  saveDraftCollection: async (data: CollectionDraft): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(COLLECTION_DRAFT_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
      return false;
    }
  },

  getDraftCollection: async (): Promise<CollectionDraft | null> => {
    try {
      const data = await AsyncStorage.getItem(COLLECTION_DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du brouillon:', error);
      return null;
    }
  },

  clearDraftCollection: async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(COLLECTION_DRAFT_KEY);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du brouillon:', error);
      return false;
    }
  },

  // Ajouter un produit au draft existant
  addProductToDraft: async (product: ProductDraft): Promise<boolean> => {
    try {
      const existingDraft = await storage.getDraftCollection();
      const draft: CollectionDraft = existingDraft || {
        name: 'Nouvelle collection',
        description: '',
        products: []
      };
      draft.products = [...draft.products, product];
      return await storage.saveDraftCollection(draft);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit au brouillon:', error);
      return false;
    }
  },
};
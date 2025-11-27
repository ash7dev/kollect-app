 
// src/features/collections/store/collections.store.ts
import { create } from 'zustand';
import { collectionsApi, CollectionDto, CreateCollectionPayload } from '../services/collections.service';

interface CollectionsState {
  collections: CollectionDto[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  createCollection: (payload: CreateCollectionPayload & { brandId: string }) => Promise<CollectionDto>;
  activateTeaser: (id: string, body: { coverImage?: string; teaserVideo?: string }) => Promise<void>;
  launchCollection: (id: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  loading: false,
  error: null,

  fetchCollections: async () => {
    set({ loading: true, error: null });
    try {
      const response = await collectionsApi.listForCEO({ includeProducts: true });
      set({ collections: response?.data || [], loading: false });
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      const errorMessage = error?.response?.data?.message || 'Erreur lors du chargement des collections';
      set({ error: errorMessage, loading: false, collections: [] });
    }
  },

 createCollection: async (payload) => {
  set({ loading: true, error: null });
  try {
    const newCollection = await collectionsApi.create(payload); // Changed from .create()
    set((state) => ({ 
      collections: [newCollection, ...state.collections],
      loading: false 
    }));
    return newCollection;
  } catch (error) {
    set({ error: 'Erreur lors de la création', loading: false });
    throw error;
  }
},

  activateTeaser: async (id, body) => {
    set({ loading: true, error: null });
    try {
      const updated = await collectionsApi.activateTeaser(id, body);
      set((state) => ({
        collections: state.collections.map(c => 
          c.id === id ? updated : c
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Erreur lors de l\'activation du teaser', loading: false });
      throw error;
    }
  },

  launchCollection: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await collectionsApi.launch(id);
      set((state) => ({
        collections: state.collections.map(c => 
          c.id === id ? updated : c
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Erreur lors du lancement', loading: false });
      throw error;
    }
  }
}));
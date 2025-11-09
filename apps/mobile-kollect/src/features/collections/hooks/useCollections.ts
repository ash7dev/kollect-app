// src/features/collections/hooks/useCollections.ts
import { useCallback } from 'react';
import { CreateCollectionPayload } from '../services/collections.service';
import { useCollectionsStore } from '../store/collectionStore';

export function useCollections() {
  const { 
    collections, 
    loading, 
    error,
    fetchCollections,
    createCollection,
    activateTeaser,
    launchCollection
  } = useCollectionsStore();

  const handleCreateCollection = useCallback(async (data: CreateCollectionPayload & { brandId: string }) => {
  try {
    await createCollection(data);
    await fetchCollections();
  } catch (error) {
    console.error('Erreur création collection:', error);
    throw error;
  }
}, [createCollection, fetchCollections]);

  return {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection: handleCreateCollection,
    activateTeaser,
    launchCollection
  };
}
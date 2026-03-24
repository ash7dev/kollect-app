// ============================================
// REACT QUERY HOOKS (POUR REACT NATIVE)
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { collectionsApi, CreateCollectionPayload, QueryParams, UpdateCollectionPayload } from '../services/collections.service';

const QUERY_KEYS = {
  collections: ['collections'] as const,
  collection: (id: string) => ['collections', id] as const,
  publicCollections: ['collections', 'public'] as const,
  publicCollection: (id: string) => ['collections', 'public', id] as const,
};

// ✅ HOOKS CEO

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      console.log('=== DÉBUT APPEL API COLLECTIONS ===');
      console.log('URL:', '/api/collections');
      try {
        const response = await fetch('/api/collections', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Statut de la réponse:', response.status);
        const data = await response.json();
        console.log('Réponse API:', data);
        return data;
      } catch (error) {
        console.error('Erreur lors de la récupération des collections:', error);
        throw error;
      }
    }
  });
};

export function useCollection(id: string, includeProducts = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.collection(id), { includeProducts }],
    queryFn: () => collectionsApi.getOne(id, includeProducts),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (data: CreateCollectionPayload) =>
      collectionsApi.create(data, (percent) => setUploadProgress(percent)),
    onSuccess: () => {
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  const reset = useCallback(() => {
    setUploadProgress(0);
    mutation.reset();
  }, [mutation]);

  return { ...mutation, uploadProgress, reset };
}

export function useCreateCollectionWithFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      file,
    }: {
      payload: CreateCollectionPayload;
      file?: { uri: string; type: string; name: string };
    }) => collectionsApi.createWithFile(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionPayload }) =>
      collectionsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collection(variables.id) });
    },
  });
}

export function useActivateTeaser(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { coverImage?: string; teaserVideo?: string } }) =>
      collectionsApi.activateTeaser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collection(variables.id) });
    },
  });
}

export function useLaunchCollection(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.launch(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collection(id) });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
  });
}

// ✅ HOOKS PUBLICS

export function usePublicCollections(params?: Omit<QueryParams, 'status'>) {
  return useQuery({
    queryKey: [...QUERY_KEYS.publicCollections, params],
    queryFn: () => collectionsApi.listPublic(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCollection(id: string, includeProducts = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.publicCollection(id), { includeProducts }],
    queryFn: () => collectionsApi.getPublic(id, includeProducts),
    enabled: !!id,
  });
}
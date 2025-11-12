import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produitsService, UpdateProduitPayload } from '@/features/produits/services/produits.service';
import { Alert } from 'react-native';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => produitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || 'Impossible de supprimer le produit');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, imageUris }: { id: string; payload: UpdateProduitPayload; imageUris?: string[] }) =>
      produitsService.update(id, payload, imageUris),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', 'ceo', variables.id] });
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le produit');
    },
  });
}


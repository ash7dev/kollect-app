'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCollectionFromDraft } from '@/services/api/collections';
import type { WizardDraft } from '@/types/drops';

export function useCreateCollection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (draft: WizardDraft) => createCollectionFromDraft(draft),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo'] });
    },
  });
}


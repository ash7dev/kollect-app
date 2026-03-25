'use client';

import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { CeoCollection, Paginated, WizardDraft } from '@/types/drops';

function isoFromDatetimeLocal(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function buildCreateCollectionFormData(draft: WizardDraft) {
  const fd = new FormData();

  const dto = {
    name: draft.name.trim(),
    description: draft.description.trim() ? draft.description.trim() : null,
    launchDate: draft.mode === 'teaser' ? isoFromDatetimeLocal(draft.launchDate) : null,
    isFeatured: draft.isFeatured,
    coverImage: null as string | null,
    teaserVideo: null as string | null,
    products: draft.products.map((p) => ({
      name: p.name.trim(),
      description: p.description.trim() ? p.description.trim() : null,
      price: Number(p.price),
      stock: Number(p.stock),
      sku: p.sku.trim(),
      images: Array.from({ length: Math.max(1, p.images.length) }).map(() => ''),
      sizes: p.sizes.length ? p.sizes : ['UNIQUE'],
      colors: p.colors ?? [],
    })),
  };

  fd.append('data', JSON.stringify(dto));

  if (draft.collectionMedia) {
    fd.append('collectionMedia', draft.collectionMedia, draft.collectionMedia.name);
  }

  draft.products.forEach((p, productIndex) => {
    p.images.forEach((file, imageIndex) => {
      fd.append(`product-${productIndex}-image-${imageIndex}`, file, file.name);
    });
  });

  return fd;
}

export async function fetchCeoCollections() {
  const { data } = await apiClient.get<Paginated<CeoCollection>>(API_ENDPOINTS.COLLECTIONS.LIST_CEO);
  return data;
}

export async function createCollectionFromDraft(draft: WizardDraft) {
  const fd = buildCreateCollectionFormData(draft);
  const { data } = await apiClient.post(API_ENDPOINTS.COLLECTIONS.CREATE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}


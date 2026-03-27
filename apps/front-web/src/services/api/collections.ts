'use client';

import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { CeoCollection, CeoCollectionDetail, Paginated, WizardDraft } from '@/types/drops';

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
    mode: draft.mode,
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

export async function fetchCeoCollectionDetail(id: string): Promise<CeoCollectionDetail> {
  const { data } = await apiClient.get<CeoCollectionDetail>(
    `${API_ENDPOINTS.COLLECTIONS.DETAIL(id)}?includeProducts=true`,
  );
  return { ...data, products: data.products ?? [] };
}

export async function deleteCollection(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.COLLECTIONS.DELETE(id));
}

export async function updateCollection(id: string, fields: {
  name?: string;
  description?: string;
  launchDate?: string | null;
  isFeatured?: boolean;
}): Promise<CeoCollection> {
  const { data } = await apiClient.patch<CeoCollection>(
    API_ENDPOINTS.COLLECTIONS.UPDATE(id),
    fields,
  );
  return data;
}

/** Upload un nouveau fichier cover (image ou vidéo) via multipart */
export async function updateCollectionCover(id: string, file: File): Promise<CeoCollection> {
  const fd = new FormData();
  fd.append('collectionMedia', file, file.name);
  const { data } = await apiClient.patch<CeoCollection>(
    `${API_ENDPOINTS.COLLECTIONS.UPDATE(id)}/cover`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/** Supprime le cover existant (image ET vidéo mis à null) */
export async function removeCollectionCover(id: string): Promise<CeoCollection> {
  const { data } = await apiClient.patch<CeoCollection>(
    API_ENDPOINTS.COLLECTIONS.UPDATE(id),
    { coverImage: null, teaserVideo: null },
  );
  return data;
}

export async function createCollectionFromDraft(draft: WizardDraft) {
  const fd = buildCreateCollectionFormData(draft);
  const { data } = await apiClient.post(API_ENDPOINTS.COLLECTIONS.CREATE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}


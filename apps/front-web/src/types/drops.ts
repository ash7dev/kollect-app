export type CollectionStatus = 'BROUILLON' | 'TEASER' | 'DISPONIBLE' | 'EPUISEE' | 'TERMINE';

export type CeoCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CollectionStatus;
  launchDate: string | null;
  launchedAt: string | null;
  isFeatured: boolean;
  coverImage: string | null;
  teaserVideo: string | null;
  _count?: { products: number };
};

export type Paginated<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type WizardProductDraft = {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  sizes: string[];
  colors: string[];
  images: File[];
};

export type WizardDraft = {
  name: string;
  description: string;
  isFeatured: boolean;
  mode: 'disponible' | 'teaser';
  launchDate: string;
  collectionMedia: File | null;
  products: WizardProductDraft[];
};


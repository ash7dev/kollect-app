export type CollectionStatus = 'BROUILLON' | 'TEASER' | 'DISPONIBLE' | 'EPUISEE' | 'TERMINE';

export type CeoCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CollectionStatus;
  launchDate: string | null;
  endDate?: string | null;
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

export type CollectionProduct = {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  price: number;
  /** Prix avant réduction — présent uniquement côté vue publique avec promos */
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  stock: number;
  sku: string | null;
  sizes: string[];
  colors: string[];
  images: string[];
  /**
   * Retourné par l'API CEO.
   * false = produit masqué (ex : collection en mode TEASER avant lancement)
   */
  isVisible?: boolean;
  /**
   * Retourné par l'API CEO uniquement (non-public).
   * Suppression logique : le produit n'apparaît plus dans la boutique.
   */
  isDeleted?: boolean;
};

export type PublicCollectionProduct = {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  stock?: number;
  sku?: string | null;
  sizes?: string[];
  colors?: string[];
  images: string[];
  isVisible?: boolean;
};

export type CeoCollectionDetail = CeoCollection & {
  products: CollectionProduct[];
};

export type PublicCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CollectionStatus;
  launchDate: string | null;
  endDate?: string | null;
  launchedAt: string | null;
  isFeatured: boolean;
  coverImage: string | null;
  teaserVideo: string | null;
  originalPrice?: number;
  discountType?: string;
  discountValue?: number;
  brand: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
    isVerified: boolean;
  };
  products?: PublicCollectionProduct[];
  _count?: { products: number };
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
  productType: string;
  gender: string;
  weight?: number;
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

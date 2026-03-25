export type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  isVerified?: boolean;
  followerCount?: number;
  createdAt?: string;
  /** 1 produit (API) pour image de bannière si pas de cover */
  products?: { images: string[] }[];
  /** 1 collection (API) — même logique que mobile : cover collection → image produit */
  collections?: {
    coverImage?: string | null;
    products?: { images: string[] }[];
  }[];
  _count?: {
    products: number;
    collections: number;
    favoris: number;
  };
};

export type BrandSortId = 'featured' | 'name-asc' | 'products' | 'recent';

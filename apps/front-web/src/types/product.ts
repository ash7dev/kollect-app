export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
  isFeatured: boolean;
  productType?: string | null;
  gender?: string | null;
  collection: { id: string; name: string; slug?: string; status: string } | null;
  brand: { id: string; name: string; slug: string; logo?: string | null; isVerified?: boolean };
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock?: number | null;
  sizes?: string[];
  colors?: string[];
  isFeatured?: boolean;
  productType?: string | null;
  gender?: string | null;
  collection?: { id: string; name: string; slug?: string; status?: string } | null;
  brand?: { id: string; name: string; slug: string; logo?: string | null; isVerified?: boolean };
  createdAt?: string;
};

export type ProductFilters = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  colors?: string[];
  sizes?: string[];
};

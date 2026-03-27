export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  images: string[];
  stock?: number | null;
  sizes: string[];
  colors: string[];
  material?: string | null;
  collection?: { id: string; name: string } | null;
  brand: { id: string; name: string; slug: string; logo?: string | null };
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
  collection?: { id: string; name: string } | null;
  brand?: { id: string; name: string; slug: string; logo?: string | null };
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

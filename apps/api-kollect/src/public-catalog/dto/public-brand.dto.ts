import { PublicCollectionDto } from './public-collection.dto';
import { PublicProductDto } from './public-product.dto';

export interface PublicBrandOwnerDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatar?: string | null;
}

export interface PublicBrandCollectionPreviewDto {
  coverImage: string | null;
  products: Array<{
    images: string[];
  }>;
}

export interface PublicBrandImagePreviewDto {
  images: string[];
}

export interface PublicBrandListItemDto {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  isActive: boolean;
  followerCount: number;
  createdAt: Date;
  user: PublicBrandOwnerDto | null;
  products: PublicBrandImagePreviewDto[];
  collections: PublicBrandCollectionPreviewDto[];
  _count: {
    products: number;
    collections: number;
    favoris: number;
  };
}

export interface PublicBrandDetailDto {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  isActive: boolean;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: PublicBrandOwnerDto | null;
  collections: PublicCollectionDto[];
  products: PublicProductDto[];
  _count: {
    products: number;
    collections: number;
    favoris: number;
    reviews: number;
  };
}

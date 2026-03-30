import { CollectionStatus, ProductGender, ProductType } from '@prisma/client';

export interface PublicProductBrandDto {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isVerified?: boolean;
}

export interface PublicProductCollectionDto {
  id: string;
  name: string;
  status: CollectionStatus;
  slug?: string;
}

export interface PublicProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  isFeatured: boolean;
  brandId: string;
  collectionId: string;
  brand: PublicProductBrandDto;
  collection: PublicProductCollectionDto;
  productType?: ProductType | null;
  gender?: ProductGender | null;
  createdAt?: Date;
  updatedAt?: Date;
  viewCount?: number;
}

import { CollectionStatus } from '@prisma/client';

export interface PublicCollectionBrandDto {
  id: string;
  name: string;
  logo: string | null;
  slug: string;
  isVerified: boolean;
}

export interface PublicCollectionProductPreviewDto {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  images: string[];
  stock?: number;
  sizes?: string[];
  colors?: string[];
  sku?: string | null;
  isVisible?: boolean;
}

export interface PublicCollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CollectionStatus;
  launchDate: Date | null;
  endDate: Date | null;
  launchedAt: Date | null;
  isFeatured: boolean;
  coverImage: string | null;
  teaserVideo: string | null;
  brandId: string;
  brand: PublicCollectionBrandDto;
  products?: PublicCollectionProductPreviewDto[];
  createdAt?: Date | string | null;
  _count: {
    products: number;
  };
}

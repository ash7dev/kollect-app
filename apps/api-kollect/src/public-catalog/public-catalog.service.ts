import { Injectable } from '@nestjs/common';
import { CollectionStatus, Prisma } from '@prisma/client';
import {
  PublicBrandDetailDto,
  PublicBrandListItemDto,
} from './dto/public-brand.dto';
import {
  PublicCollectionDto,
  PublicCollectionProductPreviewDto,
} from './dto/public-collection.dto';
import { PublicProductDto } from './dto/public-product.dto';

@Injectable()
export class PublicCatalogService {
  readonly publicCollectionStatuses: CollectionStatus[] = [
    CollectionStatus.TEASER,
    CollectionStatus.DISPONIBLE,
  ];

  getPublicCollectionWhere(
    extraWhere: Prisma.CollectionWhereInput = {},
  ): Prisma.CollectionWhereInput {
    return {
      AND: [
        {
          status: {
            in: this.publicCollectionStatuses,
          },
        },
        extraWhere,
      ],
    };
  }

  getPublicProductWhere(
    extraWhere: Prisma.ProduitWhereInput = {},
  ): Prisma.ProduitWhereInput {
    return {
      AND: [
        {
          isVisible: true,
          isDeleted: false,
          collection: {
            status: CollectionStatus.DISPONIBLE,
          },
        },
        extraWhere,
      ],
    };
  }

  getCollectionPreviewProductWhere(
    status: CollectionStatus,
  ): Prisma.ProduitWhereInput {
    if (status === CollectionStatus.TEASER) {
      return {
        isDeleted: false,
      };
    }

    return {
      isDeleted: false,
      isVisible: true,
    };
  }

  isCollectionPublic(status: CollectionStatus): boolean {
    return this.publicCollectionStatuses.includes(status);
  }

  mapPublicProduct(product: any): PublicProductDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      price: product.price,
      images: product.images ?? [],
      stock: product.stock ?? 0,
      isFeatured: product.isFeatured ?? false,
      brandId: product.brandId,
      collectionId: product.collectionId,
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
        logo: product.brand.logo ?? null,
        isVerified: product.brand.isVerified,
      },
      collection: {
        id: product.collection.id,
        name: product.collection.name,
        status: product.collection.status,
        slug: product.collection.slug,
      },
      productType: product.productType ?? null,
      gender: product.gender ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      viewCount: product.viewCount,
    };
  }

  mapPublicCollectionProductPreview(
    product: any,
  ): PublicCollectionProductPreviewDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      price: product.price,
      images: product.images ?? [],
      stock: product.stock,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      sku: product.sku ?? null,
      isVisible: product.isVisible,
    };
  }

  mapPublicCollection(collection: any): PublicCollectionDto {
    return {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? null,
      status: collection.status,
      launchDate: collection.launchDate ?? null,
      endDate: collection.endDate ?? null,
      launchedAt: collection.launchedAt ?? null,
      isFeatured: collection.isFeatured ?? false,
      coverImage: collection.coverImage ?? null,
      teaserVideo: collection.teaserVideo ?? null,
      brandId: collection.brandId,
      brand: {
        id: collection.brand.id,
        name: collection.brand.name,
        logo: collection.brand.logo ?? null,
        slug: collection.brand.slug,
        isVerified: collection.brand.isVerified,
      },
      products: collection.products?.map((product: any) =>
        this.mapPublicCollectionProductPreview(product),
      ),
      _count: {
        products: collection._count?.products ?? 0,
      },
    };
  }

  mapPublicBrandListItem(brand: any): PublicBrandListItemDto {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      bio: brand.bio ?? null,
      logo: brand.logo ?? null,
      coverImage: brand.coverImage ?? null,
      website: brand.website ?? null,
      instagram: brand.instagram ?? null,
      whatsapp: brand.whatsapp ?? null,
      isVerified: brand.isVerified,
      isActive: brand.isActive,
      followerCount: brand.followerCount ?? 0,
      createdAt: brand.createdAt,
      user: brand.user
        ? {
            id: brand.user.id,
            firstName: brand.user.firstName ?? null,
            lastName: brand.user.lastName ?? null,
            avatar: brand.user.avatar ?? null,
          }
        : null,
      products:
        brand.products?.map((product: any) => ({
          images: product.images ?? [],
        })) ?? [],
      collections:
        brand.collections?.map((collection: any) => ({
          coverImage: collection.coverImage ?? null,
          products:
            collection.products?.map((product: any) => ({
              images: product.images ?? [],
            })) ?? [],
        })) ?? [],
      _count: {
        products: brand._count?.products ?? 0,
        collections: brand._count?.collections ?? 0,
        favoris: brand._count?.favoris ?? 0,
      },
    };
  }

  mapPublicBrandDetail(brand: any): PublicBrandDetailDto {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      bio: brand.bio ?? null,
      logo: brand.logo ?? null,
      coverImage: brand.coverImage ?? null,
      website: brand.website ?? null,
      instagram: brand.instagram ?? null,
      whatsapp: brand.whatsapp ?? null,
      isVerified: brand.isVerified,
      isActive: brand.isActive,
      followerCount: brand.followerCount ?? 0,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      user: brand.user
        ? {
            id: brand.user.id,
            firstName: brand.user.firstName ?? null,
            lastName: brand.user.lastName ?? null,
            avatar: brand.user.avatar ?? null,
          }
        : null,
      collections:
        brand.collections?.map((collection: any) =>
          this.mapPublicCollection(collection),
        ) ?? [],
      products:
        brand.products?.map((product: any) => this.mapPublicProduct(product)) ??
        [],
      _count: {
        products: brand._count?.products ?? 0,
        collections: brand._count?.collections ?? 0,
        favoris: brand._count?.favoris ?? 0,
        reviews: brand._count?.reviews ?? 0,
      },
    };
  }
}

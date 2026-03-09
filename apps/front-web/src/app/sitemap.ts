import type { MetadataRoute } from 'next';
import { fetchAPI, getSiteUrl } from '@/lib/api';

type Brand = { slug: string; updatedAt?: string | Date };
type Collection = { slug: string; updatedAt?: string | Date };
type Product = { slug: string; updatedAt?: string | Date };

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; totalPages: number };
};

async function fetchAllCollections(): Promise<Collection[]> {
  const limit = 100;
  let page = 1;
  const results: Collection[] = [];

  while (page <= 20) {
    const res = await fetchAPI<Paginated<Collection>>(
      `/collections/public?page=${page}&limit=${limit}`,
      { cache: 'no-store' },
    );
    results.push(...res.data);
    if (page >= res.meta.totalPages) break;
    page += 1;
  }

  return results;
}

async function fetchAllProducts(): Promise<Product[]> {
  const limit = 100;
  let page = 1;
  const results: Product[] = [];

  while (page <= 20) {
    const res = await fetchAPI<Paginated<Product>>(
      `/produits/search?page=${page}&limit=${limit}&inStock=false`,
      { cache: 'no-store' },
    );
    results.push(...res.data);
    if (page >= res.meta.totalPages) break;
    page += 1;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [brands, collections, products] = await Promise.all([
    fetchAPI<Brand[]>('/brands', { cache: 'no-store' }).catch(() => []),
    fetchAllCollections().catch(() => []),
    fetchAllProducts().catch(() => []),
  ]);

  const urls: MetadataRoute.Sitemap = [];

  urls.push({ url: base, lastModified: new Date() });

  for (const brand of brands) {
    urls.push({
      url: `${base}/brand/${brand.slug}`,
      lastModified: brand.updatedAt ? new Date(brand.updatedAt) : new Date(),
    });
  }

  for (const collection of collections) {
    urls.push({
      url: `${base}/collection/${collection.slug}`,
      lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
    });
  }

  for (const product of products) {
    urls.push({
      url: `${base}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    });
  }

  return urls;
}

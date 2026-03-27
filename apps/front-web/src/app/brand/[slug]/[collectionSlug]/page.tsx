import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PublicCollectionPage } from '@/components/collections/PublicCollectionPage';
import type { PublicCollection } from '@/types/drops';

type CollectionProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[] | null;
  stock?: number | null;
  collection?: { name?: string | null } | null;
};

type Paginated<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

async function getCollection(slug: string): Promise<PublicCollection | null> {
  try {
    return await fetchAPI<PublicCollection>(`/collections/public/slug/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

async function getCollectionProducts(collectionId: string): Promise<CollectionProduct[]> {
  try {
    const res = await fetchAPI<CollectionProduct[] | { data: CollectionProduct[] }>(
      `/produits/collection/${collectionId}?limit=50`,
      { revalidate: 300 },
    );
    if (Array.isArray(res)) return res;
    if (res && 'data' in res && Array.isArray(res.data)) return res.data;
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; collectionSlug: string };
}): Promise<Metadata> {
  const collection = await getCollection(params.collectionSlug);
  if (!collection) return { title: 'Collection introuvable | Kollect' };
  return {
    title: `${collection.name} — ${collection.brand.name} | Kollect`,
    description: collection.description ?? `Découvre la collection ${collection.name} de ${collection.brand.name} sur Kollect.`,
    openGraph: {
      title: `${collection.name} — ${collection.brand.name} | Kollect`,
      images: collection.coverImage ? [{ url: collection.coverImage }] : undefined,
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: { slug: string; collectionSlug: string };
}) {
  const collection = await getCollection(params.collectionSlug);
  if (!collection) notFound();

  const rawProducts = await getCollectionProducts(collection.id);
  const products = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    images: p.images ?? [],
    stock: p.stock ?? null,
    collection: p.collection ?? null,
  }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Navbar />
      <PublicCollectionPage collection={collection} products={products} />
      <Footer />
    </div>
  );
}

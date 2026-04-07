import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PublicCollectionPage } from '@/components/collections/PublicCollectionPage';
import type { PublicCollection } from '@/types/drops';

async function getCollection(slug: string): Promise<PublicCollection | null> {
  try {
    return await fetchAPI<PublicCollection>(`/collections/public/slug/${slug}`, { revalidate: 0 });
  } catch {
    return null;
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

  const products = (collection.products ?? [])
    .filter((product) => product.slug && product.name && typeof product.price === 'number' && (product.isVisible || collection.status === 'TEASER'))
    .map((product) => ({
      id: product.id,
      slug: product.slug!,
      name: product.name!,
      price: product.price!,
      originalPrice: product.originalPrice,
      discountType: product.discountType,
      discountValue: product.discountValue,
      images: product.images ?? [],
      stock: product.stock ?? null,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      collection: { name: collection.name },
    }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Navbar />
      <PublicCollectionPage collection={collection} products={products} />
      <Footer />
    </div>
  );
}

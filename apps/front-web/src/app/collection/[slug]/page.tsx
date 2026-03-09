import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  teaserVideo?: string | null;
  updatedAt?: string | Date;
};

type CollectionPage = {
  data: Collection[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

async function findCollectionBySlug(slug: string): Promise<Collection | null> {
  const limit = 100;
  let page = 1;

  while (page <= 20) {
    const res = await fetchAPI<CollectionPage>(`/collections/public?page=${page}&limit=${limit}`, {
      revalidate: 300,
    });

    const found = res.data.find((c) => c.slug === slug);
    if (found) return found;

    if (page >= res.meta.totalPages) break;
    page += 1;
  }

  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await findCollectionBySlug(params.slug);

  if (!collection) {
    return {
      title: 'Collection introuvable | Kollect',
      description: 'Cette collection est introuvable.',
    };
  }

  return {
    title: `${collection.name} | Kollect`,
    description: collection.description ?? `Découvre la collection ${collection.name} sur Kollect.`,
    openGraph: {
      title: `${collection.name} | Kollect`,
      description: collection.description ?? `Découvre la collection ${collection.name} sur Kollect.`,
      images: collection.coverImage ? [{ url: collection.coverImage }] : undefined,
    },
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await findCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{collection.name}</h1>
      {collection.description && <p>{collection.description}</p>}
    </main>
  );
}

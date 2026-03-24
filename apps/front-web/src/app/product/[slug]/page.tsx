import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  images?: string[];
  updatedAt?: string | Date;
};

async function findProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await fetchAPI<Product>(`/produits/public/slug/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await findProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Produit introuvable | Kollect',
      description: 'Ce produit est introuvable.',
    };
  }

  return {
    title: `${product.name} | Kollect`,
    description: product.description ?? `Découvre ${product.name} sur Kollect.`,
    openGraph: {
      title: `${product.name} | Kollect`,
      description: product.description ?? `Découvre ${product.name} sur Kollect.`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await findProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{product.name}</h1>
      {product.description && <p>{product.description}</p>}
    </main>
  );
}

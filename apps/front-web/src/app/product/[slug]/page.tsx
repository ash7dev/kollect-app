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

type ProductPage = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

async function findProductBySlug(slug: string): Promise<Product | null> {
  const limit = 100;
  let page = 1;

  while (page <= 20) {
    const res = await fetchAPI<ProductPage>(
      `/produits/search?page=${page}&limit=${limit}&inStock=false`,
      { revalidate: 300 },
    );

    const found = res.data.find((p) => p.slug === slug);
    if (found) return found;

    if (page >= res.meta.totalPages) break;
    page += 1;
  }

  return null;
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

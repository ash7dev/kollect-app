import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { ProductDetailPage } from '@/components/brands/brand-shop/ProductDetailPage';
import type { PublicProduct } from '@/types/product';

async function findProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    return await fetchAPI<PublicProduct>(`/produits/public/slug/${slug}`, { revalidate: 300 });
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
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Navbar transparent />
      <ProductDetailPage product={product} />
    </div>
  );
}

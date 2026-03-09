import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

type Brand = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  isVerified?: boolean;
  updatedAt?: string | Date;
};

async function getBrand(slug: string): Promise<Brand | null> {
  try {
    return await fetchAPI<Brand>(`/brands/slug/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = await getBrand(params.slug);

  if (!brand) {
    return {
      title: 'Marque introuvable | Kollect',
      description: 'Cette marque est introuvable.',
    };
  }

  return {
    title: `${brand.name} | Kollect`,
    description: brand.bio ?? `Découvre la marque ${brand.name} sur Kollect.`,
    openGraph: {
      title: `${brand.name} | Kollect`,
      description: brand.bio ?? `Découvre la marque ${brand.name} sur Kollect.`,
      images: brand.coverImage ? [{ url: brand.coverImage }] : undefined,
    },
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);

  if (!brand) {
    notFound();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{brand.name}</h1>
      {brand.bio && <p>{brand.bio}</p>}
    </main>
  );
}

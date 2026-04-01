import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Navbar } from '@/components/landing/Navbar';
import { BrandShopPage } from '@/components/brands/brand-shop/BrandShopPage';

type BrandCollection = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  teaserVideo?: string | null;
  status?: string | null;
  launchDate?: string | null;
  launchedAt?: string | null;
  createdAt?: string | null;
  _count?: { products: number } | null;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  isVerified?: boolean;
  followerCount?: number | null;
  collections?: BrandCollection[];
  updatedAt?: string | Date;
  instagram?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

type BrandProductApi = {
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

async function getBrand(slug: string): Promise<Brand | null> {
  try {
    return await fetchAPI<Brand>(`/brands/slug/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

async function getBrandProducts(slug: string, page: number, limit: number, sortBy: string): Promise<Paginated<BrandProductApi> | null> {
  try {
    return await fetchAPI<Paginated<BrandProductApi>>(`/produits/brand/${slug}?page=${page}&limit=${limit}&sortBy=${sortBy}`, {
      cache: 'no-store'
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = await getBrand(params.slug);

  if (!brand) {
    return {
      title: 'Marque introuvable | Kollect',
      description: 'Cette marque streetwear sénégalaise est introuvable sur Kollect.',
    };
  }

  return {
    title: `${brand.name} — Marque streetwear sénégalaise | Kollect`,
    description: brand.bio ?? `Découvre ${brand.name}, marque streetwear sénégalaise sur Kollect. Collections exclusives et pièces uniques made in Sénégal.`,
    keywords: [`${brand.name}`, 'streetwear sénégalais', 'made in Sénégal', 'fashion Dakar', 'marque locale'],
    authors: [{ name: brand.name }],
    openGraph: {
      type: 'profile',
      title: `${brand.name} — Marque streetwear sénégalaise`,
      description: brand.bio ?? `Découvre la marque ${brand.name} sur Kollect. Streetwear authentique made in Sénégal.`,
      images: brand.coverImage ? [{ 
        url: brand.coverImage, 
        width: 1200, 
        height: 630,
        alt: `${brand.name} - Streetwear sénégalais`
      }] : [{ 
        url: '/kollect.png', 
        width: 1200, 
        height: 630,
        alt: `${brand.name} - Kollect`
      }],
      locale: 'fr_SN',
      siteName: 'Kollect',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} — Streetwear sénégalais`,
      description: brand.bio ?? `Découvre ${brand.name} sur Kollect. Marque streetwear made in Sénégal.`,
      images: brand.coverImage ? [brand.coverImage] : ['/kollect.png'],
    },
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);

  if (!brand) {
    notFound();
  }

  const productsRes = await getBrandProducts(brand.slug, 1, 100, 'recent');
  const initialProducts = (productsRes?.data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    images: p.images ?? [],
    stock: p.stock ?? null,
    collection: p.collection ?? null,
  }));

  const initialMeta = productsRes?.meta ?? { total: 0, page: 1, limit: 100, totalPages: 1 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <BrandShopPage brand={brand} initialProducts={initialProducts} initialMeta={initialMeta} />
    </div>
  );
}

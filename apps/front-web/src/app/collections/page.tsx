import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { CollectionsPage } from '@/components/collections/page/CollectionsPage';
import { fetchCollections } from '@/services/collectionsApi';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Collections - Découvrez nos marques partenaires | Kollect',
  description: 'Explorez les collections exclusives de streetwear, mode et lifestyle. Découvrez les dernières tendances et les marques émergentes.',
  openGraph: {
    title: 'Collections - Kollect',
    description: 'Découvrez les collections de nos marques partenaires',
    images: ['/og-collections.jpg'],
  },
};

export default async function Page() {
  const collections = await fetchCollections();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <CollectionsPage collections={collections} />
      </div>
      <Footer />
    </div>
  );
}

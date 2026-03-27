import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ExplorerPage } from '@/components/explorer/ExplorerPage';

export const metadata = {
  title: 'Explorer - Produits, Collections & Marques | Kollect',
  description: 'Explorez tous les produits, collections et marques du streetwear sénégalais.',
};

export default function Page() {
  return (
    <>
      <Navbar />
      <ExplorerPage />
      <Footer />
    </>
  );
}

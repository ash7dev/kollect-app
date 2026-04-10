import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { DiscoveryPage } from '@/components/discovery/DiscoveryPage';

export const metadata = {
  title: 'Découverte - Galerie Kollect',
  description: 'Galerie style Pinterest pour découvrir toutes nos créations et produits streetwear.',
};

export default function Page() {
  return (
    <>
      {/* black=true force le Navbar a avoir le fond noir sur cette page blanche */}
      <Navbar black={true} />
      <DiscoveryPage />
      <Footer />
    </>
  );
}

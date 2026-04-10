import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ResourcesHero } from '@/components/resources/ResourcesHero';
import { ResourcesGrid } from '@/components/resources/ResourcesGrid';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Ressources - Kollect',
  description: 'Guides, conseils et ressources pour les créateurs et acheteurs sur Kollect.',
};

export default function Page() {
  return (
    <main style={{ fontFamily: FONT_FAMILY_INTER, backgroundColor: '#fff' }}>
      <Navbar />
      <ResourcesHero />
      <ResourcesGrid />
      <Footer />
    </main>
  );
}

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { HowItWorksHero } from '@/components/how-it-works/HowItWorksHero';
import { HowItWorksSteps } from '@/components/how-it-works/HowItWorksSteps';
import { HowItWorksCreators } from '@/components/how-it-works/HowItWorksCreators';
import { HowItWorksFAQ } from '@/components/how-it-works/HowItWorksFAQ';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Comment ça marche - Kollect',
  description: 'Découvrez comment Kollect fonctionne pour les acheteurs et les créateurs. Drops exclusifs, marques vérifiées, livraison rapide.',
};

export default function Page() {
  return (
    <main style={{ fontFamily: FONT_FAMILY_INTER, backgroundColor: '#fff' }}>
      <Navbar />
      <HowItWorksHero />
      <HowItWorksSteps />
      <HowItWorksCreators />
      <HowItWorksFAQ />
      <Footer />
    </main>
  );
}

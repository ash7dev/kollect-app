import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { SocialProof } from '@/components/landing/SocialProof';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DropsPreview } from '@/components/landing/DropsPreview';
import { CreatorCTA } from '@/components/landing/CreatorCTA';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Kollect — La plateforme streetwear sénégalaise',
  description: 'Découvrez, collectionnez et portez les créations des meilleurs créateurs streetwear du Sénégal. Drops exclusifs, marques vérifiées, livraison partout.',
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <DropsPreview />
        <CreatorCTA />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

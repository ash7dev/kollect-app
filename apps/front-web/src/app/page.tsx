import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { SocialProof } from '@/components/landing/SocialProof';
import { CuratedSelection } from '@/components/landing/CuratedSelection';
import { FeaturedCollections } from '@/components/landing/FeaturedCollections';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DropsPreview } from '@/components/landing/DropsPreview';
import { CreatorCTA } from '@/components/landing/CreatorCTA';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Kollect — La plateforme streetwear sénégalaise',
  description: 'Découvrez, collectionnez et portez les créations des meilleurs créateurs streetwear du Sénégal. Drops exclusifs, marques vérifiées, livraison partout.',
};

const LANDING_CANVAS = '#FFFFFF';

export default function LandingPage() {
  return (
    <div
      className="landing-page-root"
      style={{
        minHeight: '100vh',
        backgroundColor: LANDING_CANVAS,
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <Navbar />
      <main style={{ backgroundColor: 'transparent' }}>
        <Hero />
        <div
          className="landing-sections"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: LANDING_CANVAS,
            padding: '20px 0 32px',
          }}
        >
          <SocialProof />
          <CuratedSelection />
          <FeaturedCollections />
          <Features />
          <HowItWorks />
          <DropsPreview />
          <CreatorCTA />
          <Testimonials />
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}

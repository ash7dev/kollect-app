import { Navbar } from '@/components/landing/Navbar';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { SocialProof } from '@/components/landing/SocialProof';
import { DropsHype } from '@/components/landing/DropsHype';
import { CuratedSelection } from '@/components/landing/CuratedSelection';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FOMOSection } from '@/components/landing/FOMOSection';
import { CreatorCTA } from '@/components/landing/CreatorCTA';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Kollect — La plateforme streetwear sénégalaise',
  description: 'Découvrez, collectionnez et portez les créations des meilleurs créateurs streetwear du Sénégal. Drops exclusifs, marques vérifiées, livraison partout.',
  openGraph: {
    title: 'Kollect — Streetwear sénégalais',
    description: 'Les drops exclusifs des créateurs locaux vérifiés. Sois le premier.',
    siteName: 'Kollect',
    locale: 'fr_SN',
    type: 'website',
  },
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
        {/* Hero dynamique : bannière si drop imminent/récent, showcase sinon */}
        <HeroBanner />

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
          {/* Marques partenaires */}
          <SocialProof />

          {/* Section agenda : drops à venir + nouveautés — tabs internes, 1 fetch */}
          <DropsHype />

          {/* Sélection curatée + collections featuredées */}
          <CuratedSelection />

          {/* Features + Comment ça marche */}
          <Features />
          <HowItWorks />

          {/* Tendances & activité réelle */}
          <FOMOSection />

          {/* Section créateurs */}
          <CreatorCTA />

          {/* Témoignages + App download */}
          <Testimonials />
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}

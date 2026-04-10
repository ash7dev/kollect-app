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
      <Navbar transparent />
      <main style={{ backgroundColor: 'transparent' }}>
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
          <SocialProof />
          <DropsHype />
          <CuratedSelection />
          <Features />
          <HowItWorks />
          <FOMOSection />
          <CreatorCTA />
          <Testimonials />
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}


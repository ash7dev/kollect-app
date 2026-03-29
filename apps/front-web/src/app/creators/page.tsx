import { Navbar } from '@/components/landing/Navbar';
import { CreatorHero } from '@/components/creators/CreatorHero';
import { CreatorPillars } from '@/components/creators/CreatorPillars';
import { CreatorStats } from '@/components/creators/CreatorStats';
import { CreatorPricing } from '@/components/creators/CreatorPricing';
import { CreatorFeatures } from '@/components/creators/CreatorFeatures';
import { CreatorTestimonials } from '@/components/creators/CreatorTestimonials';
import { CreatorFAQ } from '@/components/creators/CreatorFAQ';
import { CreatorCTA } from '@/components/creators/CreatorCTA';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Devenir Vendeur — Kollect | Plateforme Streetwear Sénégalaise',
  description: 'Rejoins Kollect et vends tes créations auprès de milliers de clients. Infrastructure de drops native, push notifications, analytics. Commission juste.',
};

const CREATORS_CANVAS = '#FFFFFF';

export default function CreatorsPage() {
  return (
    <div
      className="creators-page-root"
      style={{
        minHeight: '100vh',
        backgroundColor: CREATORS_CANVAS,
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <Navbar transparent={false} />
      <main style={{ backgroundColor: 'transparent' }}>
        <CreatorHero />
        <div
          className="creators-sections"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
            backgroundColor: CREATORS_CANVAS,
            padding: '0',
          }}
        >
          <CreatorPillars />
          <CreatorStats />
          <CreatorFeatures />
          <CreatorPricing />
          <CreatorTestimonials />
          <CreatorFAQ />
          <CreatorCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}

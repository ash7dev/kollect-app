import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutMission } from '@/components/about/AboutMission';
import { AboutValues } from '@/components/about/AboutValues';
import { AboutStory } from '@/components/about/AboutStory';
import { AboutCta } from '@/components/about/AboutCta';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'À propos - Kollect',
  description: 'Kollect est la première plateforme dédiée aux créateurs streetwear sénégalais. Découvrez notre histoire, notre mission et nos valeurs.',
};

export default function Page() {
  return (
    <main style={{ fontFamily: FONT_FAMILY_INTER }}>
      <Navbar />
      <AboutHero />
      <AboutMission />
      <AboutStory />
      <AboutValues />
      <AboutCta />
      <Footer />
    </main>
  );
}

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PrivacyContent } from '@/components/legal/PrivacyContent';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: 'Politique de confidentialité - Kollect',
  description: 'Découvrez comment Kollect collecte, utilise et protège vos données personnelles.',
};

export default function Page() {
  return (
    <main style={{ fontFamily: FONT_FAMILY_INTER, backgroundColor: '#fff' }}>
      <Navbar />
      <PrivacyContent />
      <Footer />
    </main>
  );
}

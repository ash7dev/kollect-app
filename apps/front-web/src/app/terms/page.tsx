import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { TermsContent } from '@/components/legal/TermsContent';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export const metadata = {
  title: "Conditions d'utilisation - Kollect",
  description: "Consultez les conditions générales d'utilisation de la plateforme Kollect.",
};

export default function Page() {
  return (
    <main style={{ fontFamily: FONT_FAMILY_INTER, backgroundColor: '#fff' }}>
      <Navbar />
      <TermsContent />
      <Footer />
    </main>
  );
}

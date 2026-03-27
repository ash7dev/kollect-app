import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactSection } from '@/components/contact/ContactSection';

export const metadata = {
  title: 'Contact - Kollect',
  description: 'Une question, un partenariat ou juste envie de nous parler ? On est là.',
};

export default function Page() {
  return (
    <>
      <Navbar />
      <ContactHero />
      <ContactSection />
      <Footer />
    </>
  );
}

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BrandsPageContent } from '@/components/brands/BrandsPageContent';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export default function BrandsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: FONT_FAMILY_INTER }}>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <BrandsPageContent />
      </div>
      <Footer />
    </div>
  );
}

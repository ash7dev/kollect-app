import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BrandsPageContent } from '@/components/brands/BrandsPageContent';

export default function BrandsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <BrandsPageContent />
      </div>
      <Footer />
    </div>
  );
}

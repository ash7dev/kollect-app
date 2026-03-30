import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendre sur Kollect — Lance ta boutique streetwear sénégalaise',
  description:
    'Crée ta boutique sur Kollect en 48h. Vends à 50 000+ acheteurs, organise des drops en édition limitée, encaisse en toute sécurité. Gratuit pour toujours.',
  openGraph: {
    title: 'Deviens créateur sur Kollect — La plateforme streetwear sénégalaise',
    description:
      'Boutique gratuite · Drops exclusifs · Dashboard CEO · Audience locale qualifiée. Lance ta marque en 48h.',
    siteName: 'Kollect',
    locale: 'fr_SN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kollect Creators — Vends tes créations en drops limités',
    description: 'Rejoins les créateurs sénégalais qui vendent déjà sur Kollect.',
  },
  keywords: ['créateur sénégalais', 'boutique streetwear Dakar', 'drop édition limitée', 'vendre vêtements Sénégal', 'marketplace streetwear africain'],
};

export default function BecomeSellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


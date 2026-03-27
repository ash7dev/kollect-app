import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Marques streetwear sénégalaises | Kollect',
    template: '%s | Kollect',
  },
  description:
    'Découvrez les meilleures marques streetwear sénégalaises vérifiées sur Kollect. Vitrines exclusives, collections limitées et créateurs talentueux de la scène locale.',
  keywords: ['marques sénégalaises', 'streetwear Dakar', 'créateurs locaux', 'made in Sénégal', 'fashion sénégalaise'],
  openGraph: {
    title: 'Marques streetwear sénégalaises | Kollect',
    description:
      'Explorez l\'annuaire premium des créateurs et marques streetwear sénégalais sur Kollect. Pièces uniques et collections exclusives.',
    type: 'website',
    locale: 'fr_SN',
    images: [
      {
        url: '/kollect.png',
        width: 1200,
        height: 630,
        alt: 'Marques streetwear sénégalaises - Kollect',
      },
    ],
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

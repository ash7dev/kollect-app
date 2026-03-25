import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marques',
  description:
    'Découvre les marques streetwear vérifiées sur Kollect : vitrines, collections et identité — le meilleur de la scène sénégalaise.',
  openGraph: {
    title: 'Marques | Kollect',
    description:
      'Annuaire premium des créateurs et marques streetwear sénégalais sur Kollect.',
  },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

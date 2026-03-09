import type { Metadata } from 'next';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kollect — Marketplace streetwear premium',
    template: '%s | Kollect',
  },
  description:
    'Marketplace de collections et produits authentiques. Découvrez les dernières drops, collections exclusives et marques streetwear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kollect — Plateforme streetwear sénégalaise',
    template: '%s | Kollect',
  },
  description:
    'Découvrez, collectionnez et portez les créations des meilleurs créateurs streetwear du Sénégal. Drops exclusifs, marques vérifiées, livraison partout.',
  keywords: ['streetwear sénégalais', 'made in Sénégal', 'fashion Dakar', 'créateurs locaux', 'drops exclusifs'],
  authors: [{ name: 'Kollect' }],
  creator: 'Kollect',
  publisher: 'Kollect',
  icons: {
    icon: '/kollect.png',
    shortcut: '/kollect.png',
    apple: '/kollect.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: 'https://kollect.sn',
    siteName: 'Kollect',
    title: 'Kollect — Plateforme streetwear sénégalaise',
    description: 'Découvrez les créations des meilleurs créateurs streetwear du Sénégal. Drops exclusifs et marques vérifiées.',
    images: [
      {
        url: '/kollect.png',
        width: 1200,
        height: 630,
        alt: 'Kollect - Streetwear sénégalais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kollect — Streetwear sénégalais',
    description: 'Les créations des meilleurs créateurs streetwear du Sénégal',
    images: ['/kollect.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

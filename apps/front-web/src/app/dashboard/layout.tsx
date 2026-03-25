import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard CEO | Kollect',
  description: 'Pilotage de votre marque: CA, commandes, produits et performance.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

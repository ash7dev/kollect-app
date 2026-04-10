import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Kollect Super Admin',
  description: 'Portail de gestion globale de la plateforme, utilisateurs, et transactions.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}

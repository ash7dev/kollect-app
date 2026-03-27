'use client';

import { Suspense } from 'react';
import { CommandesPage } from '@/components/dashboard/commandes/CommandesPage';

export default function DashboardCommandesPage() {
  return (
    <Suspense fallback={null}>
      <CommandesPage />
    </Suspense>
  );
}

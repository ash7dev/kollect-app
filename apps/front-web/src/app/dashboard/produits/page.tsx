'use client';

import { Suspense } from 'react';
import { ProduitsPage } from '@/components/dashboard/produits/ProduitsPage';

export default function DashboardProduitsPage() {
  return (
    <Suspense fallback={null}>
      <ProduitsPage />
    </Suspense>
  );
}

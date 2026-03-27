'use client';

import { Suspense } from 'react';
import { AddProductPage } from '@/components/dashboard/produits/AddProductPage';

export default function DashboardAddProductPage() {
  return (
    <Suspense fallback={null}>
      <AddProductPage />
    </Suspense>
  );
}

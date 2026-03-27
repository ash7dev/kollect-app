'use client';

import { Suspense } from 'react';
import { EditProductPage } from '@/components/dashboard/produits/EditProductPage';

export default function DashboardEditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <Suspense fallback={null}>
      <EditProductPage productId={id} />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import { DropsPage } from '@/components/dashboard/drops/DropsPage';

export default function DashboardDropsPage() {
  return (
    <Suspense fallback={null}>
      <DropsPage />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { PromotionsPage } from '@/components/dashboard/promotions/PromotionsPage';

export default function DashboardPromotionsRoute() {
  return (
    <Suspense fallback={null}>
      <PromotionsPage />
    </Suspense>
  );
}

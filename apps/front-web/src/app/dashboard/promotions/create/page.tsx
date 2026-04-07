import { Suspense } from 'react';
import { CreatePromotionForm } from '@/components/dashboard/promotions/CreatePromotionForm';

export default function CreatePromotionRoute() {
  return (
    <Suspense fallback={null}>
      <CreatePromotionForm />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { DropsWizardPage } from '@/components/dashboard/drops/DropsWizardPage';

export default function NewDropPage() {
  return (
    <Suspense>
      <DropsWizardPage />
    </Suspense>
  );
}

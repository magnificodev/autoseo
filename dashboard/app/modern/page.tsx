'use client';

import ModernLayout from '@/components/layout/ModernLayout';
import ModernDashboardPage from '../modern-dashboard/page';

export default function ModernPage() {
  return (
    <ModernLayout>
      <ModernDashboardPage />
    </ModernLayout>
  );
}

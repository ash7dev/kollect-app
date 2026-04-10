import { AdminReviewsTable } from '@/components/admin/AdminReviewsTable';
import { COLORS } from '@/components/admin/AdminIcons';

export default function AdminModerationPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
      <div>
        <h2 style={{ 
          margin: 0, 
          fontSize: 32, 
          fontWeight: 800, 
          color: '#fff', 
          letterSpacing: '-1px' 
        }}>
          Modération des Avis
        </h2>
        <p style={{ 
          margin: '12px 0 0', 
          color: COLORS.textSecondary, 
          fontSize: 15,
          maxWidth: 600,
          lineHeight: 1.6
        }}>
          Préservez l'authenticité et la qualité de la plateforme. Modérez les retours clients, 
          identifiez les avis constructifs et protégez la réputation des marques.
        </p>
      </div>
      <AdminReviewsTable />
    </div>
  );
}

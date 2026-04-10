import { AdminBrandsTable } from '@/components/admin/AdminBrandsTable';
import { COLORS } from '@/components/admin/AdminIcons';

export default function AdminBrandsPage() {
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
          Gestion des Marques
        </h2>
        <p style={{ 
          margin: '12px 0 0', 
          color: COLORS.textSecondary, 
          fontSize: 15,
          maxWidth: 600,
          lineHeight: 1.6
        }}>
          Supervisez l'écosystème des vendeurs Kollect. Gérez les approbations, 
          suivez les performances et assurez l'intégrité de la marketplace.
        </p>
      </div>
      <AdminBrandsTable />
    </div>
  );
}

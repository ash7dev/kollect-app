'use client';

import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';
import { COLORS } from '@/components/admin/AdminIcons';

export default function AdminOrdersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 80 }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 36, 
            fontWeight: 900, 
            color: '#fff', 
            letterSpacing: '-1.5px',
            lineHeight: 1.1
          }}>
            Flux Transactionnels
          </h2>
          <p style={{ 
            margin: '16px 0 0', 
            color: COLORS.textSecondary, 
            fontSize: 16,
            maxWidth: 650,
            lineHeight: 1.7,
            fontWeight: 500
          }}>
            Supervision stratégique des commandes. Analysez les performances de vente, 
            suivez les expéditions et optimisez l'expérience logistique de la plateforme.
          </p>
        </div>
      </div>

      <AdminOrdersTable />
    </div>
  );
}

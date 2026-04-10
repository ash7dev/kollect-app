import { AdminUsersTable } from '@/components/admin/AdminUsersTable';

export default function AdminUsersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Utilisateurs
        </h2>
        <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 500 }}>
          Gérez l'ensemble des clients et utilisateurs de la plateforme.
        </p>
      </div>
      <AdminUsersTable />
    </div>
  );
}

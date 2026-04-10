import { AdminRouteSchema } from '@/components/admin/AdminRouteSchema';

export default function AdminRoutesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111' }}>Schéma des routes admin</h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(0,0,0,0.5)', fontSize: 14 }}>
          Audit visuel des routes exposées, de leur couverture UI et des manques structurels.
        </p>
      </div>
      <AdminRouteSchema />
    </div>
  );
}

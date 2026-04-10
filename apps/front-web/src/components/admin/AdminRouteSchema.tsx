'use client';

const FRONTEND_ROUTES = [
  { path: '/admin', scope: 'Frontend', status: 'Actif', notes: 'Vue globale plateforme' },
  { path: '/admin/users', scope: 'Frontend', status: 'Actif', notes: 'Liste + filtres utilisateurs' },
  { path: '/admin/users/[id]', scope: 'Frontend', status: 'Nouveau', notes: 'Détail d’un utilisateur' },
  { path: '/admin/orders', scope: 'Frontend', status: 'Actif', notes: 'Liste + actions commandes' },
  { path: '/admin/orders/[id]', scope: 'Frontend', status: 'Nouveau', notes: 'Détail d’une commande' },
  { path: '/admin/brands', scope: 'Frontend', status: 'Actif', notes: 'Gestion des marques et vendeurs' },
  { path: '/admin/moderation', scope: 'Frontend', status: 'Actif', notes: 'Modération des avis' },
  { path: '/admin/communications', scope: 'Frontend', status: 'Actif', notes: 'Push globaux / ciblés' },
  { path: '/admin/routes', scope: 'Frontend', status: 'Nouveau', notes: 'Audit et cartographie des routes' },
];

const BACKEND_ROUTES = [
  { path: 'GET /admin/stats', status: 'Exposé', notes: 'KPIs globaux' },
  { path: 'GET /admin/analytics', status: 'Partiel', notes: 'Utilisé par le chart, sans page dédiée' },
  { path: 'GET /admin/users', status: 'Exposé', notes: 'Liste utilisateurs' },
  { path: 'GET /admin/users/:id', status: 'Exposé', notes: 'Détail utilisateur' },
  { path: 'PATCH /admin/users/:id/role', status: 'Partiel', notes: 'API branchée, édition UI limitée' },
  { path: 'PATCH /admin/users/:id/deactivate', status: 'Exposé', notes: 'Action directe dans la table' },
  { path: 'PATCH /admin/users/:id/reactivate', status: 'Exposé', notes: 'Action directe dans la table' },
  { path: 'GET /admin/orders', status: 'Exposé', notes: 'Liste commandes' },
  { path: 'GET /admin/orders/:id', status: 'Exposé', notes: 'Détail commande' },
  { path: 'PATCH /admin/orders/:id/confirm', status: 'Exposé', notes: 'Action directe dans la table' },
  { path: 'PATCH /admin/orders/:id/cancel', status: 'Partiel', notes: 'Pas de UI dédiée au motif' },
  { path: 'GET /admin/reviews', status: 'Exposé', notes: 'Modération avis' },
  { path: 'PATCH /admin/reviews/:id/approve', status: 'Exposé', notes: 'Action table/modale' },
  { path: 'PATCH /admin/reviews/:id/reject', status: 'Partiel', notes: 'Motif encore léger' },
  { path: 'DELETE /admin/reviews/:id', status: 'Exposé', notes: 'Suppression modération' },
  { path: 'GET /admin/brands', status: 'Exposé', notes: 'Liste marques' },
  { path: 'PATCH /admin/brands/:id/verify', status: 'Exposé', notes: 'Validation rapide' },
  { path: 'PATCH /admin/brands/:id/unverify', status: 'Partiel', notes: 'Révocation non centrale dans l’UI' },
  { path: 'DELETE /admin/brands/:id', status: 'Partiel', notes: 'Action backend présente, peu visible' },
  { path: 'POST /admin/notifications/global', status: 'Exposé', notes: 'Communication globale' },
  { path: 'POST /admin/notifications/by-role', status: 'Exposé', notes: 'Communication ciblée' },
  { path: 'GET /admin/export/:type', status: 'Absent UI', notes: 'Backend placeholder, pas de page dédiée' },
  { path: 'GET /admin/reports/activity', status: 'Absent UI', notes: 'Backend placeholder, pas de page dédiée' },
];

const GAPS = [
  'Le backend expose des exports et rapports, mais les réponses sont encore placeholders.',
  'Les routes de détail n’étaient pas branchées depuis les tableaux admin.',
  'La navigation admin ne reflétait pas la cartographie réelle des routes disponibles.',
  'Le module admin concentre beaucoup de logique dans les tables et trop peu dans des vues drill-down.',
];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'Exposé' || status === 'Actif'
      ? '#34C759'
      : status === 'Nouveau'
        ? '#007AFF'
        : status === 'Partiel'
          ? '#FF9500'
          : '#8E8E93';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: '#fff',
        background: color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

function RouteTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ path: string; status: string; notes: string; scope?: string }>;
}) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111' }}>{title}</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Route</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Statut</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.path} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <td style={{ padding: '16px 20px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, color: '#111' }}>
                  {row.path}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <StatusBadge status={row.status} />
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(0,0,0,0.62)' }}>
                  {row.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminRouteSchema() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 20,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #111 0%, #1D1D1F 100%)',
            color: '#fff',
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.48)' }}>
            Audit
          </div>
          <h2 style={{ margin: '8px 0 10px', fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            Cartographie des routes admin
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)' }}>
            Cette vue consolide les routes admin réellement exposées par le frontend et le backend, avec leur niveau de couverture UI.
          </p>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(0,0,0,0.06)',
            padding: 24,
          }}
        >
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111' }}>Lacunes détectées</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GAPS.map((gap) => (
              <div key={gap} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#FF3B30', marginTop: 6, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'rgba(0,0,0,0.65)' }}>{gap}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RouteTable title="Routes Frontend" rows={FRONTEND_ROUTES} />
      <RouteTable title="Routes Backend" rows={BACKEND_ROUTES} />
    </div>
  );
}

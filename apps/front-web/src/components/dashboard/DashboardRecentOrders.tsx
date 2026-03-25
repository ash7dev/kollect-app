'use client';

type OrderStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';

type OrderClient = {
  firstName?: string | null;
  lastName?:  string | null;
  email?:     string | null;
  phone?:     string | null;
};

type Order = {
  id:           string;
  orderNumber?: string | null;
  total:        number;
  status:       string;
  createdAt:    string;
  client?:      OrderClient | null;
};

type Props = {
  orders:    Order[];
  isLoading: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCfa(v: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' CFA';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    if (hours === 0) return 'À l\'instant';
    return `Il y a ${hours}h`;
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  CONFIRMEE:  { label: 'Confirmée',  color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  ANNULEE:    { label: 'Annulée',    color: '#FF3B30', bg: 'rgba(255,59,48,0.1)',  border: 'rgba(255,59,48,0.2)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardRecentOrders({ orders, isLoading }: Props) {
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // display top 5

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <article style={cardStyle}>
        <style>{ANIM}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: 140, height: 13, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'droPulse 1.3s ease-in-out infinite' }} />
            <div style={{ width: 100, height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)', animation: 'droPulse 1.3s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
               <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(0,0,0,0.06)', animation: 'droPulse 1.3s ease-in-out infinite' }} />
               <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                  <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.08)', animation: 'droPulse 1.3s ease-in-out infinite' }} />
                  <div style={{ width: '25%', height: 10, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
               </div>
               <div style={{ width: 60, height: 22, borderRadius: 99, background: 'rgba(0,0,0,0.06)' }} />
            </div>
          ))}
        </div>
      </article>
    );
  }

  // ── Content ───────────────────────────────────────────────────────────────
  return (
    <article style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
            Dernières Commandes
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
            Transactions récentes
          </p>
        </div>
        <button type="button" className="dro-header-btn">
          Voir tout
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
             <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M9 14l2 2 4-4"/></svg>
             </div>
             <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>Aucune commande récente</p>
          </div>
        ) : (
          recentOrders.map((order) => {
            const { label, color, bg, border } = STATUS_CONFIG[order.status] || { label: order.status, color: '#aaa', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.1)' };
            const clientName = order.client
              ? `${order.client.firstName || ''} ${order.client.lastName || ''}`.trim() || 'Client web'
              : 'Client web';
            const initials = clientName.substring(0, 2).toUpperCase();

            return (
              <div key={order.id} className="dro-row">
                {/* Status Accent Line (Hidden by default, shown on hover like linear/stripe) */}
                <div className="dro-accent-bar" style={{ background: color }} />

                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'rgba(0,0,0,0.5)',
                  flexShrink: 0, letterSpacing: '0.4px',
                }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
                      {clientName}
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.3)' }}>
                      #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.45)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: '#111', fontWeight: 700 }}>
                      {fmtCfa(order.total)}
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }} />
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Status Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px 4px 6px',
                  borderRadius: 99,
                  background: bg,
                  border: `1px solid ${border}`,
                  flexShrink: 0,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, position: 'relative' }}>
                    {order.status === 'EN_ATTENTE' && (
                      <div className="dro-ping" style={{ backgroundColor: color }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color, letterSpacing: '0.2px' }}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '24px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
};

const STYLES = `
  .dro-header-btn {
    padding: 6px 14px;
    border-radius: 99px;
    background: transparent;
    border: 1px solid rgba(0,0,0,0.1);
    color: '#111';
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .dro-header-btn:hover {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.2);
  }

  .dro-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
    overflow: hidden;
  }
  .dro-row:hover {
    background: rgba(0,0,0,0.025);
    border-color: rgba(0,0,0,0.05);
    transform: translateX(3px);
  }

  .dro-accent-bar {
    position: absolute;
    left: 0; top: 12px; bottom: 12px;
    width: 3px;
    border-radius: 0 4px 4px 0;
    opacity: 0;
    transform: scaleY(0.5);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dro-row:hover .dro-accent-bar {
    opacity: 1;
    transform: scaleY(1);
  }

  .dro-ping {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    animation: droPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  @keyframes droPing {
    75%, 100% { transform: scale(2.5); opacity: 0; }
  }
`;

const ANIM = `@keyframes droPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

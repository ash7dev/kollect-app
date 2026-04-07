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
  amount:       number;
  status:       string;
  date:         string;
  customer?:    string | null;
};

type Props = {
  orders:    Order[];
  isLoading: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCfa(v: any) {
  const num = Number(v);
  if (isNaN(num) || !isFinite(num)) return '0 CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num)) + ' CFA';
}

function formatDate(iso: string | undefined | null) {
  if (!iso) return 'Date inconnue';
  
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Date invalide';
  
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
    .filter(order => {
      if (!order.date) return false;
      const d = new Date(order.date).getTime();
      return !isNaN(d);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    <article className="dro-card" style={cardStyle}>
      <style dangerouslySetInnerHTML={{ __html: STYLES + ANIM }} />

      {/* Header */}
      <div className="dro-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #FF3B30 0%, #E0321F 100%)' }} />
            Dernières Commandes
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
            Transactions récentes
          </p>
        </div>
        <button 
          type="button" 
          className="dro-header-btn"
          onClick={() => window.location.href = '/dashboard/commandes'}
        >
          Voir tout
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
            <path d="M4 2.5L8 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
             <div style={{ width: 56, height: 56, borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M9 14l2 2 4-4"/></svg>
             </div>
             <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>Aucune commande récente</p>
             <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.3)' }}>Les nouvelles commandes apparaîtront ici</p>
          </div>
        ) : (
          recentOrders.map((order) => {
            const { label, color, bg, border } = STATUS_CONFIG[order.status] || { label: order.status, color: '#aaa', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.1)' };
            const clientName = order.customer || 'Client web';
            const initials = clientName.substring(0, 2).toUpperCase();

            return (
              <div key={order.id} className="dro-row">
                {/* Status Accent Line */}
                <div className="dro-accent-bar" style={{ background: color }} />

                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: 14,
                  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                  border: `2px solid ${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: color,
                  flexShrink: 0, letterSpacing: '0.4px',
                  position: 'relative',
                }}>
                  {initials}
                  {order.status === 'EN_ATTENTE' && (
                    <div className="dro-ping" style={{ backgroundColor: color }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
                      {clientName}
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.35)', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                      #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtCfa(order.amount)}
                    </span>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>
                      {formatDate(order.date)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="dro-status" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px 6px 8px',
                  borderRadius: 12,
                  background: bg,
                  border: `1px solid ${border}`,
                  flexShrink: 0,
                  boxShadow: `0 2px 8px ${color}15`,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, position: 'relative' }}>
                    {order.status === 'EN_ATTENTE' && (
                      <div className="dro-ping" style={{ backgroundColor: color }} />
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.2px' }}>
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
    display: inline-flex;
    align-items: center;
    padding: 10px 18px;
    border-radius: 12px;
    background: linear-gradient(135deg, #FF3B30 0%, #E0321F 100%);
    border: none;
    color: white !important;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(255,59,48,0.25);
    min-height: 36px;
  }
  .dro-header-btn:hover {
    background: linear-gradient(135deg, #E0321F 0%, #CC2D23 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,59,48,0.35);
  }
  .dro-header-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255,59,48,0.25);
  }

  .dro-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.06);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  .dro-row:hover {
    background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 100%);
    border-color: rgba(0,0,0,0.1);
    transform: translateX(4px) translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .dro-accent-bar {
    position: absolute;
    left: 0; top: 16px; bottom: 16px;
    width: 4px;
    border-radius: 0 8px 8px 0;
    opacity: 0;
    transform: scaleY(0.5);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
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

  @media (max-width: 540px) {
    .dro-card   { padding: 14px !important; }
    .dro-row    { padding: 10px 10px; gap: 10px; }
    .dro-status { display: none !important; }
    .dro-header { flex-wrap: wrap; gap: 8px; }
  }
`;

const ANIM = `@keyframes droPulse{0%,100%{opacity:1}50%{opacity:.5}}`;

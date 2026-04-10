'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi, type Order, type GlobalStats } from '@/services/adminApi';
import { 
  COLORS, 
  StoreIcon, 
  TrendingUpIcon, 
  CheckIcon, 
  EyeIcon, 
  FilterIcon,
  UsersIcon,
  ShieldIcon,
  ExternalLinkIcon,
  ClockIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon
} from '@/components/admin/AdminIcons';
import { AdminStatCard } from './AdminStatCard';

const STATUS_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
  CONFIRMEE: { label: 'Confirmée', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
  LIVREE: { label: 'Livrée', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.1)' },
  ANNULEE: { label: 'Annulée', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)' },
};

const PAYMENT_STATUS_CONFIG = {
  EN_ATTENTE: { label: 'Attente', border: 'rgba(255, 255, 255, 0.2)' },
  VALIDEE: { label: 'Payé', border: 'rgba(52, 199, 89, 0.5)' },
  ECHOUEE: { label: 'Échec', border: 'rgba(255, 59, 48, 0.5)' },
  REMBOURSEE: { label: 'Remboursé', border: 'rgba(142, 142, 147, 0.5)' },
  ANNULEE: { label: 'Annulé', border: 'rgba(142, 142, 147, 0.3)' },
};

export function AdminOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | Order['paymentStatus']>('all');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, statsRes] = await Promise.all([
          adminApi.getAllOrders({
            search,
            status: statusFilter === 'all' ? undefined : statusFilter,
            paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
            period: dateRange,
            limit: 50,
          }),
          adminApi.getStats(dateRange === 'all' ? '90days' : dateRange),
        ]);
        
        if (ordersRes.success) setOrders(ordersRes.data.data);
        if (statsRes.success) setStats(statsRes.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [search, statusFilter, paymentFilter, dateRange]);

  const handleStatusChange = async (id: string, action: 'confirm' | 'cancel') => {
    try {
      setActionLoading(id);
      if (action === 'confirm') {
        await adminApi.confirmOrder(id);
      } else {
        await adminApi.cancelOrder(id, 'Annulation par l\'administrateur');
      }
      
      const res = await adminApi.getAllOrders({ period: dateRange, limit: 50 });
      if (res.success) setOrders(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const fmtFcfa = (amount: number) => {
    return `${amount.toLocaleString('fr-SN')} FCFA`;
  };

  if (loading && orders.length === 0) {
    return <div style={{ color: 'rgba(255,255,255,0.4)', padding: '40px', textAlign: 'center' }}>Chargement des flux...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* ── KPIs Dashboard ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20 
      }}>
        <AdminStatCard 
          title="Commandes Totales" 
          value={stats?.total.toString() || '0'} 
          trend={{ value: '12%', isPositive: true }}
          color="#007AFF"
        />
        <AdminStatCard 
          title="Chiffre d'Affaires" 
          value={fmtFcfa(stats?.totalRevenue || 0)} 
          trend={{ value: '8.4%', isPositive: true }}
          color="#34C759"
        />
        <AdminStatCard 
          title="En Attente" 
          value={stats?.pending.toString() || '0'} 
          trend={{ value: '3%', isPositive: false }}
          color="#FF9500"
        />
        <AdminStatCard 
          title="Livrées" 
          value={stats?.delivered.toString() || '0'} 
          color="#5856D6"
        />
      </div>

      {/* ── Filtres & Barre d'outils ── */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        padding: '20px', 
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder="Rechercher une commande, un client..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0 16px',
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          >
            <option value="all">Tous les Statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['7days', '30days', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setDateRange(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dateRange === p ? '#fff' : 'transparent',
                color: dateRange === p ? '#000' : 'rgba(255,255,255,0.6)',
                border: '1px solid',
                borderColor: dateRange === p ? '#fff' : 'rgba(255,255,255,0.1)'
              }}
            >
              {p === '7days' ? 'Semaine' : p === '30days' ? 'Mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste des Commandes (Mode Grille / Vertical) ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 16 
      }}>
        {orders.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            padding: '60px', 
            textAlign: 'center', 
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <ShoppingBagIcon size={48} color="rgba(255,255,255,0.1)" />
            <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.4)' }}>Aucune transaction trouvée</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Header: Statut & Badge Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  padding: '6px 12px', 
                  borderRadius: '30px', 
                  background: STATUS_CONFIG[order.status].bg,
                  color: STATUS_CONFIG[order.status].color,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {STATUS_CONFIG[order.status].label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.5 }}>
                  <ClockIcon size={12} color="#fff" />
                  <span style={{ fontSize: 11, fontWeight: 500 }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Main Content: Info Client & Montant */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginBottom: 4 }}>ID COMMANDE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>#{order.orderNumber}</div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UsersIcon size={18} color={COLORS.primary} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{order.client.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Client Kollect</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon size={18} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{order.brand.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Boutique Partenaire</div>
                  </div>
                </div>
              </div>

              {/* Footer Card: Montant & Actions */}
              <div style={{ 
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.primary }}>{fmtFcfa(order.total)}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{order.itemCount} article(s) • {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <EyeIcon size={18} />
                  </Link>
                  
                  {order.status === 'EN_ATTENTE' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'confirm'); }}
                      disabled={actionLoading === order.id}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: COLORS.primary,
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: actionLoading === order.id ? 0.5 : 1,
                        boxShadow: `0 4px 12px ${COLORS.primary}40`
                      }}
                    >
                      <CheckIcon size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

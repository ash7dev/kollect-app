'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/services/adminApi';
import { 
  COLORS, 
  StoreIcon, 
  TrendingUpIcon, 
  CheckIcon, 
  EyeIcon, 
  UsersIcon,
  ExternalLinkIcon
} from '@/components/admin/AdminIcons';

export default function AdminBrandPerformancePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPerformance();
    }
  }, [id]);

  const fetchPerformance = async () => {
    try {
      const res = await adminApi.getBrandPerformance(id as string);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching brand performance:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString('fr-SN')} FCFA`;
  };

  const fmtDate = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-SN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: COLORS.textSecondary }}>
        <StoreIcon size={48} color={COLORS.danger} />
        <h2 style={{ marginTop: 24, color: '#fff' }}>Marque introuvable</h2>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: COLORS.primary, cursor: 'pointer', fontWeight: 600 }}>
          Retourner à la liste
        </button>
      </div>
    );
  }

  const { brand, sales, engagement, topProducts } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
      {/* Back Button */}
      <div>
        <button 
          onClick={() => router.back()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', 
            padding: '10px 16px', borderRadius: 16, fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          ← Retour aux marques
        </button>
      </div>

      {/* Hero Header */}
      <div style={{ 
        position: 'relative', height: 260, borderRadius: 32, overflow: 'hidden',
        background: brand.coverImage ? `url(${brand.coverImage}) center/cover no-repeat` : 'linear-gradient(135deg, #111 0%, #222 100%)',
        border: `1px solid ${COLORS.border}`
      }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)' 
        }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: 24, background: '#fff', padding: 4,
            border: '4px solid rgba(255,255,255,0.1)', flexShrink: 0
          }}>
             {brand.logo ? (
              <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: COLORS.primary, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: '#fff' }}>
                {brand.name[0]}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>{brand.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Propriétaire: <span style={{ color: '#fff', fontWeight: 700 }}>{brand.owner?.firstName} {brand.owner?.lastName}</span>
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{brand.owner?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          { label: 'Chiffre d\'Affaires', value: formatMoney(sales.revenue), sub: `${sales.ordersCount} ventes`, icon: <TrendingUpIcon size={22} color={COLORS.success} />, bg: COLORS.success },
          { label: 'Commissions (10%)', value: formatMoney(sales.estimatedCommission), sub: 'Potentiel facturable', icon: <CheckIcon size={22} color={COLORS.primary} />, bg: COLORS.primary },
          { label: 'Visibilité', value: engagement.totalProductViews.toLocaleString(), sub: 'Vues produits', icon: <EyeIcon size={22} color={COLORS.secondary} />, bg: COLORS.secondary },
          { label: 'Abonnés', value: brand.followerCount.toLocaleString(), sub: `${brand.sharesCount} partages`, icon: <UsersIcon size={22} color="#A855F7" />, bg: '#A855F7' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: COLORS.cardBg, borderRadius: 28, padding: 28, border: `1px solid ${COLORS.border}`,
            backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ 
              width: 52, height: 52, borderRadius: 16, background: `${stat.bg}15`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 500, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: `${stat.bg}`, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: stat.bg }} />
                {stat.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: COLORS.cardBg, borderRadius: 32, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>Dernières Ventes Récentes</h3>
          <Link href="/admin/orders" style={{ fontSize: 13, color: COLORS.primary, fontWeight: 700, textDecoration: 'none' }}>
            Tout voir →
          </Link>
        </div>
        {!sales.recentOrders?.length ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textSecondary }}>Aucune vente pour le moment.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
             <div style={{ 
               display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr', 
               padding: '0 16px 16px', borderBottom: `1px solid ${COLORS.border}`, 
               color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 
             }}>
              <div>Client</div>
              <div>Montant</div>
              <div>Date</div>
              <div>Statut</div>
              <div style={{ textAlign: 'right' }}>Détails</div>
            </div>
            {sales.recentOrders.map((order: any) => (
              <div key={order.id} style={{ 
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr', 
                padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', 
                alignItems: 'center', fontSize: 14, color: '#fff'
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{order.client?.firstName} {order.client?.lastName}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{order.client?.email}</div>
                </div>
                <div style={{ fontWeight: 800, color: COLORS.primary }}>{formatMoney(order.total)}</div>
                <div style={{ color: COLORS.textSecondary }}>{fmtDate(order.createdAt)}</div>
                <div>
                   <span style={{ 
                     padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, 
                     background: 'rgba(255,255,255,0.05)', color: '#fff',
                     border: `1px solid ${COLORS.border}`
                   }}>
                     {order.status}
                   </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <Link href={`/admin/orders/${order.id}`}>
                     <ExternalLinkIcon size={18} color={COLORS.primary} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products Table */}
      <div style={{ background: COLORS.cardBg, borderRadius: 32, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>Catalogue Performance (Top 10)</h3>
        </div>
        {!topProducts?.length ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textSecondary }}>Aucun produit répertorié.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
             <div style={{ 
               display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', 
               padding: '0 16px 16px', borderBottom: `1px solid ${COLORS.border}`, 
               color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 
             }}>
              <div>Produit</div>
              <div>Prix</div>
              <div>Popularité</div>
              <div style={{ textAlign: 'right' }}>Stock</div>
            </div>
            {topProducts.map((p: any, idx: number) => (
              <div key={p.id} style={{ 
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', 
                alignItems: 'center', fontSize: 14, color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textSecondary }}>#{idx + 1}</span>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatMoney(p.price)}</div>
                <div>
                   <span style={{ 
                     display: 'inline-flex', alignItems: 'center', gap: 6,
                     padding: '6px 12px', borderRadius: 12, background: 'rgba(0,122,255,0.05)', color: '#0A84FF',
                     fontSize: 12, fontWeight: 700, border: '1px solid rgba(0,122,255,0.2)'
                   }}>
                     <EyeIcon size={14} color="#0A84FF" />
                     {p.viewCount} vues
                   </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {p.stock > 10 ? (
                    <span style={{ color: COLORS.success, fontWeight: 700 }}>{p.stock} en stock</span>
                  ) : p.stock > 0 ? (
                    <span style={{ color: COLORS.warning, fontWeight: 700 }}>Alerte: {p.stock} restants</span>
                  ) : (
                    <span style={{ color: COLORS.danger, fontWeight: 700 }}>Rupture</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

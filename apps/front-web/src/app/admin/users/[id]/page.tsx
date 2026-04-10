'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/services/adminApi';
import { 
  COLORS, 
  UsersIcon, 
  StoreIcon, 
  CheckIcon, 
  ShieldIcon, 
  EyeIcon, 
  FilterIcon,
  ExternalLinkIcon
} from '@/components/admin/AdminIcons';

type UserDetail = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  isActive?: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  brand?: {
    id: string;
    name: string;
    slug?: string;
    isVerified?: boolean;
    logo?: string;
    revenue?: number;
    followerCount?: number;
    orderCount?: number;
    receivedOrders?: Array<{
      id: string;
      orderNumber: string;
      total: number;
      status: string;
      createdAt: string;
      client?: { firstName?: string; lastName?: string; email: string };
    }>;
    _count?: {
      followers?: number;
      commandes?: number;
    };
  } | null;
  commandes?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    title?: string | null;
    product?: { name?: string | null } | null;
    createdAt: string;
  }>;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getUserById(params.id);
        setUser(res.data as unknown as UserDetail);
      } catch (error) {
        console.error('Error fetching admin user detail:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) void load();
  }, [params.id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (user.isActive) {
        await adminApi.deactivateUser(user.id);
      } else {
        await adminApi.reactivateUser(user.id);
      }
      setUser({ ...user, isActive: !user.isActive });
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: COLORS.textSecondary }}>
        <UsersIcon size={48} color={COLORS.danger} />
        <h2 style={{ marginTop: 24, color: '#fff' }}>Utilisateur introuvable</h2>
        <Link href="/admin/users" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}>
          Retourner à la liste
        </Link>
      </div>
    );
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email.split('@')[0];

  const fmtDate = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-SN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fmtFcfa = (value?: number) => {
    if (value == null) return '—';
    return `${value.toLocaleString('fr-SN')} FCFA`;
  };

  const isCEO = user.isCEO && user.brand;
  const dataOrders = isCEO ? (user.brand?.receivedOrders || []) : (user.commandes || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button 
            onClick={() => router.back()}
            style={{ 
              width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            ←
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
                {fullName}
              </h2>
              <div style={{ 
                padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, 
                background: user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: user.isActive ? COLORS.success : COLORS.danger,
                border: `1px solid ${user.isActive ? COLORS.success : COLORS.danger}40`,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ 
                  width: 6, height: 6, borderRadius: '50%', 
                  background: user.isActive ? COLORS.success : COLORS.danger,
                  boxShadow: `0 0 8px ${user.isActive ? COLORS.success : COLORS.danger}`
                }} />
                {user.isActive ? 'Compte Actif' : 'Compte Suspendu'}
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: COLORS.textSecondary }}>{user.email}</p>
          </div>
        </div>

        <button 
          onClick={handleToggleStatus}
          disabled={actionLoading}
          style={{ 
            padding: '14px 28px', borderRadius: 16, 
            background: user.isActive ? 'rgba(239,68,68,0.1)' : COLORS.success,
            color: user.isActive ? COLORS.danger : '#fff',
            border: user.isActive ? `1px solid ${COLORS.danger}40` : 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: user.isActive ? 'none' : `0 8px 20px ${COLORS.success}40`
          }}
        >
          {actionLoading ? 'Traitement...' : user.isActive ? 'Suspendre l\'utilisateur' : 'Réactiver l\'utilisateur'}
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          { 
            label: isCEO ? 'Ventes reçues' : 'Commandes', 
            value: isCEO ? (user.brand?._count?.commandes || 0) : (user.commandes?.length || 0), 
            icon: <StoreIcon size={20} color={COLORS.primary} />, bg: COLORS.primary 
          },
          { 
            label: isCEO ? 'Abonnés' : 'Avis donnés', 
            value: isCEO ? (user.brand?._count?.followers || 0) : (user.reviews?.length || 0), 
            icon: isCEO ? <UsersIcon size={20} color={COLORS.secondary} /> : <EyeIcon size={20} color={COLORS.secondary} />, 
            bg: COLORS.secondary 
          },
          { 
            label: isCEO ? 'CA Marque' : 'Dépenses', 
            value: isCEO ? fmtFcfa(user.brand?.revenue) : fmtFcfa(user.commandes?.reduce((acc, o) => acc + o.total, 0)), 
            icon: <CheckIcon size={20} color={COLORS.success} />, 
            bg: COLORS.success 
          },
          { label: 'Rôle principal', value: user.isAdmin ? 'Admin' : user.isCEO ? 'CEO' : 'Client', icon: <ShieldIcon size={20} color={COLORS.warning} />, bg: COLORS.warning }
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: COLORS.cardBg, borderRadius: 24, padding: 24, border: `1px solid ${COLORS.border}`,
            backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 20
          }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 14, background: `${stat.bg}15`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Info Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Identity & Roles */}
        <div style={{ background: COLORS.cardBg, borderRadius: 28, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Profil & Rôles</h3>
            <UsersIcon size={20} color={COLORS.textSecondary} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {user.isAdmin && (
              <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: COLORS.danger, fontSize: 12, fontWeight: 700, border: `1px solid ${COLORS.danger}30` }}>
                Administrateur
              </div>
            )}
            {user.isCEO && (
              <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', color: COLORS.warning, fontSize: 12, fontWeight: 700, border: `1px solid ${COLORS.warning}30` }}>
                Propriétaire de marque (CEO)
              </div>
            )}
            {user.isClient && (
              <div style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(0,122,255,0.1)', color: '#007AFF', fontSize: 12, fontWeight: 700, border: '1px solid rgba(0,122,255,0.3)' }}>
                Client Kollect
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { label: 'Téléphone', value: user.phone || 'Non renseigné' },
              { label: 'ID Utilisateur', value: user.id },
              { label: 'Membre depuis', value: fmtDate(user.createdAt) },
              { label: 'Dernière activité', value: fmtDate(user.lastLoginAt) }
            ].map((info, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 14, color: COLORS.textSecondary }}>{info.label}</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Brand */}
        <div style={{ background: COLORS.cardBg, borderRadius: 28, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Boutique & Marque</h3>
            <StoreIcon size={20} color={COLORS.textSecondary} />
          </div>
          {user.brand ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}`,
                  overflow: 'hidden'
                }}>
                  {user.brand.logo ? (
                    <img src={user.brand.logo} alt={user.brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.primary }}>{user.brand.name[0]}</span>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{user.brand.name}</div>
                    {user.brand.isVerified && <CheckIcon size={18} color={COLORS.success} />}
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>/{user.brand.slug}</div>
                </div>
              </div>
              <div style={{ padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: COLORS.textSecondary }}>Statut de vérification</span>
                  <span style={{ fontSize: 14, color: user.brand.isVerified ? COLORS.success : COLORS.warning, fontWeight: 700 }}>
                    {user.brand.isVerified ? 'Vérifiée' : 'Non vérifiée'}
                  </span>
                </div>
                <Link 
                  href={`/admin/brands/${user.brand.id}`}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none'
                  }}
                >
                  Gérer la boutique <ExternalLinkIcon size={14} color="#fff" />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <StoreIcon size={24} color={COLORS.textSecondary} />
              </div>
              <p style={{ margin: 0, fontSize: 15 }}>Cet utilisateur ne possède pas<br/>de marque Kollect.</p>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Orders Table (Purchases or Sales) */}
      <div style={{ background: COLORS.cardBg, borderRadius: 28, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {isCEO ? 'Dernières Ventes Reçues' : 'Dernières Commandes Effectuées'}
          </h3>
          <FilterIcon size={18} color={COLORS.textSecondary} />
        </div>
        
        {/* On choisit la source de données : commandes perso ou commandes marque */}
        {dataOrders.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textSecondary }}>
            Aucune donnée enregistrée.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr 1fr 0.8fr 0.5fr', padding: '0 16px 16px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
              <div>{isCEO ? 'Client' : 'Numéro'}</div>
              <div>Total</div>
              <div>Date</div>
              <div>Statut</div>
              <div>{isCEO ? 'Commande #' : ''}</div>
              <div style={{ textAlign: 'right' }}>Action</div>
            </div>
            {dataOrders.map((order) => (
              <div key={order.id} style={{ 
                display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr 1fr 0.8fr 0.5fr', 
                padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.03)', 
                alignItems: 'center', fontSize: 14, color: '#fff'
              }}>
                <div style={{ fontWeight: 700 }}>
                  {isCEO ? (order.client?.firstName ? `${order.client.firstName} ${order.client.lastName || ''}` : order.client?.email) : order.orderNumber}
                </div>
                <div style={{ fontWeight: 800, color: COLORS.primary }}>{fmtFcfa(order.total)}</div>
                <div style={{ color: COLORS.textSecondary }}>{fmtDate(order.createdAt)}</div>
                <div>
                   <span style={{ 
                     padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, 
                     background: 'rgba(255,255,255,0.05)', color: COLORS.textSecondary,
                     border: `1px solid ${COLORS.border}`
                   }}>
                     {order.status}
                   </span>
                </div>
                <div style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                  {isCEO ? order.orderNumber : ''}
                </div>
                <div style={{ textAlign: 'right' }}>
                   <Link href={`/admin/orders/${order.id}`} style={{ color: COLORS.primary }}>
                     <EyeIcon size={18} color={COLORS.primary} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section (Only for clients or along with sales for CEOs?) */}
      {(!isCEO || (user.reviews && user.reviews.length > 0)) && (
        <div style={{ background: COLORS.cardBg, borderRadius: 28, padding: 32, border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Avis & Feedbacks</h3>
            <EyeIcon size={20} color={COLORS.textSecondary} />
          </div>
          {!user.reviews?.length ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textSecondary }}>Aucun avis publié.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {user.reviews.map((review) => (
                <div key={review.id} style={{ 
                  padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 12 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: 14 }}>
                          {i < review.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{fmtDate(review.createdAt)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{review.title || 'Avis produit'}</div>
                    <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                      Produit: <span style={{ color: '#fff', fontWeight: 600 }}>{review.product?.name || 'Inconnu'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

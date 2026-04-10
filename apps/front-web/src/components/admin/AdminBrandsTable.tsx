'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, type Brand } from '@/services/adminApi';
import { 
  COLORS, 
  CheckIcon, 
  StoreIcon, 
  EyeIcon, 
  FilterIcon, 
  TrendingUpIcon,
  ExternalLinkIcon,
  SearchIcon,
  UsersIcon
} from '@/components/admin/AdminIcons';
import { AdminStatCard } from './AdminStatCard';

export function AdminBrandsTable() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const [brandsResponse, statsResponse] = await Promise.all([
          adminApi.getBrands({
            search,
            status: statusFilter === 'all' ? undefined : (statusFilter === 'pending' ? 'active' : statusFilter as any),
            limit: 50,
          }),
          adminApi.getStats('30days'),
        ]);
        
        setBrands(brandsResponse.data?.data || []);
        setStats(statsResponse.data?.brands || null);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, [search, statusFilter, verificationFilter]);

  const filteredBrands = brands.filter(brand => {
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && brand.isActive) ||
                         (statusFilter === 'inactive' && !brand.isActive) ||
                         (statusFilter === 'pending' && !brand.isVerified && brand.isActive);
    
    const matchesVerification = verificationFilter === 'all' ||
                               (verificationFilter === 'verified' && brand.isVerified) ||
                               (verificationFilter === 'unverified' && !brand.isVerified);

    return matchesStatus && matchesVerification;
  });

  const getStatusStyle = (brand: Brand) => {
    if (!brand.isActive) return { color: COLORS.danger, label: 'Inactif', bg: 'rgba(239,68,68,0.1)' };
    if (!brand.isVerified) return { color: COLORS.warning, label: 'En attente', bg: 'rgba(245,158,11,0.1)' };
    return { color: COLORS.success, label: 'Vérifiée', bg: 'rgba(16,185,129,0.1)' };
  };

  const fmtFcfa = (amount: number) => {
    return `${amount.toLocaleString('fr-SN')} FCFA`;
  };

  const fmtNum = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (loading && brands.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)', borderTopColor: COLORS.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* KPIs Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <AdminStatCard
            title="Total Marques"
            value={stats.total.toLocaleString()}
            color={COLORS.primary}
            chartData={[10, 15, 12, 18, 22, 20, 25, 28]}
          />
          <AdminStatCard
            title="Boutiques Vérifiées"
            value={stats.verified.toLocaleString()}
            color={COLORS.success}
            chartData={[5, 8, 10, 12, 15, 14, 18, 20]}
          />
          <AdminStatCard
            title="Revenue Global"
            value={fmtFcfa(stats.revenue || 0)}
            color={COLORS.secondary}
            chartData={[20, 35, 28, 45, 50, 42, 60, 75]}
          />
          <AdminStatCard
            title="En attente"
            value={stats.pending.toLocaleString()}
            color={COLORS.warning}
            chartData={[12, 10, 8, 15, 11, 9, 7, 5]}
          />
        </div>
      )}

      {/* Filters Hub */}
      <div style={{ 
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: `1px solid ${COLORS.border}`
      }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 280 }}>
          <input
            type="text"
            placeholder="Rechercher une boutique, un slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 14, outline: 'none'
            }}
          />
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            <SearchIcon size={18} color="#fff" />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{
            padding: '14px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Boutiques Actives</option>
          <option value="inactive">Désactivées</option>
          <option value="pending">En attente d'approbation</option>
        </select>

        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value as any)}
          style={{
            padding: '14px 20px', borderRadius: 16, background: 'rgba(10,132,255,0.05)',
            border: '1px solid rgba(10,132,255,0.1)', color: COLORS.primary, fontSize: 14, outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="all">Tous niveaux</option>
          <option value="verified">Vérifiées uniquement</option>
          <option value="unverified">Non vérifiées</option>
        </select>
      </div>

      {/* Main Table Glassmorphism */}
      <div style={{ 
        background: COLORS.cardBg, borderRadius: 28, overflow: 'hidden', 
        border: `1px solid ${COLORS.border}`, backdropFilter: 'blur(30px)' 
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: `1px solid ${COLORS.border}` }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Boutique</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Propriétaire</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catalogue</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenus</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: COLORS.textSecondary }}>Aucune boutique trouvée.</td></tr>
              ) : filteredBrands.map((brand) => {
                const s = getStatusStyle(brand);
                return (
                  <tr key={brand.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ 
                          width: 48, height: 48, borderRadius: 14, background: '#fff', padding: 2,
                          border: `1px solid ${COLORS.border}`, flexShrink: 0
                        }}>
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: COLORS.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff' }}>
                              {brand.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{brand.name}</div>
                          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>/{brand.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UsersIcon size={14} color={COLORS.textSecondary} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{brand.user?.name || 'Inconnu'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 10, background: s.bg, color: s.color, 
                        fontSize: 11, fontWeight: 800, border: `1px solid ${s.color}30`
                      }}>
                        {brand.isVerified && <CheckIcon size={12} color={s.color} />}
                        {s.label}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{fmtNum(brand.productCount || 0)}</div>
                          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Produits</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{fmtNum(brand.followerCount || 0)}</div>
                          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Abonnés</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.primary }}>{fmtFcfa(brand.revenue || 0)}</div>
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{brand.orderCount || 0} ventes</div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                          onClick={() => router.push(`/admin/brands/${brand.id}`)}
                          style={{
                            width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}`,
                            cursor: 'pointer'
                          }}
                        >
                          <EyeIcon size={16} color={COLORS.primary} />
                        </button>
                        {!brand.isVerified && brand.isActive && (
                          <button
                            onClick={async () => {
                              setActionLoading(brand.id);
                              try { await adminApi.verifyBrand(brand.id, true); window.location.reload(); }
                              catch (e) { console.error(e); } finally { setActionLoading(null); }
                            }}
                            disabled={actionLoading === brand.id}
                            style={{
                              padding: '0 16px', height: 36, borderRadius: 10, border: 'none',
                              background: COLORS.success, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            {actionLoading === brand.id ? '…' : 'Vérifier'}
                          </button>
                        )}
                        <Link href={`/brands/${brand.slug}`} target="_blank" style={{
                           width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                           display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}`
                        }}>
                          <ExternalLinkIcon size={16} color="#fff" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

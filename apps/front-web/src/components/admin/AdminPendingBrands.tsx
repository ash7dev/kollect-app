'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, type Brand } from '@/services/adminApi';
import Link from 'next/link';
import { COLORS, StoreIcon, CheckIcon, EyeIcon } from './AdminIcons';

export function AdminPendingBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // On s'assure de nettoyer les paramètres via adminApi qui utilise cleanQuery
      const res = await adminApi.getBrands({ verification: 'unverified' as any, limit: 10 });
      const brandsArray = res.data?.data || [];
      // On filtre les marques actives mais non vérifiées
      setBrands(brandsArray.filter((b: any) => b.isActive && !b.isVerified).slice(0, 5));
    } catch (err) {
      console.error('Pending Brands Fetch Error:', err);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (brand: Brand) => {
    setActionLoading(brand.id);
    try {
      await adminApi.verifyBrand(brand.id, true);
      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
    } catch (e) {
      console.error('Erreur lors de la vérification:', e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 24,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          Demandes de Vérification
        </h3>
        {!loading && brands.length > 0 && (
          <span style={{
            fontSize: 12, fontWeight: 700, color: COLORS.warning,
            background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: 20,
            border: `1px solid ${COLORS.warning}40`
          }}>
            {brands.length} en attente
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ 
              width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', 
              borderTopColor: COLORS.primary, borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : brands.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <CheckIcon size={32} color={COLORS.success} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500 }}>
              Tout est à jour.<br/>Aucune demande en attente.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {brands.map((brand) => (
              <div
                key={brand.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Logo */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <StoreIcon size={20} color={COLORS.primary} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {brand.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {brand.user?.name || 'Vendeur inconnu'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/admin/brands/${brand.id}`}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <EyeIcon size={16} color="#fff" />
                  </Link>
                  <button
                    onClick={() => handleVerify(brand)}
                    disabled={actionLoading === brand.id}
                    style={{
                      height: 36, padding: '0 16px',
                      background: COLORS.success,
                      color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                    }}
                  >
                    {actionLoading === brand.id ? '...' : <CheckIcon size={14} color="#fff" />}
                    {actionLoading !== brand.id && 'Approuver'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && brands.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            href="/admin/brands"
            style={{ 
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', 
              textDecoration: 'none', transition: 'color 0.2s' 
            }}
             onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
             onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            Voir toutes les demandes →
          </Link>
        </div>
      )}
    </div>
  );
}

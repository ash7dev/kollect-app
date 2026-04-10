'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { COLORS, StoreIcon, TrendingUpIcon } from './AdminIcons';

interface LeaderboardBrand {
  rank: number;
  name: string;
  revenue: number;
  orders: number;
  isHot: boolean;
}

export function AdminGlobalLeaderboard() {
  const [brands, setBrands] = useState<LeaderboardBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getBrands({ sortBy: 'revenue', sortOrder: 'desc', limit: 5 } as any);
        // On récupère les données via res.data.data
        const brandsArray = res.data?.data || [];
        const mapped = brandsArray.slice(0, 5).map((b: any, i: number) => ({
          rank: i + 1,
          name: b.name,
          revenue: b.revenue || 0,
          orders: b.orderCount || 0,
          isHot: i < 2 && (b.revenue || 0) > 0,
        }));
        setBrands(mapped);
      } catch (err) {
        console.error('Leaderboard Fetch Error:', err);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatCurrency = (n: number) => {
    return `${n.toLocaleString('fr-SN')} FCFA`;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUpIcon size={24} color={COLORS.primary} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
            Classement Marques
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ 
              width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', 
              borderTopColor: COLORS.primary, borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : brands.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Aucune donnée de performance.
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: brand.rank === 1 ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: brand.rank === 1 ? COLORS.primary : '#fff',
                border: brand.rank === 1 ? `1px solid ${COLORS.primary}40` : '1px solid transparent'
              }}>
                {brand.rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{brand.name}</span>
                  {brand.isHot && <span title="En forte croissance" style={{ fontSize: 12 }}>🔥</span>}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {brand.orders} commandes
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#' + (brand.rank === 1 ? 'fff' : 'fff') }}>
                  {formatCurrency(brand.revenue)}
                </div>
                <div style={{ fontSize: 11, color: COLORS.success, fontWeight: 600, marginTop: 2 }}>
                  Top {brand.rank === 1 ? '1' : brand.rank}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

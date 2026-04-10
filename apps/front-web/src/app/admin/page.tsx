'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { adminApi, type GlobalStats } from '@/services/adminApi';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminGlobalLeaderboard } from '@/components/admin/AdminGlobalLeaderboard';
import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed';
import { AdminPlatformChart } from '@/components/admin/AdminPlatformChart';
import { AdminPendingBrands } from '@/components/admin/AdminPendingBrands';
import { AdminSystemPreview } from '@/components/admin/AdminSystemPreview';
import { AdminTopProducts } from '@/components/admin/AdminTopProducts';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [prevStats, setPrevStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && (!user || !user.isAdmin)) {
      router.replace('/auth/login');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [curRes, prevRes] = await Promise.all([
          adminApi.getStats('30days'),
          adminApi.getStats('90days'),
        ]);
        setStats(curRes.data);
        setPrevStats(prevRes.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user]);

  if (!isInitialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#040405', fontFamily: FONT_FAMILY_INTER }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#FF3B30', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  const fmt = (val: number | undefined) => {
    if (val === undefined) return '—';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toString();
  };

  const fmtFcfa = (val: number | undefined) => {
    if (val === undefined) return '—';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return `${val} FCFA`;
  };

  const calcTrend = (cur?: number, base?: number): { value: string; isPositive: boolean } | undefined => {
    if (!cur || !base || base === 0) return undefined;
    const pct = Math.round(((cur - base / 3) / (base / 3)) * 100);
    return { value: `${Math.abs(pct)}%`, isPositive: pct >= 0 };
  };

  const revenue = stats?.platform?.revenue ?? stats?.orders?.totalRevenue ?? 0;
  const prevRevenue = prevStats?.platform?.revenue ?? prevStats?.orders?.totalRevenue ?? 0;
  const commission = revenue * 0.1;
  const prevCommission = prevRevenue * 0.1;

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', gap: 32, 
      fontFamily: FONT_FAMILY_INTER,
      background: '#040405', margin: '-32px -24px', padding: '32px 24px', minHeight: 'calc(100vh - 72px)'
    }}>
      {/* ── System Health Widget ── */}
      <AdminSystemPreview />

      {/* ── KPIs Globaux ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Vision Globale — 30 derniers jours</h2>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
            color: '#34C759', background: 'rgba(52, 199, 89, 0.1)', padding: '6px 12px', borderRadius: 20,
          }}>
            <style>{`@keyframes pulse { 0%,100% { transform: scale(0.95); opacity: 0.7; } 70% { transform: scale(1.1); opacity: 1; } }`}</style>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Direct
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <AdminStatCard
            title="Volume d'Affaires"
            value={loading ? '…' : fmtFcfa(revenue)}
            trend={calcTrend(revenue, prevRevenue)}
            color="#FF3B30"
          />
          <AdminStatCard
            title="Commission (10%)"
            value={loading ? '…' : fmtFcfa(commission)}
            trend={calcTrend(commission, prevCommission)}
            color="#0A84FF"
          />
          <AdminStatCard
            title="Utilisateurs Actifs"
            value={loading ? '…' : fmt(stats?.users?.active)}
            trend={calcTrend(stats?.users?.active, prevStats?.users?.active)}
            color="#34C759"
          />
          <AdminStatCard
            title="Commandes Validées"
            value={loading ? '…' : fmt(stats?.orders?.total)}
            trend={calcTrend(stats?.orders?.total, prevStats?.orders?.total)}
            color="#FF9F0A"
          />
        </div>
      </section>

      {/* ── Graphique ── */}
      <AdminPlatformChart />

      {/* ── Top Entités ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <AdminGlobalLeaderboard />
        <AdminTopProducts />
      </section>

      {/* ── Classements & Activité ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Approbations en attente — données réelles */}
          <AdminPendingBrands />
        </div>

        <AdminActivityFeed />
      </section>
    </div>
  );
}

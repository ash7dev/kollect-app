'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type Period = '7days' | '30days' | '90days';

interface DailyStat {
  date: string;
  orders: number;
  revenue: number;
}

interface AnalyticsPayload {
  dailyStats: DailyStat[];
  topBrands: { brandName: string; revenue: number; orders: number }[];
}

export function AdminPlatformChart() {
  const [period, setPeriod] = useState<Period>('7days');
  const [data, setData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [curRes, prevRes] = await Promise.all([
          adminApi.getAnalytics(period),
          adminApi.getAnalytics(period === '7days' ? '30days' : '90days'),
        ]);

        const payload = curRes.data as AnalyticsPayload;
        const prevPayload = prevRes.data as AnalyticsPayload;

        const dateMap: Record<string, DailyStat> = {};
        payload.dailyStats?.forEach((s) => {
          const day = new Date(s.date).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit' });
          if (!dateMap[day]) dateMap[day] = { date: day, orders: 0, revenue: 0 };
          dateMap[day].revenue += s.revenue;
          dateMap[day].orders += s.orders;
        });

        const byDay = Object.values(dateMap).slice(-parseInt(period));
        setData(byDay);

        const cur = byDay.reduce((acc, d) => acc + d.revenue, 0);
        const prev = (prevPayload.dailyStats ?? []).reduce((acc, d) => acc + d.revenue, 0);
        setTotalRevenue(cur);
        setPrevRevenue(prev);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const trend = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : null;
  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.revenue)) : 1;

  const W = 600, H = 200, PAD = 20;
  const pts = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * (W - PAD * 2) + PAD : W / 2;
    const y = H - ((d.revenue / (maxRevenue || 1)) * (H - PAD * 2) + PAD);
    return `${x},${y}`;
  }).join(' ');

  const area = data.length > 0 ? `${PAD},${H} ${pts} ${W - PAD},${H}` : '';

  const formatRevenue = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
    return `${n.toLocaleString('fr-SN')} FCFA`;
  };

  const PERIOD_LABELS: Record<Period, string> = {
    '7days': '7 jours',
    '30days': '30 jours',
    '90days': '90 jours',
  };

  return (
    <div style={{
      background: '#111113', borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      padding: '24px', display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: FONT_FAMILY_INTER
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Volume d'Affaires Plateforme</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Revenus agrégés – {PERIOD_LABELS[period]}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Period selector */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 }}>
            {(['7days', '30days', '90days'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: period === p ? '#fff' : 'transparent',
                  color: period === p ? '#000' : 'rgba(255,255,255,0.5)',
                  boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total & Trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        {!loading && (
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            {formatRevenue(totalRevenue)}
          </div>
        )}
        {!loading && trend !== null && (
          <div style={{ fontSize: 14, fontWeight: 700, color: trend >= 0 ? '#34C759' : '#FF3B30' }}>
            {trend >= 0 ? '+' : ''}{trend}% vs période préc.
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
          <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#FF3B30', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
          Pas de données pour cette période
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: H, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid */}
              {[0.25, 0.5, 0.75, 1].map((p, i) => (
                <line key={i} x1={PAD} y1={H - (p * (H - PAD * 2) + PAD)} x2={W - PAD} y2={H - (p * (H - PAD * 2) + PAD)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              {/* Area fill */}
              {area && <polyline points={area} fill="url(#areaGradient)" />}
              {/* Line */}
              {pts && <polyline points={pts} fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {/* Dots */}
              {data.map((d, i) => {
                const x = data.length > 1 ? (i / (data.length - 1)) * (W - PAD * 2) + PAD : W / 2;
                const y = H - ((d.revenue / (maxRevenue || 1)) * (H - PAD * 2) + PAD);
                return <circle key={i} cx={x} cy={y} r="3.5" fill="#111" stroke="#FF3B30" strokeWidth="2.5" />;
              })}
            </svg>
          </div>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 6px' }}>
            {data.map((d, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                {d.date}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

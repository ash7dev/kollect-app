'use client';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function AdminStatCard({
  title,
  value,
  trend,
  color = '#8E8E93',
  chartData = []
}: {
  title: string;
  value: string;
  trend?: { value: string; isPositive: boolean };
  color?: string;
  chartData?: number[];
}) {
  // Generate random data if none provided to show the mini chart feeling
  const data = chartData.length > 0 ? chartData : Array.from({length: 10}, () => Math.random() * 100);
  const max = Math.max(...data, 1);

  return (
    <div style={{
      background: '#111113',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'border-color 0.2s',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: FONT_FAMILY_INTER
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: -30, right: -30,
        width: 100, height: 100,
        background: color,
        opacity: 0.1,
        filter: 'blur(40px)',
        borderRadius: '50%'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
              {value}
            </span>
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: trend.isPositive ? '#34C759' : '#FF3B30',
                background: trend.isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>depuis le mois passé</span>
            </div>
          )}
        </div>
        
        {/* Mini Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40, marginTop: 4 }}>
          {data.map((val, idx) => {
            const h = (val / max) * 100;
            return (
              <div key={idx} style={{
                width: 6,
                height: `${Math.max(h, 10)}%`,
                background: idx === data.length - 1 ? color : color + '66',
                borderRadius: 3,
                transition: 'height 0.3s ease'
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

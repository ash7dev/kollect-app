'use client';

import React from 'react';

interface CeoStatCardProps {
  label: string;
  value: string | number;
  trendData?: number[];
  color?: string;
  subLabel?: string;
  pulse?: boolean;
}

export function CeoStatCard({ 
  label, 
  value, 
  trendData, 
  color = '#E63329', 
  subLabel, 
  pulse 
}: CeoStatCardProps) {
  // Generate random trend data if none provided for mockup feel
  const data = trendData || Array.from({ length: 8 }, () => 20 + Math.random() * 80);
  const max = Math.max(...data, 1);

  return (
    <div style={{
      flex: 1,
      minWidth: '140px',
      background: 'rgba(0, 0, 0, 0.98)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      e.currentTarget.style.background = 'rgba(10, 10, 10, 1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.98)';
    }}
    >
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header: Label & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 800, 
          letterSpacing: '2px', 
          textTransform: 'uppercase', 
          color: 'rgba(255, 255, 255, 0.4)' 
        }}>
          {label}
        </span>
        {pulse && (
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: '#F59E0B', 
            boxShadow: '0 0 12px #F59E0B',
            animation: 'ceo-pulse 2s infinite' 
          }} />
        )}
      </div>

      {/* Value & Trend Line */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            fontSize: 32, 
            fontWeight: 900, 
            color: '#fff', 
            letterSpacing: '-1.5px', 
            lineHeight: 1 
          }}>
            {value}
          </div>
          {subLabel && (
            <div style={{ 
              fontSize: 12, 
              color: 'rgba(255, 255, 255, 0.3)', 
              marginTop: 6,
              fontWeight: 500
            }}>
              {subLabel}
            </div>
          )}
        </div>

        {/* Mini Bar Chart */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 3, 
          height: 36,
          paddingBottom: 2 
        }}>
          {data.map((val, idx) => {
            const height = (val / max) * 100;
            return (
              <div 
                key={idx}
                style={{
                  width: 4,
                  height: `${height}%`,
                  background: idx === data.length - 1 ? color : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  transition: 'all 0.5s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes ceo-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

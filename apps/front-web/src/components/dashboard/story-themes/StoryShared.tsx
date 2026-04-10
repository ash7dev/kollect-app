'use client';

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoryTheme = 'OVERVIEW' | 'SOLD_OUT' | 'TOP_SELLER' | 'LAST_CHANCE' | 'PRODUCT_LAUNCH' | 'PRODUCT_RESTOCK' | 'PRODUCT_PROMO';

export interface StoryData {
  brandName: string;
  brandSlug: string;
  period: string;
  revenue?: number;
  orders?: number;
  conversionRate?: number;
  views?: number;
  salesHistory?: { value: number }[];
  topProduct?: { name: string; image: string; views: number; price: number; slug: string };
  lowStockProduct?: { name: string; image: string; stock: number; price: number; slug: string };
  product?: { name: string; image: string; price: number; stock: number; slug: string; oldPrice?: number };
}

// ─── Shared Components & Utils ────────────────────────────────────────────────

export const Icons = {
  Success: () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FF3B30" fillOpacity="0.1" />
      <path d="M28 14L17 25L12 20" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Rocket: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.71-2.13l-1.58-1.58s-1.29 0-2.13.71zM15 3s-9 3-9 11c0 2.83 2.17 5 5 5 8 0 11-9 11-9s-2.83-5-7-7zM10 14s.5-1 2-1 2 1 2 1" />
      <path d="M13 10.88c0-1.04.84-1.88 1.88-1.88S16.75 9.84 16.75 10.88 15.91 12.75 14.88 12.75 13 11.91 13 10.88z" />
    </svg>
  ),
  LastChance: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  SoldOut: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12.01" />
    </svg>
  ),
  TopSeller: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c3.37-.4 6-3.26 6-6.66V4H4v4c0 3.4 2.63 6.26 6 6.66z" />
    </svg>
  ),
  Overview: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Tag: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Star: ({ size = 24, fill = "currentColor" }: { size?: number, fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Orders: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Conversion: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Views: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Check: () => <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polyline points="20 6 9 17 4 12"/></svg>
};

export const MiniStat = ({ label, value, color, icon }: { label: string, value: string, color?: string, icon?: React.ReactNode }) => (
  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: color || '#fff', opacity: 0.5, transform: 'scale(1.2)' }}>{icon}</div>
    <div>
      <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, opacity: 0.3, letterSpacing: '3px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '42px', fontWeight: 900, color: color || '#fff' }}>{value}</p>
    </div>
  </div>
);

export const SuccessBarChart = ({ history, color }: { history: { value: number }[], color: string }) => {
  const points = (history || []).slice(-7);
  const max = Math.max(...points.map(p => p.value), 1);
  const width = 600;
  const height = 240;
  const barWidth = (width / points.length) * 0.7;
  const gap = (width / points.length) * 0.3;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={`${color}33`} />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {points.map((p, i) => {
        const barHeight = (p.value / max) * height;
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} opacity="0.1" rx="10" filter="url(#glow)" />
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="url(#barGradient)" rx="10" />
          </g>
        );
      })}
    </svg>
  );
};

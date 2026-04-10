'use client';

import React from 'react';
import { StoryData, Icons, SuccessBarChart, MiniStat } from './StoryShared';

export function ThemeOverview({ data, primaryColor, isRed }: { data: StoryData, primaryColor: string, isRed: boolean }) {
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <h1 style={{ 
        fontSize: '130px', 
        fontWeight: 900, 
        letterSpacing: '-7px', 
        lineHeight: 0.8, 
        marginBottom: '80px', 
        textShadow: isRed ? '0 15px 40px rgba(255,59,48,0.2)' : 'none' 
      }}>
        PRECISION<br/>RECORDS.
      </h1>
      
      <div style={{ marginBottom: '100px' }}>
         <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, letterSpacing: '6px', opacity: 0.4, textTransform: 'uppercase', marginBottom: '15px' }}>
           CA TOTAL RÉALISÉ
         </p>
         <p style={{ margin: 0, fontSize: '110px', fontWeight: 900, color: primaryColor, letterSpacing: '-4px' }}>
           {fmt(data.revenue || 0)} CFA
         </p>
      </div>

      <div style={{ marginBottom: '100px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <SuccessBarChart history={data.salesHistory || []} color={primaryColor} />
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', 
        padding: '50px 40px', background: 'rgba(255,255,255,0.03)', 
        borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)', 
        backdropFilter: 'blur(30px)' 
      }}>
        <MiniStat label="COMMANDES" value={String(data.orders || 0)} icon={<Icons.Orders />} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '120px', margin: 'auto' }} />
        <MiniStat label="CONVERSION" value={`${(data.conversionRate || 0).toFixed(1)}%`} color={primaryColor} icon={<Icons.Conversion />} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '120px', margin: 'auto' }} />
        <MiniStat label="VUES" value={(data.views || 0) > 999 ? `${((data.views || 0) / 1000).toFixed(1)}K` : String(data.views || 0)} icon={<Icons.Views />} />
      </div>
    </div>
  );
}

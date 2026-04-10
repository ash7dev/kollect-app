'use client';

import React from 'react';
import { StoryData, Icons } from './StoryShared';

export function ThemeSoldOut({ data, primaryColor, isRed }: { data: StoryData, primaryColor: string, isRed: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '450px', height: '450px', margin: '0 auto 80px', 
        border: `20px solid ${primaryColor}`, borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        position: 'relative', background: isRed ? 'transparent' : 'rgba(255,255,255,0.05)' 
      }}>
        <div style={{ color: primaryColor, opacity: 0.1, position: 'absolute' }}>
          <Icons.Check />
        </div>
        <span style={{ fontSize: '120px', fontWeight: 900, position: 'relative' }}>100%</span>
        <div style={{ 
          position: 'absolute', inset: -8, borderRadius: '50%', 
          border: `8px solid ${isRed ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)'}`, 
          animation: 'pulse 2s infinite' 
        }} />
      </div>
      
      <h1 style={{ fontSize: '130px', fontWeight: 900, color: primaryColor, letterSpacing: '-8px', lineHeight: 1 }}>
        ALL<br/>SOLD OUT
      </h1>

      <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <p style={{ margin: 0, fontSize: '42px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Le Drop est intégralement épuisé.
        </p>
        <div style={{ 
          width: '500px', height: '10px', background: 'rgba(255,255,255,0.1)', 
          borderRadius: '5px', margin: '20px auto', overflow: 'hidden' 
        }}>
          <div style={{ width: '100%', height: '100%', background: primaryColor }} />
        </div>
        <p style={{ margin: 0, fontSize: '32px', color: primaryColor, fontWeight: 800 }}>
          {data.orders} COMMANDES HONORÉES
        </p>
      </div>
    </div>
  );
}

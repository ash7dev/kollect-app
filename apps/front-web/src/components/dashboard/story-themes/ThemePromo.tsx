'use client';

import React from 'react';
import Image from 'next/image';
import { StoryData, Icons } from './StoryShared';

export function ThemePromo({ data, primaryColor, isRed }: { data: StoryData, primaryColor: string, isRed: boolean }) {
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);
  const product = data.product;

  if (!product) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '20px', 
        padding: '16px 40px', background: '#E63329', color: '#fff', 
        borderRadius: '100px', fontSize: '30px', fontWeight: 900, 
        marginBottom: '20px', letterSpacing: '3px' 
      }}>
        <Icons.Tag /> OFFRE LIMITÉE
      </div>
      
      <h1 style={{ margin: 0, marginTop: '10px', fontSize: '85px', fontWeight: 900, letterSpacing: '-5px', lineHeight: 0.9, marginBottom: '30px' }}>
        PROMO<br/>EXCEPTIELLE.
      </h1>

      <div style={{ position: 'relative', width: '760px', height: '760px', margin: '0 auto' }}>
        <div style={{ 
          position: 'absolute', inset: 0, borderRadius: '50px', overflow: 'hidden', 
          boxShadow: '0 50px 120px rgba(0,0,0,0.7)', border: '4px solid #E63329' 
        }}>
          <img 
            src={product.image} 
            alt={product.name} 
            crossOrigin="anonymous" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <div style={{ 
          position: 'absolute', bottom: '-40px', right: '-40px', background: '#fff', 
          color: '#000', padding: '30px 50px', borderRadius: '24px', fontWeight: 900, 
          fontSize: '42px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
          display: 'flex', flexDirection: 'column', gap: '5px' 
        }}>
          {product.oldPrice && product.oldPrice > product.price && (
            <span style={{ fontSize: '24px', textDecoration: 'line-through', opacity: 0.4 }}>
              {fmt(product.oldPrice)} F
            </span>
          )}
          <span>{fmt(product.price)} F</span>
        </div>
      </div>

      <p style={{ margin: 0, marginTop: '30px', fontSize: '42px', fontWeight: 900, color: '#E63329' }}>
        {product.oldPrice && product.oldPrice > product.price 
          ? `-${Math.round((1 - product.price / product.oldPrice) * 100)}% DE RÉDUCTION` 
          : "PRIX SPÉCIAL RÉDUIT"}
      </p>
    </div>
  );
}

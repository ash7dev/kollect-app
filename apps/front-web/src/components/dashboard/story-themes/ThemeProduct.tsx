'use client';

import React from 'react';
import Image from 'next/image';
import { StoryData, Icons, StoryTheme } from './StoryShared';

interface ThemeProductProps {
  data: StoryData;
  theme: StoryTheme;
  primaryColor: string;
  isRed: boolean;
}

export function ThemeProduct({ data, theme, primaryColor, isRed }: ThemeProductProps) {
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v);

  const globalProduct = theme === 'LAST_CHANCE' ? data.lowStockProduct : data.topProduct;
  const displayProduct = data.product || globalProduct;

  if (!displayProduct) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '20px',
        padding: '16px 40px', background: primaryColor, color: isRed ? '#fff' : '#000',
        borderRadius: '100px', fontSize: '30px', fontWeight: 900,
        marginBottom: '20px', letterSpacing: '3px'
      }}>
        {theme === 'PRODUCT_LAUNCH' && <><Icons.Rocket /> NOUVEAUTÉ</>}
        {theme === 'PRODUCT_RESTOCK' && <><Icons.LastChance /> BACK IN STOCK</>}
        {theme === 'TOP_SELLER' && <><Icons.TopSeller /> TOP SELLER</>}
        {theme === 'LAST_CHANCE' && <><Icons.LastChance /> DERNIÈRE CHANCE</>}
      </div>

      <h1 style={{
        margin: 0,
        fontSize: theme === 'LAST_CHANCE'
          ? '85px'
          : displayProduct.name.length > 30 ? '45px' : displayProduct.name.length > 15 ? '65px' : '85px',
        fontWeight: 900, letterSpacing: '-4px', lineHeight: 0.95,
        marginTop: '10px',
        marginBottom: '30px',
        padding: '0 20px',
        wordWrap: 'break-word',
        maxHeight: '180px',
        overflow: 'hidden'
      }}>
        {theme === 'LAST_CHANCE'
          ? `PLUS QUE ${'stock' in displayProduct ? displayProduct.stock : ''} PIÈCES.`
          : displayProduct.name.toUpperCase()}
      </h1>

      <div style={{ position: 'relative', width: '760px', height: '760px', margin: '0 auto' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50px', overflow: 'hidden',
          boxShadow: '0 50px 120px rgba(0,0,0,0.7)', border: `4px solid ${primaryColor}`
        }}>
          {/* Support both specific product export and UI display */}
          <img
            src={displayProduct.image}
            alt={displayProduct.name}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{
          position: 'absolute', bottom: '-40px', right: '-40px', background: '#fff',
          color: '#000', padding: '30px 50px', borderRadius: '24px', fontWeight: 900,
          fontSize: '42px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          {fmt(displayProduct.price)} F
        </div>
        {theme === 'TOP_SELLER' && (
          <div style={{
            position: 'absolute', top: '40px', right: '40px', width: '130px', height: '130px',
            background: primaryColor, color: isRed ? '#fff' : '#000', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'rotate(15deg)'
          }}>
            <Icons.Star size={60} fill={isRed ? '#fff' : '#000'} />
          </div>
        )}
      </div>

      <p style={{ margin: 0, marginTop: '78px', fontSize: '49px', fontWeight: 700, color: primaryColor, opacity: 0.8 }}>
        {theme === 'PRODUCT_LAUNCH' && "Disponible dès maintenant sur Kollect."}
        {theme === 'PRODUCT_RESTOCK' && "Ne ratez pas votre pièce favorite."}
        {theme === 'LAST_CHANCE' && "Saisissez la vôtre avant la rupture."}
        {theme === 'TOP_SELLER' && `Déjà ${fmt('views' in displayProduct ? displayProduct.views : 0)} vues ce mois-ci.`}
      </p>
    </div>
  );
}

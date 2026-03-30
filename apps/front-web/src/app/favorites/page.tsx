'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FONT_FAMILY_INTER } from '@/styles/typography';

type FavoriteItem = {
  name: string;
  description?: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: FONT_FAMILY_INTER }}>
      <Navbar />
      
      {/* Header */}
      <div style={{
        background: '#0A0A0A',
        padding: '100px 28px 48px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            margin: '0 0 12px', fontSize: 11, fontWeight: 800,
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}>
            Mes favoris
          </p>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 900,
            color: '#fff', letterSpacing: '-1px',
            lineHeight: 1.2,
          }}>
            Favoris
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px' }}>
        {favorites.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '80px 24px', textAlign: 'center', gap: 20,
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: 28,
              background: 'linear-gradient(145deg, #F3F4F6, #E9EAEC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0L2.81 7.89a5.5 5.5 0 0 0 0 7.78l1.06 1.06L12 18.33l7.06-7.06a5.5 5.5 0 0 0 0-7.78z" />
                <path d="M12 2.69l5.66 5.66a.5.5 0 0 1 .71.0L12 20.49l-6.37-6.37a.5.5 0 0 1 .71-.71l6.63-6.63z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 900, margin: '0 0 8px', color: '#0A0A0A', letterSpacing: '-0.4px' }}>
                Aucun favori
              </p>
              <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.42)', margin: 0, lineHeight: 1.65, maxWidth: 260 }}>
                Tes produits favoris apparaîtront ici. Ajoute des articles à tes favoris pour les retrouver facilement.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Ici s'afficheront les favoris quand ils existeront */}
            {favorites.map((favorite, index) => (
              <div key={index} style={{
                background: '#fff',
                borderRadius: 16,
                border: '1.5px solid rgba(0,0,0,0.07)',
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0L2.81 7.89a5.5 5.5 0 0 0 0 7.78l1.06 1.06L12 18.33l7.06-7.06a5.5 5.5 0 0 0 0-7.78z" />
                    <path d="M12 2.69l5.66 5.66a.5.5 0 0 1 .71.0L12 20.49l-6.37-6.37a.5.5 0 0 1 .71-.71l6.63-6.63z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>
                    {favorite.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                    {favorite.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

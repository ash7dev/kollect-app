'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';

const FALLBACK_BRANDS = [
  'Galsen Streetwear',
  'Urban Nomad',
  'Dakar Drifters',
  'S&ampT Collective',
  'Teranga Studio',
  'Lébou Culture',
  'Ndakaaru Lab',
  'Wolof Wave',
  'Safari Club',
  'Laax Créations',
  'Sunu Brand',
  'Drop District',
];

export function SocialProof() {
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await apiClient.get('/brands?isActive=true&isVerified=true');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBrands(res.data.map((b: any) => ({ id: b.id, name: b.name })));
        } else {
          setBrands(FALLBACK_BRANDS.map((name, i) => ({ id: `fallback-${i}`, name })));
        }
      } catch (error) {
        console.error('Failed to fetch verified brands:', error);
        setBrands(FALLBACK_BRANDS.map((name, i) => ({ id: `fallback-${i}`, name })));
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  const displayList = brands.length > 0 ? brands : FALLBACK_BRANDS.map((name, i) => ({ id: `fallback-${i}`, name }));
  // Double the list for seamless infinite scroll (translateX(-50%) needs exactly 2 copies)
  const doubled = [...displayList, ...displayList];

  // We wait for client load to avoid hydration mismatch with complex animations,
  // but if you want SSR, the marquee could be purely CSS.
  if (loading) {
    return (
      <section style={{ padding: '72px 0', backgroundColor: '#fff', minHeight: '260px' }} />
    );
  }

  return (
    <section
      id="brands"
      aria-label="Marques partenaires"
      style={{
        padding: '72px 0',
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div aria-hidden style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: '120px',
        background: 'linear-gradient(to right, #fff, transparent)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: '120px',
        background: 'linear-gradient(to left, #fff, transparent)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 24px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgba(0,0,0,0.35)',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Marques vérifiées sur la plateforme
        </p>
      </div>

      {/* Scrolling strip */}
      <div style={{ overflow: 'hidden' }}>
        <div className="brands-marquee" style={{
          display: 'flex',
          gap: '12px',
          width: 'max-content',
          animation: 'marqueeScroll 28s linear infinite',
        }}>
          {doubled.map((brand, i) => (
            <div key={`${brand.id}-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: '#F8F8F8',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'border-color 200ms ease',
            }}
            className="brand-pill"
            >
              {/* Dot accent */}
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i % 3 === 0 ? '#FF3B30' : i % 3 === 1 ? '#000' : '#FF9500',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#000',
                letterSpacing: '-0.2px',
              }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2nd row — reversed direction */}
      <div style={{ overflow: 'hidden', marginTop: '12px' }}>
        <div className="brands-marquee-reverse" style={{
          display: 'flex',
          gap: '12px',
          width: 'max-content',
          animation: 'marqueeScroll 36s linear infinite reverse',
        }}>
          {[...doubled].reverse().map((brand, i) => (
            <div key={`rev-${brand.id}-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: '#F8F8F8',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i % 2 === 0 ? '#000' : '#FF3B30',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#000',
                letterSpacing: '-0.2px',
              }}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-pill:hover {
          border-color: rgba(0,0,0,0.2) !important;
          background-color: #f0f0f0 !important;
        }
        .brands-marquee:hover, .brands-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

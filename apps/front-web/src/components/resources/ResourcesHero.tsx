'use client';

import { useEffect, useState } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function ResourcesHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section
      style={{
        backgroundColor: '#0a0a0a',
        marginTop: 72,
        padding: '100px 40px 80px',
        borderRadius: '0 0 40px 40px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div aria-hidden style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 420,
        background: 'radial-gradient(ellipse, rgba(194,146,59,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes resHeroUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .res-hero-in { animation: resHeroUp 0.7s ease-out both; }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className={visible ? 'res-hero-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '4px',
            textTransform: 'uppercase', color: '#C2923B', margin: '0 0 20px',
          }}>
            Ressources
          </p>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.95,
            color: '#fff', textTransform: 'uppercase', margin: '0 0 28px',
          }}>
            Tout pour<br />
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>réussir.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.7,
            margin: '0 auto', maxWidth: 520,
          }}>
            Guides, conseils et outils pour les créateurs et acheteurs — tout ce qu&apos;il faut pour tirer le meilleur de la plateforme Kollect.
          </p>
        </div>
      </div>
    </section>
  );
}

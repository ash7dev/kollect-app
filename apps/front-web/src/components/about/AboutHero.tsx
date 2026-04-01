'use client';

import { useEffect, useState } from 'react';

export function AboutHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section style={{
      backgroundColor: '#0a0a0a',
      marginTop: 72,
      padding: '60px 20px 50px',
      borderRadius: '0 0 40px 40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 350,
        background: 'radial-gradient(ellipse, rgba(255,59,48,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes aboutUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .about-in { animation: aboutUp 0.75s ease-out both; }
        @media (max-width: 768px) {
          section { padding: 40px 16px 30px !important; border-radius: 0 0 20px 20px !important; }
          div[aria-hidden] { width: 300px !important; height: 200px !important; }
          p { font-size: 10px !important; letter-spacing: 2px !important; margin-bottom: 16px !important; }
          h1 { font-size: clamp(2rem, 10vw, 4rem) !important; letter-spacing: -2px !important; margin-bottom: 20px !important; }
          .about-description { font-size: clamp(0.9rem, 3vw, 1.1rem) !important; max-width: 100% !important; }
        }
      `}</style>

      <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className={visible ? 'about-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '4px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
          }}>
            Notre histoire
          </p>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            fontWeight: 900,
            letterSpacing: '-4px',
            lineHeight: 0.95,
            color: '#fff',
            textTransform: 'uppercase',
            margin: '0 0 28px',
          }}>
            La mode sénégalaise<br />
            <span style={{ color: '#FF3B30' }}>mérite sa scène.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            maxWidth: 620,
            margin: '0 auto',
          }}
          className="about-description">
            Kollect est la première plateforme dédiée aux créateurs streetwear sénégalais.
            Nous connectons les marques locales avec une communauté qui les comprend.
          </p>
        </div>
      </div>
    </section>
  );
}

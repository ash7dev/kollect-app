'use client';

import { useEffect, useState } from 'react';

export function ContactHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section style={{
      backgroundColor: '#0a0a0a',
      marginTop: 72,
      padding: '100px 40px 80px',
      borderRadius: '0 0 40px 40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,59,48,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes contactUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .contact-in { animation: contactUp 0.7s ease-out both; }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className={visible ? 'contact-in' : ''} style={{ opacity: visible ? 1 : 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '4px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
          }}>
            Contact
          </p>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-3px',
            lineHeight: 0.95,
            color: '#fff',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}>
            On est là.
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Une question, un partenariat, un bug ou juste l&apos;envie de dire bonjour — on répond à tout.
          </p>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

const VALUES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Authenticité',
    body: 'Chaque marque sur Kollect est vérifiée et basée au Sénégal. Pas de répliques, pas d\'impostures — uniquement des créateurs qui vivent leur vision.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    title: 'Communauté',
    body: 'Kollect n\'est pas un simple catalogue. C\'est un espace où acheteurs et créateurs partagent une culture — le streetwear sénégalais sous toutes ses formes.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Exclusivité',
    body: 'Les drops sur Kollect sont limités dans le temps. Ce que tu rates, tu rates. Cette rareté est au cœur de la culture streetwear — et on la respecte.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Créateurs d\'abord',
    body: 'Chaque décision de produit est guidée par une question : est-ce que ça aide les marques à vendre et à grandir ? Les créateurs sont notre priorité absolue.',
  },
];

export function AboutValues() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ backgroundColor: '#0a0a0a', padding: '100px 40px' }}>
      <style>{`
        @keyframes valUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .val-in { animation: valUp 0.6s ease-out both; }
        .about-val-card:hover { border-color: rgba(255,59,48,0.4) !important; transform: translateY(-4px); }
        .about-val-card { transition: border-color 200ms ease, transform 200ms ease; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          className={visible ? 'val-in' : ''}
          style={{ opacity: visible ? 1 : 0, textAlign: 'center', marginBottom: 64 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 16px',
          }}>
            Ce qui nous guide
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '-2.5px',
            color: '#fff',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Nos valeurs
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {VALUES.map((v, i) => (
            <div
              key={i}
              className={`about-val-card${visible ? ' val-in' : ''}`}
              style={{
                opacity: visible ? 1 : 0,
                animationDelay: `${0.1 + i * 0.08}s`,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '36px 32px',
              }}
            >
              <div style={{
                width: 56, height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(255,59,48,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FF3B30',
                marginBottom: 24,
              }}>
                {v.icon}
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#fff',
                margin: '0 0 12px',
                textTransform: 'uppercase',
              }}>
                {v.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

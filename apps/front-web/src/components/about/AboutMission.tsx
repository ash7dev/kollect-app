'use client';

import { useEffect, useRef, useState } from 'react';

export function AboutMission() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding: '60px 20px', backgroundColor: '#fff' }}>
      <style>{`
        @keyframes missionUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mission-in { animation: missionUp 0.7s ease-out both; }
        @media (max-width: 768px) {
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          section { padding: 40px 16px !important; }
          .mission-grid-item { padding: 20px 16px !important; }
          .mission-value { font-size: clamp(1.2rem, 5vw, 2rem) !important; }
          .mission-label { font-size: 10px !important; max-width: 100px !important; }
          .mission-title { font-size: clamp(1.2rem, 4vw, 1.8rem) !important; }
          .mission-text { font-size: 14px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}
        className="about-mission-grid">

        {/* Left : chiffres */}
        <div
          className={visible ? 'mission-in' : ''}
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              { value: '100%', label: 'Marques sénégalaises' },
              { value: '0', label: 'Intermédiaire entre vous et la marque' },
              { value: '∞', label: 'Pièces uniques à découvrir' },
              { value: '1', label: 'Communauté, une culture' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#0a0a0a' : '#FF3B30',
                padding: '30px 24px',
                borderRadius: i === 0 ? '24px 0 0 0' : i === 1 ? '0 24px 0 0' : i === 2 ? '0 0 0 24px' : '0 0 24px 0',
              }}
              className="mission-grid-item">
                <p style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-3px',
                  color: '#fff',
                  margin: '0 0 8px',
                  lineHeight: 1,
                }}
                className="mission-value">
                  {stat.value}
                </p>
                <p style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: 120,
                }}
                className="mission-label">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right : texte */}
        <div
          className={visible ? 'mission-in' : ''}
          style={{ opacity: visible ? 1 : 0, animationDelay: '0.15s' }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
          }}>
            Notre mission
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#0a0a0a',
            margin: '0 0 24px',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}
          className="mission-title">
            Donner au streetwear sénégalais l&apos;infrastructure qu&apos;il mérite.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: '0 0 18px' }}
          className="mission-text">
            Trop longtemps, les créateurs sénégalais ont dû bricoler leur présence en ligne — DMs Instagram, Google Forms, virements manuels. Kollect change ça.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: 0 }}
          className="mission-text">
            Une boutique propre, un système de drops, une communauté qui attend votre prochain lancement. Tout au même endroit.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

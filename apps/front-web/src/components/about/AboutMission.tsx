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
    <section ref={ref} style={{ padding: '100px 40px', backgroundColor: '#fff' }}>
      <style>{`
        @keyframes missionUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mission-in { animation: missionUp 0.7s ease-out both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
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
                padding: '40px 32px',
                borderRadius: i === 0 ? '24px 0 0 0' : i === 1 ? '0 24px 0 0' : i === 2 ? '0 0 0 24px' : '0 0 24px 0',
              }}>
                <p style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  letterSpacing: '-3px',
                  color: '#fff',
                  margin: '0 0 8px',
                  lineHeight: 1,
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: 140,
                }}>
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
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#0a0a0a',
            margin: '0 0 24px',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}>
            Donner au streetwear sénégalais l&apos;infrastructure qu&apos;il mérite.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.55)', lineHeight: 1.8, margin: '0 0 20px' }}>
            Trop longtemps, les créateurs sénégalais ont dû bricoler leur présence en ligne — DMs Instagram, Google Forms, virements manuels. Kollect change ça.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.55)', lineHeight: 1.8, margin: 0 }}>
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

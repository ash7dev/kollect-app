'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const STATS = [
  { value: '500+', label: 'Marques actives', highlight: true },
  { value: '50k+', label: 'Clients qualifiés chaque mois' },
  { value: '$2.5M+', label: 'Volume de transactions annuel' },
  { value: '4.9/5', label: 'Note moyenne des créateurs' },
];

export function CreatorStats() {
  return (
    <section
      style={{
        padding: '80px 24px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '60px',
            lineHeight: 1.2,
          }}
        >
          Rejoins un écosystème dynamique en croissance
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
          }}
        >
          {STATS.map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  fontWeight: 900,
                  marginBottom: '12px',
                  background: stat.highlight ? 'linear-gradient(135deg, #FF3B30, #FF6B6B)' : 'transparent',
                  WebkitBackgroundClip: stat.highlight ? 'text' : 'unset',
                  WebkitTextFillColor: stat.highlight ? 'transparent' : 'unset',
                }}
              >
                {stat.value}
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

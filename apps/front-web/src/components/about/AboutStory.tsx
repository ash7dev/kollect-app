'use client';

import { useEffect, useRef, useState } from 'react';

const TIMELINE = [
  {
    year: '2024',
    title: 'Le constat',
    body: 'Des créateurs incroyables, mais aucune infrastructure. Les ventes se faisaient en DM, les drops s\'annonçaient sur des stories qui disparaissent. On a décidé de changer ça.',
  },
  {
    year: '2025',
    title: 'La construction',
    body: 'On a passé des mois à écouter les marques sénégalaises — leurs frustrations, leurs rêves, leur façon de travailler. Kollect est né de ces conversations.',
  },
  {
    year: '2026',
    title: 'Le lancement',
    body: 'Les premières marques rejoignent la plateforme. Les premiers drops, les premières communautés de fans. Le mouvement commence.',
  },
  {
    year: 'Demain',
    title: 'L\'expansion',
    body: 'Kollect ne s\'arrête pas au Sénégal. La culture streetwear sénégalaise a vocation à rayonner sur tout le continent et au-delà.',
    accent: true,
  },
];

export function AboutStory() {
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
    <section ref={ref} style={{ backgroundColor: '#fff', padding: '100px 40px' }}>
      <style>{`
        @keyframes storyUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .story-in { animation: storyUp 0.65s ease-out both; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'flex-start' }}
          className="about-story-grid">

          {/* Left : label fixe */}
          <div
            className={visible ? 'story-in' : ''}
            style={{ opacity: visible ? 1 : 0, position: 'sticky', top: 120 }}
          >
            <p style={{
              fontSize: 11, fontWeight: 900, letterSpacing: '3px',
              textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 20px',
            }}>
              Notre parcours
            </p>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-2px',
              color: '#0a0a0a',
              margin: '0 0 24px',
              textTransform: 'uppercase',
              lineHeight: 1.05,
            }}>
              De l&apos;idée<br />à la plateforme.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, margin: 0 }}>
              Kollect n&apos;est pas une startup tech qui a découvert le Sénégal depuis un bureau à San Francisco. On est de là. On connaît les créateurs, on porte leurs pièces.
            </p>
          </div>

          {/* Right : timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className={visible ? 'story-in' : ''}
                style={{
                  opacity: visible ? 1 : 0,
                  animationDelay: `${0.1 + i * 0.12}s`,
                  display: 'flex', gap: 32,
                  paddingBottom: i < TIMELINE.length - 1 ? 48 : 0,
                  borderBottom: i < TIMELINE.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                  marginBottom: i < TIMELINE.length - 1 ? 48 : 0,
                }}
              >
                {/* Year badge */}
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 999,
                    backgroundColor: item.accent ? '#FF3B30' : '#0a0a0a',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '1px',
                  }}>
                    {item.year}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: '-0.5px',
                    color: '#0a0a0a',
                    margin: '0 0 10px',
                    textTransform: 'uppercase',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: 15,
                    color: 'rgba(0,0,0,0.55)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-story-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

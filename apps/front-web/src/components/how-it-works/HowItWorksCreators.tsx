'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const CREATOR_STEPS = [
  {
    number: '01',
    color: '#FF3B30',
    title: 'Crée ton compte marque',
    description: 'Inscris-toi gratuitement. En 48h, ta boutique dédiée est en ligne avec ta charte visuelle, tes collections et ton calendrier de drops.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
  },
  {
    number: '02',
    color: '#C2923B',
    title: 'Configure ton drop',
    description: 'Upload tes pièces, définis ta fenêtre de vente, active le teasing. La communauté reçoit une notification push dès l\'ouverture.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    number: '03',
    color: '#34C759',
    title: 'Encaisse & pilote',
    description: 'Tes ventes sont centralisées dans le dashboard. Gère les commandes, suis tes stats et décide du prochain drop avec les données réelles.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
  },
];

const PERKS = [
  { label: '0 FCFA', sub: 'pour ouvrir' },
  { label: '48h', sub: 'mise en ligne' },
  { label: '500+', sub: 'marques actives' },
];

export function HowItWorksCreators() {
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
    <section
      ref={ref}
      style={{
        backgroundColor: '#0a0a0a',
        padding: '100px 40px',
        margin: '0 12px',
        borderRadius: 40,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* BG glows */}
      <div aria-hidden style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,59,48,0.09) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-80px', left: '-60px',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(194,146,59,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes hiwCreatorUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hiw-creator-in { animation: hiwCreatorUp 0.65s ease-out both; }
        .hiw-creator-card:hover {
          border-color: rgba(255,59,48,0.25) !important;
          transform: translateY(-4px) !important;
        }
        .hiw-creator-card { transition: all 250ms ease; }
        .hiw-creator-cta:hover {
          background: linear-gradient(135deg, #e0342a, #b07a28) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(255,59,48,0.45) !important;
        }
        .hiw-creator-cta { transition: all 220ms ease; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          className={visible ? 'hiw-creator-in' : ''}
          style={{ opacity: visible ? 1 : 0, maxWidth: 580, marginBottom: 72 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#C2923B', margin: '0 0 16px',
          }}>
            Pour les créateurs
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: '#fff',
            margin: '0 0 16px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}>
            Lance ta boutique.<br />
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>Sans friction.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
            Un espace à toi — charte, collections, calendrier des lancements — tout en profitant de l&apos;audience et de la confiance du portail Kollect.
          </p>
        </div>

        {/* Stats bar */}
        <div
          className={visible ? 'hiw-creator-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.1s',
            display: 'flex',
            gap: 1,
            marginBottom: 48,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            overflow: 'hidden',
            width: 'fit-content',
          }}
        >
          {PERKS.map((p, i) => (
            <div key={p.label} style={{
              padding: '20px 36px',
              borderRight: i < PERKS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                {p.label}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.3px' }}>
                {p.sub}
              </span>
            </div>
          ))}
        </div>

        {/* Creator steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
          className="hiw-creator-grid"
        >
          {CREATOR_STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`hiw-creator-card${visible ? ' hiw-creator-in' : ''}`}
              style={{
                opacity: visible ? 1 : 0,
                animationDelay: `${0.2 + i * 0.12}s`,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1.5px solid rgba(255,255,255,0.07)',
                borderRadius: 24,
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Watermark */}
              <div aria-hidden style={{
                position: 'absolute', bottom: -20, right: -4,
                fontSize: 120, fontWeight: 900, color: 'rgba(255,255,255,0.025)',
                letterSpacing: -6, lineHeight: 1, userSelect: 'none',
              }}>
                {step.number}
              </div>

              <span style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: step.color,
              }}>
                Étape {step.number}
              </span>

              <div style={{
                width: 60, height: 60, borderRadius: 18,
                backgroundColor: `${step.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.color,
              }}>
                {step.icon}
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.15rem', fontWeight: 900,
                  color: '#fff', letterSpacing: '-0.5px',
                  lineHeight: 1.25, margin: '0 0 10px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 14, lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.4)', margin: 0,
                }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={visible ? 'hiw-creator-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.56s',
            marginTop: 48,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Link
            href="/become-seller"
            className="hiw-creator-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg, #FF3B30, #C2923B)',
              color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(255,59,48,0.25)',
            }}
          >
            Rejoindre en tant que marque
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '14px 24px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600, textDecoration: 'none',
              transition: 'all 200ms ease',
            }}
            className="hiw-ghost-btn"
          >
            Des questions ?
          </Link>
        </div>
      </div>

      <style>{`
        .hiw-ghost-btn:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.28) !important;
        }
        @media (max-width: 900px) {
          .hiw-creator-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

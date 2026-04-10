'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

const BUYER_STEPS = [
  {
    number: '01',
    color: '#FF3B30',
    title: 'Explore & Découvre',
    description: 'Parcours les drops exclusifs, les collections de marques vérifiées et les nouveautés streetwear sénégalaises.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    tags: ['Collections', 'Drops', 'Marques'],
  },
  {
    number: '02',
    color: '#000',
    title: 'Commande en sécurité',
    description: 'Passe ta commande en quelques secondes. Paiement crypté, confirmation immédiate, transmis directement au créateur.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    tags: ['Paiement sécurisé', 'Confirmation instant'],
  },
  {
    number: '03',
    color: '#FF9500',
    title: 'Reçois ta commande',
    description: 'Livraison express partout au Sénégal. Emballage soigné, suivi en temps réel depuis l\'app.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    tags: ['Livraison express', 'Suivi temps réel'],
  },
];

export function HowItWorksSteps() {
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
        backgroundColor: '#fff',
        padding: '100px 40px',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <style>{`
        @keyframes hiwStepUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hiw-step-in { animation: hiwStepUp 0.65s ease-out both; }
        .hiw-step-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 28px 60px rgba(0,0,0,0.09) !important;
        }
        .hiw-step-card { transition: transform 250ms ease, box-shadow 250ms ease; }
        .hiw-step-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.03);
          font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.45);
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div
          className={visible ? 'hiw-step-in' : ''}
          style={{ opacity: visible ? 1 : 0, maxWidth: 540, marginBottom: 72 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#FF3B30', margin: '0 0 16px',
          }}>
            Pour les acheteurs
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: '#0a0a0a',
            margin: '0 0 16px',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}>
            3 étapes.<br />
            <span style={{ color: 'rgba(0,0,0,0.28)' }}>C&apos;est tout.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.45)', lineHeight: 1.7, margin: 0 }}>
            De la découverte du drop jusqu&apos;à la réception de ta commande, Kollect s&apos;occupe de tout.
          </p>
        </div>

        {/* Steps grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
          className="hiw-steps-grid"
        >
          {BUYER_STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`hiw-step-card${visible ? ' hiw-step-in' : ''}`}
              style={{
                opacity: visible ? 1 : 0,
                animationDelay: `${0.1 + i * 0.12}s`,
                backgroundColor: '#FAFAFA',
                border: '1.5px solid rgba(0,0,0,0.06)',
                borderRadius: 24,
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Watermark number */}
              <div aria-hidden style={{
                position: 'absolute',
                bottom: -24,
                right: -8,
                fontSize: 140,
                fontWeight: 900,
                color: 'rgba(0,0,0,0.03)',
                letterSpacing: -8,
                lineHeight: 1,
                userSelect: 'none',
              }}>
                {step.number}
              </div>

              {/* Step label */}
              <span style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: step.color,
              }}>
                Étape {step.number}
              </span>

              {/* Icon */}
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                backgroundColor: step.color === '#000'
                  ? '#000'
                  : step.color === '#FF9500'
                  ? 'rgba(255,149,0,0.08)'
                  : 'rgba(255,59,48,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.color === '#000' ? '#fff' : step.color,
              }}>
                {step.icon}
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.2rem', fontWeight: 900,
                  color: '#0a0a0a', letterSpacing: '-0.5px',
                  lineHeight: 1.25, margin: '0 0 10px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 14, lineHeight: 1.75,
                  color: 'rgba(0,0,0,0.48)', margin: 0,
                }}>
                  {step.description}
                </p>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                {step.tags.map(tag => (
                  <span key={tag} className="hiw-step-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={visible ? 'hiw-step-in' : ''}
          style={{
            opacity: visible ? 1 : 0,
            animationDelay: '0.5s',
            marginTop: 48,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/explorer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 14,
              backgroundColor: '#FF3B30', color: '#fff',
              fontSize: 15, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(255,59,48,0.3)',
              transition: 'all 220ms ease',
            }}
            className="hiw-cta-btn"
          >
            Explorer les drops
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        .hiw-cta-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(255,59,48,0.45) !important;
          background-color: #e0342a !important;
        }
        @media (max-width: 900px) {
          .hiw-steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hiw-steps-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
      `}</style>
    </section>
  );
}

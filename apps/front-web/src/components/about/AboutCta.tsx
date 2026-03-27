'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function AboutCta() {
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
    <section ref={ref} style={{ backgroundColor: '#0a0a0a', padding: '100px 40px' }}>
      <style>{`
        @keyframes ctaUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cta-in { animation: ctaUp 0.7s ease-out both; }
        .about-cta-btn-primary:hover { background: #e0352b !important; }
        .about-cta-btn-secondary:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.3) !important; }
        .about-cta-btn-primary, .about-cta-btn-secondary { transition: all 200ms ease; }
      `}</style>

      <div
        className={visible ? 'cta-in' : ''}
        style={{
          opacity: visible ? 1 : 0,
          maxWidth: 760,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Accent line */}
        <div style={{
          width: 40, height: 3,
          backgroundColor: '#FF3B30',
          borderRadius: 2,
          margin: '0 auto 32px',
        }} />

        <h2 style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-3px',
          color: '#fff',
          margin: '0 0 20px',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Tu crées. On s&apos;occupe du reste.
        </h2>

        <p style={{
          fontSize: 17,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7,
          margin: '0 0 48px',
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Rejoins les marques qui ont déjà choisi Kollect pour vendre, lancer des drops et construire leur communauté.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/onboarding"
            className="about-cta-btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px',
              backgroundColor: '#FF3B30',
              color: '#fff',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.5px',
            }}
          >
            Rejoindre en tant que marque
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          <Link
            href="/explorer"
            className="about-cta-btn-secondary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px',
              backgroundColor: 'transparent',
              color: '#fff',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 700,
              border: '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            Explorer la plateforme
          </Link>
        </div>

        {/* Social proof */}
        <p style={{
          marginTop: 40,
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
          fontWeight: 600,
          letterSpacing: '1px',
        }}>
          Gratuit pour commencer · Aucune commission sur les 3 premiers drops
        </p>
      </div>
    </section>
  );
}

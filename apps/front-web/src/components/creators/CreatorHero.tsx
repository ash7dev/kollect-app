'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

export function CreatorHero() {
  return (
    <section
      style={{
        padding: '80px 24px 120px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,59,48,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: '9999px',
            marginBottom: '32px',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#FF6B6B', margin: 0 }}>
            Pour les Créateurs & Marques
          </p>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}
        >
          La Ferrari de l&apos;infrastructure
          <br />
          <span style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            streetwear au Sénégal
          </span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}
        >
          Transforme ta communauté Instagram/TikTok en ventes explosives. Drops natives, push notifications 100%, analytics B2B. Vends smart, gagne plus.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/become-seller"
            style={{
              padding: '16px 32px',
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 300ms ease-in-out',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#CC0000')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF3B30')}
          >
            Rejoindre maintenant
          </a>
          <a
            href="/contact"
            style={{
              padding: '16px 32px',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'all 300ms ease-in-out',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Parler à l&apos;équipe
          </a>
        </div>

        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '40px',
            letterSpacing: '0.5px',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '16px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Gratuit à tester
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '16px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Pas de carte bancaire
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Onboarding 5 min
          </span>
        </p>
      </div>
    </section>
  );
}

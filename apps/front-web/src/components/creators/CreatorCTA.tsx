'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

export function CreatorCTA() {
  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '24px',
            lineHeight: 1.2,
          }}
        >
          Prêt à transformer la hype en ventes explosives?
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}
        >
          Rejoins les 50+ marques Sénégalaises qui ont déjà +300% de croissance sur Kollect. Pas de risque, pas d&apos;engagement, juste des résultats.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/auth/register"
            style={{
              padding: '16px 40px',
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 300ms ease-in-out',
              display: 'inline-block',
              boxShadow: '0 4px 16px rgba(255,59,48,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#CC0000';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,59,48,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF3B30';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,59,48,0.3)';
            }}
          >
            Rejoindre Kollect
          </a>

          <a
            href="/contact"
            style={{
              padding: '16px 40px',
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              border: '2px solid #FFFFFF',
              cursor: 'pointer',
              transition: 'all 300ms ease-in-out',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Parler à l&apos;équipe
          </a>
        </div>

        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '32px',
            marginBottom: 0,
          }}
        >
          ✓ Onboarding en 48h • ✓ Support 24/7 • ✓ Zéro setup fee
        </p>
      </div>
    </section>
  );
}

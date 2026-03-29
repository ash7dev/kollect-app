'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const PILLARS = [
  {
    number: '1',
    title: 'Network Effect',
    subtitle: 'Découverte croisée',
    description: 'Sur Shopify tu es seul sur une île. Sur Kollect, tu bénéficies du trafic généré par les 500+ marques du catalogue. Tes clients acheteurs découvrent aussi les autres marques.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <circle cx="6" cy="8" r="2" fill="currentColor" opacity="0.6"/>
        <circle cx="18" cy="8" r="2" fill="currentColor" opacity="0.6"/>
        <circle cx="6" cy="16" r="2" fill="currentColor" opacity="0.6"/>
        <circle cx="18" cy="16" r="2" fill="currentColor" opacity="0.6"/>
        <path d="M12 9L6 8M12 9L18 8M12 15L6 16M12 15L18 16" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    number: '2',
    title: 'Infrastructure Drop',
    subtitle: 'TEASER → LIVE → SOLD OUT',
    description: 'Gère l&apos;urgence nativement. Statuts de collection en temps réel, comptes à rebours précis, gestion stricte des stocks. Bye WhatsApp, bye frustrations clients.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Push Notifications',
    subtitle: '100% vs Email 15%',
    description: 'Fais vibrer les téléphones de 100% de tes fans à la seconde exacte du lancement. Shopify envoie des emails (15% d&apos;ouverture). Instagram masque les posts (5% de portée). Nous on délivre.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 18v2a2 2 0 002 2h4a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '4',
    title: 'Analytics B2B',
    subtitle: 'Data inestimable',
    description: 'Trackage complet: vues, favoris, partages, conversion. Insights sur tes buyers, patterns de vente. Décide ton prochain drop avec lucidité, pas à l&apos;aveugle.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="12" width="4" height="8" rx="1" fill="currentColor"/>
        <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor"/>
        <rect x="17" y="4" width="4" height="16" rx="1" fill="currentColor"/>
        <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function CreatorPillars() {
  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#FFFFFF',
        fontFamily: FONT_FAMILY_INTER,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF3B30',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            Les 4 Piliers
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Pourquoi Kollect vs Shopify + WhatsApp?
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#4D4D4D',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Quatre avantages incomparables qui font de Kollect l&apos;infrastructure ultime pour transformer ta hype en ventes.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              style={{
                padding: '40px',
                backgroundColor: '#F8F8F8',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 300ms ease-in-out',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFF';
                e.currentTarget.style.borderColor = 'rgba(255,59,48,0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F8F8';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pillar.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#FF3B30' }}>
                    {pillar.number}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {pillar.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#FF3B30',
                    fontWeight: 600,
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {pillar.subtitle}
                </p>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: '#4D4D4D',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

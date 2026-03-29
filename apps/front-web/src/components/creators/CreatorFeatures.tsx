'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const FEATURES = [
  {
    title: 'Dashboard pro',
    description: 'Vue complète de tes ventes, passages clients, produits les plus vus, conversion rates. Prends des décisions basées sur la data.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 9h18M3 15h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
        <rect x="12" y="12" width="6" height="6" fill="currentColor" opacity="0.8"/>
        <rect x="5" y="5" width="3" height="3" fill="currentColor" opacity="0.6"/>
        <rect x="5" y="10" width="3" height="3" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    title: 'Gestion de Drops',
    description: 'Crée des collections avec statuts TEASER, LIVE, SOLD OUT. Comptes à rebours, gestion stricte des stocks en temps réel.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <path d="M7 20h10M7 22h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Push Notifications',
    description: 'Alertes instantanées à 100% de tes followers. Lances une collection et vibre les 1000 phones au même moment.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 18v2a2 2 0 002 2h4a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Paiements sécurisés',
    description: 'Apple Pay, Wave, cartes bancaires. Clients paient sans friction. Toi tu reçois l&apos;argent en H+24.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 10h18M7 14h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="17" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: 'Livraison intégrée',
    description: 'Partenariats avec les meilleurs courriers du Sénégal (DHL, Dakar Logistics, etc). Tracking automatique.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 7h14l-1 10H6L5 7z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M3 7h18M8 21h8M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="8" cy="16" r="1" fill="currentColor"/>
        <circle cx="16" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: 'Support prioritaire',
    description: 'Équipe dédiée 24/7 sur WhatsApp, email, chat. On te répond en max 2h pour les urgences.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="9" cy="10" r="1" fill="currentColor"/>
        <circle cx="12" cy="10" r="1" fill="currentColor"/>
        <circle cx="15" cy="10" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

export function CreatorFeatures() {
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
            Toolbox Complète
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Tout ce dont tu as besoin pour vendre
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
          }}
        >
          {FEATURES.map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '20px' }}>
              <div
                style={{
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF3B30',
                }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#4D4D4D',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

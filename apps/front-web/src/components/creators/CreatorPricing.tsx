'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    description: 'Parfait pour débuter',
    features: [
      '✓ 1 collection active',
      '✓ Dashboard basique',
      '✓ Push notifications',
      '✓ Support email',
      '✗ Dropbox API',
      '✗ Advanced analytics',
    ],
    commission: '8%',
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Gratuit',
    description: 'Le plus populaire',
    features: [
      '✓ Collections illimitées',
      '✓ Dashboard complet',
      '✓ Push notifications',
      '✓ Support prioritaire',
      '✓ Dropbox API',
      '✓ Advanced analytics',
    ],
    commission: '5%',
    cta: 'Rejoin le Pro tier',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    description: 'Pour les gros volumes',
    features: [
      '✓ Tout du Pro',
      '✓ Commission négociable',
      '✓ Paiements hebdo',
      '✓ Manager dédié',
      '✓ Features custom',
      '✓ SLA 99.9%',
    ],
    commission: 'Custom',
    cta: 'Parler à l&apos;équipe',
    highlight: false,
  },
];

export function CreatorPricing() {
  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#F8F8F8',
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
            Pricing Simple
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Une commission juste, c&apos;est notre promesse
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
            Pas de frais cachés. Pas de setup fee. Tu gardes 92-95% de chaque vente. C&apos;est nous qui prenons le risque infra.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              style={{
                padding: '40px',
                backgroundColor: plan.highlight ? '#000000' : '#FFFFFF',
                color: plan.highlight ? '#FFFFFF' : '#000000',
                borderRadius: 'var(--radius-lg)',
                border: plan.highlight ? '2px solid #FF3B30' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative',
                transform: plan.highlight ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FF3B30',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  POPULAIRE
                </div>
              )}

              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    margin: '0 0 4px 0',
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#4D4D4D',
                    margin: 0,
                  }}
                >
                  {plan.description}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: 900,
                    margin: '0 0 4px 0',
                  }}
                >
                  {plan.price}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: plan.highlight ? '#FF6B6B' : '#FF3B30',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Commission: {plan.commission}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {plan.features.map((feature, fidx) => (
                  <p
                    key={fidx}
                    style={{
                      fontSize: '13px',
                      margin: 0,
                      color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#4D4D4D',
                    }}
                  >
                    {feature}
                  </p>
                ))}
              </div>

              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: plan.highlight ? '#FF3B30' : '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 300ms ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

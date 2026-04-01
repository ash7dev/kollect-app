'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const IconSearch = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconBag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconTruck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const STEPS = [
  {
    number: '01',
    icon: <IconSearch />,
    title: 'Explore & Découvre',
    description: 'Parcours des centaines de créations de marques sénégalaises vérifiées. Filtre par style, taille, marque ou prix. Sauvegarde tes coups de cœur.',
    color: '#FF3B30',
  },
  {
    number: '02',
    icon: <IconBag />,
    title: 'Commande en toute sécurité',
    description: 'Passe ta commande en quelques clics. Paiement sécurisé, confirmation immédiate. Ta commande est directement transmise au créateur.',
    color: '#000',
  },
  {
    number: '03',
    icon: <IconTruck />,
    title: 'Reçois ta livraison',
    description: 'Livraison express partout au Sénégal. Suivi en temps réel depuis l\'application. Ton colis arrive soigneusement emballé.',
    color: '#FF9500',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="Comment ça marche"
      style={{
        padding: '120px 24px',
        margin: '0 12px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xxxl)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.03)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {/* Big background number — discret sur fond clair */}
      <div aria-hidden style={{
        position: 'absolute',
        right: '-40px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '320px',
        fontWeight: 900,
        color: 'rgba(0,0,0,0.035)',
        letterSpacing: '-20px',
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        HOW
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div className="hiw-header" style={{ maxWidth: '540px', marginBottom: '80px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#FF3B30',
            letterSpacing: '2.5px', textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Comment ça marche
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900, color: '#000000',
            letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
          }}>
            Simple comme bonjour.
            <br />
            <span style={{ color: 'rgba(0,0,0,0.38)' }}>3 étapes, c&apos;est tout.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', position: 'relative' }}>
          {/* Connector line */}
          <div aria-hidden className="hiw-connector" style={{
            position: 'absolute',
            top: '52px',
            left: 'calc(33.3% - 20px)',
            right: 'calc(33.3% - 20px)',
            height: '1px',
            background: 'linear-gradient(to right, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.07) 100%)',
            zIndex: 0,
          }} />

          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="hiw-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '36px 32px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: '#FAFAFA',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                zIndex: 1,
                transition: 'transform 220ms ease, box-shadow 220ms ease',
              }}
            >
              {/* Number label */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: step.color,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Étape {step.number}
              </div>

              {/* Icon */}
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '16px',
                backgroundColor: step.color === '#000' ? '#000' : step.color === '#FF9500' ? 'rgba(255,149,0,0.08)' : 'rgba(255,59,48,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.color === '#000' ? '#fff' : step.color,
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontSize: '1.2rem', fontWeight: 800,
                color: '#000', letterSpacing: '-0.4px',
                lineHeight: 1.3, margin: 0,
              }}>
                {step.title}
              </h3>

              <p style={{
                fontSize: '14px', lineHeight: 1.75,
                color: 'rgba(0,0,0,0.5)', margin: 0,
              }}>
                {step.description}
              </p>

              {/* Step indicator dot */}
              <div style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                backgroundColor: step.color,
                marginTop: 'auto',
              }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hiw-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.08) !important;
        }
        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
          .hiw-connector { display: none !important; }
        }
        @media (max-width: 640px) {
          #how-it-works { padding: 64px 16px !important; margin: 0 6px !important; }
          .hiw-header { margin-bottom: 48px !important; }
          .hiw-grid { gap: 12px !important; }
          .hiw-card { padding: 24px 20px !important; }
        }
      `}</style>
    </section>
  );
}

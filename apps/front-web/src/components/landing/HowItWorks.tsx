'use client';

import { FONT_FAMILY_INTER } from '@/styles/typography';

const IconSearch = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const IconBag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconTruck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
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
        <div className="hiw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', position: 'relative', marginTop: '20px' }}>
          {/* Connector line (Dashed) */}
          <div aria-hidden className="hiw-connector" style={{
            position: 'absolute',
            top: '32px', // Center of the 64px floating icons
            left: 'calc(16.6% + 32px)', // Approximate center of first column's icon
            right: 'calc(16.6% + 32px)',
            height: '2px',
            backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.1) 50%, transparent 50%)',
            backgroundSize: '12px 2px',
            backgroundRepeat: 'repeat-x',
            zIndex: 0,
          }} />

          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="hiw-card group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Floating Icon */}
              <div
                className="hiw-icon"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '32px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  backgroundColor: step.color === '#000' ? '#000' : '#fff',
                  border: step.color === '#000' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: step.color === '#000' ? '0 12px 24px rgba(0,0,0,0.2)' : `0 12px 24px ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color === '#000' ? '#fff' : step.color,
                  zIndex: 2,
                }}
              >
                {step.icon}
              </div>

              {/* Card Body - Asymmetric Tag Shape */}
              <div
                className="hiw-body"
                style={{
                  marginTop: '32px', // Pushes body below the top half of the icon
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '56px 32px 40px',
                  borderRadius: '32px 10px 32px 10px', // Asymmetric streetwear tag look
                  background: 'linear-gradient(145deg, #ffffff 0%, #f7f7f7 100%)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 8px 24px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Giant Watermark Number */}
                <div
                  className="hiw-number"
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    right: '-16px',
                    fontSize: '140px',
                    fontWeight: 900,
                    color: 'rgba(0,0,0,0.08)',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    letterSpacing: '-8px',
                  }}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: step.color,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  Étape {step.number}
                </div>

                <h3 style={{
                  fontSize: '1.3rem', fontWeight: 800,
                  color: '#000', letterSpacing: '-0.5px',
                  lineHeight: 1.25, margin: '0 0 16px 0',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {step.title}
                </h3>

                <p style={{
                  fontSize: '15px', lineHeight: 1.6,
                  color: 'rgba(0,0,0,0.55)', margin: 0,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hiw-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .hiw-body {
          transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .hiw-number {
          transition: transform 0.5s ease, color 0.5s ease;
        }
        
        .hiw-card:hover .hiw-icon {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 32px rgba(0,0,0,0.12);
        }
        .hiw-card:hover .hiw-body {
          transform: translateY(-4px);
          border-color: rgba(0,0,0,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 16px 48px rgba(0,0,0,0.06);
        }
        .hiw-card:hover .hiw-number {
          color: rgba(0,0,0,0.08);
          transform: scale(1.1) translate(-10px, 10px);
        }

        /* Animated Dashed Line */
        @keyframes dashMove {
          from { background-position: 0 0; }
          to { background-position: 24px 0; }
        }
        .hiw-connector {
          animation: dashMove 2s linear infinite;
        }

        @media (max-width: 900px) {
          .hiw-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hiw-connector { 
            /* Change connector to vertical for mobile */
            top: 64px !important; bottom: 64px !important;
            left: 64px !important; right: auto !important;
            width: 2px !important; height: auto !important;
            backgroundImage: linear-gradient(180deg, rgba(0,0,0,0.1) 50%, transparent 50%) !important;
            backgroundSize: 2px 12px !important;
            backgroundRepeat: repeat-y !important;
            animation: dashMoveVertical 2s linear infinite !important;
          }
        }
        @keyframes dashMoveVertical {
          from { background-position: 0 0; }
          to { background-position: 0 24px; }
        }
        
        @media (max-width: 640px) {
          #how-it-works { padding: 64px 16px !important; margin: 0 6px !important; }
          .hiw-header { margin-bottom: 48px !important; }
          .hiw-icon { left: 24px !important; }
          .hiw-body { padding: 56px 24px 32px !important; }
          .hiw-connector { left: 56px !important; }
        }
      `}} />
    </section>
  );
}

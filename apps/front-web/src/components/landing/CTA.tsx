'use client';

const IconApple = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z"/>
  </svg>
);

const PERKS = [
  { icon: '🚚', text: 'Livraison partout au Sénégal' },
  { icon: '🔒', text: 'Paiement 100% sécurisé' },
  { icon: '↩️', text: 'Retours faciles sous 14 jours' },
  { icon: '⚡', text: 'Notifications de drops en temps réel' },
];

export function CTA() {
  return (
    <section
      id="download"
      aria-label="Télécharger l'application"
      style={{
        padding: '120px 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '32px 32px 0 0',
        margin: '0 12px 0',
      }}
    >
      {/* Background effects */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(255,59,48,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '740px', margin: '0 auto',
        textAlign: 'center', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px',
      }}>

        {/* App icon */}
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 48px rgba(255,59,48,0.4)',
        }}>
          <span style={{
            fontSize: '38px',
            fontWeight: 600,
            fontStyle: 'italic',
            color: '#fff',
            fontFamily: "'Snell Roundhand', 'Dancing Script', cursive",
            lineHeight: 1,
          }}>
            K
          </span>
        </div>

        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#FF3B30',
            letterSpacing: '2.5px', textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Application mobile
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 900, color: '#fff',
            letterSpacing: '-2px', lineHeight: 1.08, margin: 0,
          }}>
            Kollect dans ta poche.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Partout et à tout moment.</span>
          </h2>
        </div>

        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.44)',
          lineHeight: 1.75, maxWidth: '480px', margin: 0,
        }}>
          Télécharge l&apos;app Kollect gratuitement. Explore les drops, suis tes marques préférées et commande en quelques secondes depuis ton smartphone.
        </p>

        {/* App Store buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#"
            className="cta-app-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 24px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#fff', textDecoration: 'none',
              transition: 'all 220ms ease',
              minWidth: '180px',
            }}
          >
            <IconApple />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.5px' }}>Télécharger sur</p>
              <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>App Store</p>
            </div>
          </a>

          <a href="#"
            className="cta-app-btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 24px', borderRadius: '14px',
              backgroundColor: '#FF3B30',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(255,59,48,0.35)',
              transition: 'all 220ms ease',
              minWidth: '180px',
            }}
          >
            <IconPlay />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: 0, letterSpacing: '0.5px' }}>Disponible sur</p>
              <p style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>Google Play</p>
            </div>
          </a>
        </div>

        {/* Perks */}
        <div className="cta-perks" style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingTop: '8px',
        }}>
          {PERKS.map(p => (
            <div key={p.text} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>{p.icon}</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                {p.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cta-app-btn:hover {
          border-color: rgba(255,255,255,0.3) !important;
          background-color: rgba(255,255,255,0.09) !important;
          transform: translateY(-1px);
        }
        .cta-app-btn-primary:hover {
          background-color: #e0342a !important;
          box-shadow: 0 12px 40px rgba(255,59,48,0.5) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 560px) {
          .cta-perks { gap: 16px !important; }
        }
      `}</style>
    </section>
  );
}

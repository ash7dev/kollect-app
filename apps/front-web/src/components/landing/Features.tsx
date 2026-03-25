'use client';

const IconBolt = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconBadgeCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const IconPackage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconBoutique = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Bento grid layout: large + small + small / large
const FEATURES = [
  {
    icon: <IconBolt />,
    label: 'Drops Exclusifs',
    title: 'Sois le premier à porter',
    description: 'Accès anticipé aux nouvelles collections avant tout le monde. Alertes en temps réel dès qu\'un drop est annoncé par ta marque préférée.',
    dark: true,
    large: true,
  },
  {
    icon: <IconBadgeCheck />,
    label: 'Marques Vérifiées',
    title: 'Authenticité garantie',
    description: 'Chaque marque est sélectionnée et validée par notre équipe. Qualité certifiée.',
    dark: false,
    large: false,
  },
  {
    icon: <IconShield />,
    label: 'Paiement Sécurisé',
    title: 'Achète en toute sécurité',
    description: 'Transactions chiffrées et acheteur protégé sur chaque commande.',
    dark: false,
    large: false,
  },
  {
    icon: <IconPackage />,
    label: 'Livraison Express',
    title: 'Reçois ta commande rapidement',
    description: 'Livraison express dans tout le Sénégal. Suivi en temps réel, emballage soigné à chaque commande. Partout, vite.',
    dark: true,
    large: false,
  },
  {
    icon: <IconGlobe />,
    label: 'Communauté',
    title: 'Une scène streetwear vivante',
    description: 'Rejoins une communauté de passionnés, suis tes créateurs préférés et découvre les tendances de la scène locale.',
    dark: false,
    large: false,
  },
  {
    icon: <IconBoutique />,
    label: 'Espace marque',
    title: 'Boutique dédiée pour chaque marque',
    description: 'Chaque maison dispose de sa vitrine : lookbook, collections et calendrier des sorties. Bientôt, ton propre nom de domaine pour prolonger l’expérience premium.',
    dark: false,
    large: true,
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-label="Fonctionnalités"
      style={{
        padding: '120px 24px',
        backgroundColor: '#fff',
        margin: '0 12px',
        borderRadius: 'var(--radius-xxxl)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ maxWidth: '520px', marginBottom: '64px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#FF3B30',
            letterSpacing: '2.5px', textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Pourquoi Kollect
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 900, color: '#000',
            letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
          }}>
            Tout pour découvrir
            <br />
            <span style={{ color: 'rgba(0,0,0,0.3)' }}>les maisons &amp; pièces d’exception.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="bento-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: '14px',
          gridAutoRows: 'auto',
        }}>
          {FEATURES.map((f, i) => {
            const isLargeItem = f.large;
            const colSpan = isLargeItem ? 2 : 1;
            return (
              <div
                key={f.label}
                className="bento-card"
                style={{
                  gridColumn: `span ${colSpan}`,
                  padding: isLargeItem ? '44px 40px' : '36px 28px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: f.dark ? '#000' : '#F7F7F7',
                  border: f.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: isLargeItem ? 'row' : 'column',
                  gap: isLargeItem ? '40px' : '18px',
                  alignItems: isLargeItem ? 'center' : 'flex-start',
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* BG number watermark on large cards */}
                {isLargeItem && (
                  <div aria-hidden style={{
                    position: 'absolute',
                    right: f.dark ? '24px' : '-10px',
                    bottom: '-20px',
                    fontSize: '140px',
                    fontWeight: 900,
                    color: f.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    lineHeight: 1,
                    userSelect: 'none',
                    letterSpacing: '-8px',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  width: isLargeItem ? '64px' : '52px',
                  height: isLargeItem ? '64px' : '52px',
                  borderRadius: isLargeItem ? '18px' : '14px',
                  backgroundColor: f.dark ? 'rgba(255,59,48,0.12)' : 'rgba(255,59,48,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FF3B30',
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#FF3B30', letterSpacing: '1.8px', textTransform: 'uppercase', margin: 0 }}>
                    {f.label}
                  </p>
                  <h3 style={{
                    fontSize: isLargeItem ? '1.4rem' : '1.1rem',
                    fontWeight: 800,
                    color: f.dark ? '#fff' : '#000',
                    letterSpacing: '-0.5px', lineHeight: 1.3, margin: 0,
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontSize: '14px', lineHeight: 1.75,
                    color: f.dark ? 'rgba(255,255,255,0.44)' : 'rgba(0,0,0,0.48)',
                    margin: 0,
                    maxWidth: isLargeItem ? '340px' : undefined,
                  }}>
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bento-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.08) !important;
        }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-card[style*="span 2"] { grid-column: span 2 !important; flex-direction: column !important; }
        }
        @media (max-width: 580px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-card[style*="span 2"] { grid-column: span 1 !important; }
        }
      ` }} />
    </section>
  );
}

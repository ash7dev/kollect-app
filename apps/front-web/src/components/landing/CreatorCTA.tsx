'use client';

const CREATOR_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Commission mesurée',
    desc: 'Une structure claire pour que la majeure partie du prix reste pour ta marque.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
    title: 'Pilotage de la vitrine',
    desc: 'Ventes, passages sur ta boutique, pièces les plus vues — pour décider le prochain drop avec lucidité.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Audience déjà là',
    desc: 'Une scène qui attend les bonnes marques : visibilité sur le portail et fidèles sur ton espace dédié.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Calendrier & éditions',
    desc: 'Fenêtres de vente limitées, teasing et notifications — le rituel d’une marque, pas un simple upload.',
  },
];

export function CreatorCTA() {
  return (
    <section
      id="creators"
      aria-label="Rejoindre en tant que marque"
      style={{
        padding: '120px 24px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xxxl)',
        margin: '0 12px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* BG glow */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,59,48,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
        <div className="creator-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}>
          {/* ── Left : texte ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#C2923B',
                letterSpacing: '2.5px', textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Pour les marques & créateurs
              </p>
              <h2 style={{
                fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                fontWeight: 900, color: '#fff',
                letterSpacing: '-2px', lineHeight: 1.08, margin: 0,
              }}>
                Ouvre ta boutique
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #FF3B30, #C9A962)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  dans l’écosystème.
                </span>
              </h2>
            </div>

            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.44)',
              lineHeight: 1.75,
              maxWidth: '440px',
              margin: 0,
            }}>
              Un espace à toi — charte, collections, calendrier des lancements — tout en profitant du trafic et de la confiance du portail Kollect. Les acheteurs d’abord ; sans eux, une vitrine reste muette.
            </p>

            {/* Stats créateurs */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { value: '500+', label: 'Marques actives' },
                { value: '0 FCFA', label: 'Pour ouvrir' },
                { value: '48h', label: 'Mise en ligne' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                    {s.value}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="/become-seller"
                className="creator-btn-primary"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '15px', fontWeight: 800,
                  color: '#fff', textDecoration: 'none',
                  backgroundColor: '#FF3B30',
                  boxShadow: '0 8px 32px rgba(255,59,48,0.3)',
                  transition: 'all 220ms ease',
                  letterSpacing: '0.1px',
                }}
              >
                Rejoindre en tant que marque
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="/how-it-works"
                className="creator-btn-ghost"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '15px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  transition: 'all 220ms ease',
                }}
              >
                En savoir plus
              </a>
            </div>
          </div>

          {/* ── Right : feature cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {CREATOR_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="creator-feature-card"
                style={{
                  padding: '24px 20px',
                  borderRadius: '16px',
                  backgroundColor: i === 0 ? 'rgba(255,59,48,0.08)' : 'rgba(255,255,255,0.04)',
                  border: i === 0 ? '1px solid rgba(255,59,48,0.2)' : '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'transform 220ms ease, border-color 220ms ease',
                }}
              >
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '10px',
                  backgroundColor: i === 0 ? 'rgba(255,59,48,0.15)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? '#FF3B30' : 'rgba(255,255,255,0.6)',
                }}>
                  {f.icon}
                </div>
                <h4 style={{
                  fontSize: '14px', fontWeight: 700,
                  color: '#fff', letterSpacing: '-0.3px',
                  lineHeight: 1.3, margin: 0,
                }}>
                  {f.title}
                </h4>
                <p style={{
                  fontSize: '13px', lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.36)', margin: 0,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .creator-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 40px rgba(255,59,48,0.45) !important;
          background-color: #e0342a !important;
        }
        .creator-btn-ghost:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.28) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        .creator-feature-card:hover {
          transform: translateY(-3px) !important;
          border-color: rgba(255,59,48,0.3) !important;
        }
        @media (max-width: 960px) {
          .creator-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

import Link from 'next/link';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function BrandsCreatorCta() {
  return (
    <section
      aria-label="Créateurs"
      style={{
        margin: '48px 12px 0',
        padding: '56px var(--layout-container-padding)',
        borderRadius: 'var(--radius-xxxl)',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,59,48,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 28,
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF9500', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Tu crées ?
          </p>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.5px',
              lineHeight: 1.15,
              margin: '0 0 12px',
            }}
          >
            Ta marque mérite une vitrine à la hauteur du travail.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, margin: 0 }}>
            Drops, lookbook, calendrier des sorties — tout est pensé pour que la communauté te découvre sans friction.
          </p>
        </div>
        <Link
          href="/create-brand"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 26px',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            color: '#0a0a0a',
            backgroundColor: '#fff',
            textDecoration: 'none',
            flexShrink: 0,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
          className="brands-creator-cta-btn"
        >
          Lancer ma marque
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <style>{`
        .brands-creator-cta-btn:hover {
          background-color: #FF3B30 !important;
          color: #fff !important;
          transform: translateY(-2px);
        }
        .brands-creator-cta-btn {
          transition: background 200ms ease, color 200ms ease, transform 200ms ease;
        }
      `}</style>
    </section>
  );
}

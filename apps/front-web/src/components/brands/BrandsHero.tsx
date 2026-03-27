import { FONT_FAMILY_INTER } from '@/styles/typography';

export function BrandsHero({ brandCount, loading }: { brandCount: number; loading?: boolean }) {
  const countLabel = loading
    ? 'Chargement du catalogue…'
    : brandCount <= 0
      ? "La scène s'étoffe"
      : `${brandCount} marque${brandCount > 1 ? 's' : ''} partenaire${brandCount > 1 ? 's' : ''}`;

  return (
    <section
      aria-label="Introduction"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#070707',
        padding: '110px var(--layout-container-padding) 72px',
        margin: '0 12px',
        borderRadius: 'var(--radius-xxxl)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(ellipse, rgba(255,59,48,0.09) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(ellipse, rgba(255,149,0,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '720px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#FF3B30',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            margin: '0 0 16px',
          }}
        >
          Annuaire
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-2px',
            lineHeight: 1.05,
            margin: '0 0 20px',
          }}
        >
          Les marques qui façonnent
          <br />
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>le streetwear sénégalais.</span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            color: 'rgba(255,255,255,0.42)',
            lineHeight: 1.75,
            maxWidth: '540px',
            margin: '0 0 28px',
          }}
        >
          Chaque vitrine est curatée : identité visuelle, collections et calendrier des sorties. Passe
          d&apos;une marque à l&apos;autre comme dans un magazine — sans bruit, avec exigence.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.3px',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34C759',
                boxShadow: '0 0 10px rgba(52,199,89,0.7)',
              }}
            />
            {countLabel}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Marques vérifiées · Paiement sécurisé
          </span>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';

export function BrandsEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        margin: '0 12px',
        borderRadius: 'var(--radius-xxxl)',
        border: '1px dashed rgba(0,0,0,0.1)',
        backgroundColor: '#FAFAFA',
      }}
    >
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Aucun résultat
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
          {hasFilters ? "Essaie d'élargir ta recherche." : 'Les vitrines arrivent très vite.'}
        </p>
        <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, margin: '0 0 24px' }}>
          {hasFilters
            ? 'Réinitialise les filtres ou parcours le catalogue produits.'
            : "Reviens bientôt : notre équipe valide chaque marque à la main."}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          <Link
            href="/search"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Recherche globale
          </Link>
          <Link
            href="/explorer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              border: '1.5px solid rgba(0,0,0,0.12)',
              color: '#111',
              textDecoration: 'none',
            }}
          >
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}

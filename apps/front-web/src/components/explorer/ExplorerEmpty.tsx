'use client';

type ExplorerEmptyProps = {
  query?: string;
  tab: 'products' | 'collections' | 'brands';
};

const LABELS = {
  products: 'produits',
  collections: 'collections',
  brands: 'marques',
};

export function ExplorerEmpty({ query, tab }: ExplorerEmptyProps) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 20, fontWeight: 900, color: '#000', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
        {query ? `Aucun résultat pour « ${query} »` : `Aucun ${LABELS[tab]} trouvé`}
      </h3>
      <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 1.6 }}>
        {query
          ? 'Essaie avec d\'autres mots-clés ou modifie tes filtres.'
          : 'Reviens bientôt, de nouveaux contenus arrivent régulièrement.'}
      </p>
    </div>
  );
}

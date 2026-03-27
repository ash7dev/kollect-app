'use client';

export type CollectionFilterState = {
  status: 'all' | 'DISPONIBLE' | 'TEASER';
  isFeatured: boolean;
  sortBy: 'recent' | 'name-asc';
};

export const DEFAULT_COLLECTION_FILTERS: CollectionFilterState = {
  status: 'all',
  isFeatured: false,
  sortBy: 'recent',
};

type CollectionFiltersProps = {
  filters: CollectionFilterState;
  onChange: (f: CollectionFilterState) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 12px' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function CollectionFilters({ filters, onChange }: CollectionFiltersProps) {
  const set = (patch: Partial<CollectionFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div style={{ padding: '24px 0' }}>
      <Section title="Statut">
        {([['all', 'Toutes'], ['DISPONIBLE', 'Disponibles'], ['TEASER', 'À venir']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => set({ status: val })}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, marginBottom: 4,
              backgroundColor: filters.status === val ? '#0a0a0a' : 'transparent',
              color: filters.status === val ? '#fff' : 'rgba(0,0,0,0.6)',
              transition: 'all 150ms ease',
            }}
          >
            {label}
          </button>
        ))}
      </Section>

      <Section title="Tri">
        {([['recent', 'Récentes'], ['name-asc', 'A → Z']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => set({ sortBy: val })}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, marginBottom: 4,
              backgroundColor: filters.sortBy === val ? '#0a0a0a' : 'transparent',
              color: filters.sortBy === val ? '#fff' : 'rgba(0,0,0,0.6)',
              transition: 'all 150ms ease',
            }}
          >
            {label}
          </button>
        ))}
      </Section>

      <Section title="Sélection">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox" checked={filters.isFeatured}
            onChange={e => set({ isFeatured: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#0a0a0a', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>Vedettes uniquement</span>
        </label>
      </Section>
    </div>
  );
}

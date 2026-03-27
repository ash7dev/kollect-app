'use client';

export type BrandFilterState = {
  isVerified: boolean;
  sortBy: 'featured' | 'name-asc' | 'products' | 'recent';
};

export const DEFAULT_BRAND_FILTERS: BrandFilterState = {
  isVerified: false,
  sortBy: 'featured',
};

type BrandFiltersProps = {
  filters: BrandFilterState;
  onChange: (f: BrandFilterState) => void;
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

export function BrandFilters({ filters, onChange }: BrandFiltersProps) {
  const set = (patch: Partial<BrandFilterState>) => onChange({ ...filters, ...patch });

  return (
    <div style={{ padding: '24px 0' }}>
      <Section title="Tri">
        {([
          ['featured', 'Tendance'],
          ['name-asc', 'A → Z'],
          ['products', 'Plus de pièces'],
          ['recent', 'Récentes'],
        ] as const).map(([val, label]) => (
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

      <Section title="Certification">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox" checked={filters.isVerified}
            onChange={e => set({ isVerified: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#0a0a0a', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>Marques vérifiées</span>
        </label>
      </Section>
    </div>
  );
}

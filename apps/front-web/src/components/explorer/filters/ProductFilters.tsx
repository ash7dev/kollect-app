'use client';

export type ProductFilterState = {
  minPrice: string;
  maxPrice: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sortBy: 'popular' | 'recent' | 'price-asc' | 'price-desc';
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  minPrice: '',
  maxPrice: '',
  sizes: [],
  colors: [],
  inStock: false,
  sortBy: 'popular',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Noir', 'Blanc', 'Gris', 'Rouge', 'Bleu', 'Vert', 'Beige', 'Marron'];
const SORTS = [
  { value: 'popular', label: 'Populaire' },
  { value: 'recent', label: 'Récent' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
];

type ProductFiltersProps = {
  filters: ProductFilterState;
  onChange: (f: ProductFilterState) => void;
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

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const set = (patch: Partial<ProductFilterState>) => onChange({ ...filters, ...patch });

  const toggleSize = (s: string) =>
    set({ sizes: filters.sizes.includes(s) ? filters.sizes.filter(x => x !== s) : [...filters.sizes, s] });

  const toggleColor = (c: string) =>
    set({ colors: filters.colors.includes(c) ? filters.colors.filter(x => x !== c) : [...filters.colors, c] });

  return (
    <div style={{ padding: '24px 0' }}>
      <Section title="Tri">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SORTS.map(s => (
            <button
              key={s.value}
              onClick={() => set({ sortBy: s.value as ProductFilterState['sortBy'] })}
              style={{
                textAlign: 'left', padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                backgroundColor: filters.sortBy === s.value ? '#0a0a0a' : 'transparent',
                color: filters.sortBy === s.value ? '#fff' : 'rgba(0,0,0,0.6)',
                transition: 'all 150ms ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Prix (FCFA)">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => set({ minPrice: e.target.value })}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none' }}
          />
          <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: 12 }}>–</span>
          <input
            type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => set({ maxPrice: e.target.value })}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.12)', fontSize: 13, outline: 'none' }}
          />
        </div>
      </Section>

      <Section title="Tailles">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SIZES.map(s => (
            <button
              key={s} onClick={() => toggleSize(s)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: filters.sizes.includes(s) ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                backgroundColor: filters.sizes.includes(s) ? '#0a0a0a' : 'transparent',
                color: filters.sizes.includes(s) ? '#fff' : 'rgba(0,0,0,0.6)',
                transition: 'all 150ms ease',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Couleurs">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {COLORS.map(c => (
            <button
              key={c} onClick={() => toggleColor(c)}
              style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: filters.colors.includes(c) ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                backgroundColor: filters.colors.includes(c) ? '#0a0a0a' : 'transparent',
                color: filters.colors.includes(c) ? '#fff' : 'rgba(0,0,0,0.6)',
                transition: 'all 150ms ease',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Disponibilité">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox" checked={filters.inStock}
            onChange={e => set({ inStock: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: '#0a0a0a', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>En stock uniquement</span>
        </label>
      </Section>
    </div>
  );
}

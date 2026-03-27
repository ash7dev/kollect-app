'use client';

export type ActiveFilter = { key: string; label: string };

type FilterTagsProps = {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
};

export function FilterTags({ filters, onRemove, onClearAll }: FilterTagsProps) {
  if (filters.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 24 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginRight: 4 }}>
        Filtres :
      </span>
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onRemove(f.key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 999,
            backgroundColor: '#0a0a0a', color: '#fff',
            fontSize: 12, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FF3B30')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0a0a0a')}
        >
          {f.label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ))}
      <button
        onClick={onClearAll}
        style={{
          fontSize: 12, fontWeight: 700, color: '#FF3B30',
          background: 'none', border: 'none', cursor: 'pointer', padding: '5px 4px',
          textDecoration: 'underline',
        }}
      >
        Tout effacer
      </button>
    </div>
  );
}

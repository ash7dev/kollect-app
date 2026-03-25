'use client';

import { useRef } from 'react';
import type { BrandSortId } from '@/components/brands/types';

type BrandsToolbarProps = {
  query: string;
  onQueryChange: (v: string) => void;
  onSubmitSearch: () => void;
  sort: BrandSortId;
  onSortChange: (v: BrandSortId) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (v: boolean) => void;
};

const SORT_OPTIONS: { id: BrandSortId; label: string }[] = [
  { id: 'featured', label: 'Tendance' },
  { id: 'name-asc', label: 'A → Z' },
  { id: 'products', label: 'Plus de pièces' },
  { id: 'recent', label: 'Récentes' },
];

export function BrandsToolbar({
  query,
  onQueryChange,
  onSubmitSearch,
  sort,
  onSortChange,
  verifiedOnly,
  onVerifiedOnlyChange,
}: BrandsToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function scrollToResults() {
    requestAnimationFrame(() => {
      const el = document.querySelector('section[aria-label="Toutes les marques"]') as HTMLElement | null;
      el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Search */}
        <form
          role="search"
          aria-label="Filtrer les marques"
            onSubmit={(e) => {
            e.preventDefault();
            onSubmitSearch();
            scrollToResults();
          }}
          className="brands-search-form"
          style={{
            flex: '1 1 220px',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
            border: '1.5px solid transparent',
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'border-color 0.2s ease, background 0.2s ease',
          }}
        >
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            ref={inputRef}
            placeholder="Rechercher une marque…"
            className="brands-search-input"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
              padding: '11px 0',
              color: '#111',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange('');
                // Focus retour: pratique sur mobile et évite de perdre le champ.
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              aria-label="Effacer"
              style={{
                padding: '0 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.3)',
                fontSize: 18,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ×
            </button>
          )}
        </form>

        {/* Sort pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onSortChange(o.id);
                scrollToResults();
              }}
              className="brands-sort-pill"
              aria-pressed={sort === o.id}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: sort === o.id ? '1.5px solid #000' : '1.5px solid rgba(0,0,0,0.1)',
                backgroundColor: sort === o.id ? '#000' : 'transparent',
                color: sort === o.id ? '#fff' : 'rgba(0,0,0,0.55)',
                transition: 'all 0.15s ease',
              }}
            >
              {o.label}
            </button>
          ))}

          <div style={{ width: 1, height: 18, backgroundColor: 'rgba(0,0,0,0.1)', margin: '0 2px' }} aria-hidden />

          {/* Verified toggle */}
          <button
            type="button"
            onClick={() => {
              onVerifiedOnlyChange(!verifiedOnly);
              scrollToResults();
            }}
            className="brands-sort-pill"
            aria-pressed={verifiedOnly}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: verifiedOnly ? '1.5px solid #34C759' : '1.5px solid rgba(0,0,0,0.1)',
              backgroundColor: verifiedOnly ? 'rgba(52,199,89,0.08)' : 'transparent',
              color: verifiedOnly ? '#1a8c38' : 'rgba(0,0,0,0.55)',
              transition: 'all 0.15s ease',
            }}
          >
            {verifiedOnly && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            Vérifiées
          </button>
        </div>
      </div>

      <style>{`
        .brands-search-form:focus-within {
          border-color: rgba(0,0,0,0.25) !important;
          background-color: #fff !important;
        }
        .brands-search-input::placeholder { color: rgba(0,0,0,0.3); }
        .brands-search-input::-webkit-search-cancel-button { display: none; }
        .brands-sort-pill:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}

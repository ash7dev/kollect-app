'use client';

import { useEffect, useState, useRef } from 'react';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export type ExplorerTab = 'products' | 'collections' | 'brands';

type ExplorerHeroProps = {
  activeTab: ExplorerTab;
  onTabChange: (tab: ExplorerTab) => void;
  query: string;
  onQueryChange: (q: string) => void;
  counts: { products: number; collections: number; brands: number };
};

const TABS: { id: ExplorerTab; label: string; countKey: keyof typeof LABELS }[] = [
  { id: 'products', label: 'Produits', countKey: 'products' },
  { id: 'collections', label: 'Collections', countKey: 'collections' },
  { id: 'brands', label: 'Marques', countKey: 'brands' },
];

const LABELS = { products: 'products', collections: 'collections', brands: 'brands' } as const;

const PLACEHOLDERS: Record<ExplorerTab, string> = {
  products: 'Chercher un produit, une pièce…',
  collections: 'Chercher une collection…',
  brands: 'Chercher une marque…',
};

export function ExplorerHero({ activeTab, onTabChange, query, onQueryChange, counts }: ExplorerHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsVisible(true); }, []);

  return (
    <section style={{
      backgroundColor: '#0a0a0a',
      padding: '80px 40px 0',
      marginTop: 72,
      borderRadius: '0 0 32px 32px',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: FONT_FAMILY_INTER,
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,59,48,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes explorerHeroUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .explorer-hero-in { animation: explorerHeroUp 0.7s ease-out both; }
        .explorer-tab-btn:hover { color: #fff !important; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div
          className={isVisible ? 'explorer-hero-in' : ''}
          style={{ textAlign: 'center', marginBottom: 40, opacity: isVisible ? 1 : 0 }}
        >
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
            Découvrir
          </p>
          <h1 style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '-3px',
            color: '#fff',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Explorer
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            Produits, collections et marques du streetwear sénégalais
          </p>
        </div>

        {/* Search bar */}
        <div
          className={isVisible ? 'explorer-hero-in' : ''}
          style={{ maxWidth: 640, margin: '0 auto 40px', opacity: isVisible ? 1 : 0, animationDelay: '0.15s' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 16, padding: '12px 18px',
            backdropFilter: 'blur(10px)',
            transition: 'border-color 200ms ease',
          }}
            onFocus={() => {}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={PLACEHOLDERS[activeTab]}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 15, fontWeight: 500, color: '#fff',
                caretColor: '#FF3B30',
              }}
            />
            {query && (
              <button onClick={() => onQueryChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className={isVisible ? 'explorer-hero-in' : ''}
          style={{ display: 'flex', gap: 0, opacity: isVisible ? 1 : 0, animationDelay: '0.25s' }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="explorer-tab-btn"
                style={{
                  flex: 1, padding: '16px 20px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                  borderBottom: isActive ? '2.5px solid #FF3B30' : '2.5px solid transparent',
                  transition: 'all 200ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 999,
                    backgroundColor: isActive ? '#FF3B30' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 10, fontWeight: 900,
                    transition: 'background-color 200ms ease',
                  }}>
                    {count > 999 ? `${Math.floor(count / 1000)}k+` : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

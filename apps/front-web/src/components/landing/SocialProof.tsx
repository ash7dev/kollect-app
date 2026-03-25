'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';

interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
}

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ─── Loading skeleton strip ─────────────────────────────────────── */
function SkeletonStrip() {
  return (
    <div style={{ padding: '88px 0', margin: '0 12px', backgroundColor: '#fff', borderRadius: 'var(--radius-xxxl)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 24px' }}>
        <div style={{ height: '10px', width: '140px', borderRadius: '6px', backgroundColor: '#f0f0f0', margin: '0 auto 16px', animation: 'brandSkeleton 1.6s ease-in-out infinite' }} />
        <div style={{ height: '22px', width: 'min(420px, 90%)', borderRadius: '8px', backgroundColor: '#f5f5f5', margin: '0 auto', animation: 'brandSkeleton 1.6s ease-in-out infinite' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', padding: '0 24px', overflow: 'hidden' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ height: '56px', width: '180px', borderRadius: '14px', backgroundColor: '#f5f5f5', flexShrink: 0, animation: `brandSkeleton 1.6s ease-in-out ${i * 0.1}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes brandSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}

/* ─── Empty state — no verified brands yet ───────────────────────── */
function EmptyBrands() {
  return (
    <section
      id="brands"
      aria-label="Marques partenaires"
      style={{
        padding: '88px 24px',
        margin: '0 12px',
        backgroundColor: '#fff',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 'var(--radius-xxxl)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: i === 1 ? '#FF3B30' : '#f8f8f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: i === 1 ? 'none' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {i === 0 ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              ) : i === 1 ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="5" />
                  <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.32)', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Maisons vérifiées
        </p>

        <h2 style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.75rem)', fontWeight: 900, color: '#000', letterSpacing: '-0.8px', lineHeight: 1.25, margin: '0 0 14px' }}>
          Les premières boutiques ouvrent sur Kollect
        </h2>

        <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.45)', lineHeight: 1.75, margin: '0 0 28px' }}>
          Chaque marque dispose d&apos;un espace dédié — vitrine, histoire et calendrier des lancements. Rejoins les pionniers.
        </p>

        <Link
          href="/create-brand"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, color: '#fff', textDecoration: 'none', backgroundColor: '#FF3B30', boxShadow: '0 8px 32px rgba(255,59,48,0.28)' }}
        >
          Ouvrir ma boutique →
        </Link>
      </div>
    </section>
  );
}

/* ─── Marquee with real brands ───────────────────────────────────── */
function BrandMarquee({ brands }: { brands: Brand[] }) {
  const doubled = [...brands, ...brands];
  const doubled2 = [...brands, ...brands].reverse();

  const Pill = ({ brand }: { brand: Brand }) => {
    const logoSrc = mediaUrl(brand.logo ?? undefined);
    const inner = (
      <>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#000', letterSpacing: '-0.5px' }}>{brand.name.slice(0, 1)}</span>
          )}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 650, color: '#111', letterSpacing: '-0.25px' }}>{brand.name}</span>
      </>
    );

    const shellStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 20px 10px 10px',
      borderRadius: '14px',
      border: '1px solid rgba(0,0,0,0.07)',
      backgroundColor: '#FAFAFA',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      transition: 'border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease',
      boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset',
    };

    if (brand.slug) {
      return (
        <Link href={`/brand/${brand.slug}`} style={{ ...shellStyle, textDecoration: 'none', color: 'inherit' }} className="brand-pill-link">
          {inner}
        </Link>
      );
    }

    return (
      <div style={shellStyle} className="brand-pill-static">
        {inner}
      </div>
    );
  };

  return (
    <section
      id="brands"
      aria-label="Marques partenaires"
      style={{
        padding: '88px 0 96px',
        margin: '0 12px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 'var(--radius-xxxl)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 'min(120px, 12vw)', background: 'linear-gradient(to right, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(120px, 12vw)', background: 'linear-gradient(to left, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: '44px', padding: '0 24px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#FF3B30', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Les maisons sur Kollect
        </p>
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.8vw, 1.85rem)', fontWeight: 900, color: '#000', letterSpacing: '-0.9px', lineHeight: 1.2, margin: '0 0 12px' }}>
          Chaque marque a son espace — comme une boutique en ligne.
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.42)', lineHeight: 1.65, margin: 0 }}>
          {brands.length} maison{brands.length > 1 ? 's' : ''} vérifiée{brands.length > 1 ? 's' : ''}. Clique pour visiter sa vitrine.
        </p>
      </div>

      <div style={{ overflow: 'hidden', marginBottom: '14px' }}>
        <div className="brands-marquee" style={{ display: 'flex', gap: '14px', width: 'max-content', animation: 'marqueeScroll 48s linear infinite' }}>
          {doubled.map((brand, i) => (
            <Pill key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div className="brands-marquee-reverse" style={{ display: 'flex', gap: '14px', width: 'max-content', animation: 'marqueeScroll 56s linear infinite reverse' }}>
          {doubled2.map((brand, i) => (
            <Pill key={`rev-${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-pill-link:hover, .brand-pill-static:hover {
          border-color: rgba(0,0,0,0.14) !important;
          background-color: #f3f3f3 !important;
        }
        .brands-marquee:hover, .brands-marquee-reverse:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .brands-marquee, .brands-marquee-reverse { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function SocialProof() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await apiClient.get('/brands?isActive=true&isVerified=true');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBrands(
            res.data.map((b: { id: string; name: string; slug?: string; logo?: string | null }) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              logo: b.logo,
            })),
          );
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  if (loading) return <SkeletonStrip />;
  if (brands.length === 0) return <EmptyBrands />;
  return <BrandMarquee brands={brands} />;
}

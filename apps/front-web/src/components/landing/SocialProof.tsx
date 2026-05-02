'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';
import { FONT_FAMILY_INTER } from '@/styles/typography';

interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  collectionsCount?: number;
  isNew?: boolean;
  isVerified?: boolean;
}

function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <section
      id="brands"
      aria-label="Marques partenaires"
      style={{ padding: '100px 24px', backgroundColor: '#fff', fontFamily: FONT_FAMILY_INTER }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ height: '10px', width: '120px', borderRadius: '6px', backgroundColor: '#f0f0f0', margin: '0 auto 18px', animation: 'spSk 1.6s ease-in-out infinite' }} />
        <div style={{ height: '32px', width: 'min(460px, 90%)', borderRadius: '8px', backgroundColor: '#f5f5f5', margin: '0 auto 12px', animation: 'spSk 1.6s ease-in-out infinite' }} />
        <div style={{ height: '20px', width: 'min(280px, 80%)', borderRadius: '6px', backgroundColor: '#f7f7f7', margin: '0 auto 48px', animation: 'spSk 1.6s ease-in-out infinite' }} />
        <div style={{ height: '40px', borderRadius: '12px', backgroundColor: '#f7f7f7', marginBottom: '40px', animation: 'spSk 1.6s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: '108px', borderRadius: '18px', backgroundColor: '#f5f5f5', animation: `spSk 1.6s ease-in-out ${i * 0.1}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes spSk { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </section>
  );
}

/* ─── Premium Icon Components ─────────────────────────────────────── */
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ─── Premium Stats Card ───────────────────────────────────────────── */
function PremiumStatsCard({ item, index }: { item: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const colors = ['#FF3B30', '#FF9500', '#34C759'];
  const color = colors[index % colors.length];
  
  const icons = [
    <HomeIcon key="home" />, 
    <CheckIcon key="check" />, 
    <LocationIcon key="location" />
  ];
  
  return (
    <div
      style={{
        flex: 1,
        padding: '28px 20px',
        borderRadius: '20px',
        background: hovered 
          ? `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`
          : 'linear-gradient(135deg, #fff 0%, #FAFAFA 100%)',
        border: `1px solid ${hovered ? `${color}20` : 'rgba(0,0,0,0.06)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered
          ? `0 12px 32px ${color}15, 0 8px 16px rgba(0,0,0,0.08)`
          : '0 4px 16px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow effect */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      
      {/* Icon container */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '16px',
        background: hovered 
          ? `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`
          : `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 300ms ease',
        transform: hovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        boxShadow: hovered 
          ? `0 8px 24px ${color}30`
          : `0 4px 12px ${color}15`,
      }}>
        <div style={{ color: hovered ? '#fff' : color, transition: 'color 300ms ease' }}>
          {icons[index]}
        </div>
      </div>
      
      {/* Value */}
      <span style={{
        fontSize: '2rem',
        fontWeight: 900,
        color: '#000',
        letterSpacing: '-1px',
        lineHeight: 1,
        fontFamily: FONT_FAMILY_INTER,
        transition: 'all 300ms ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
      }}>
        {item.value}
      </span>
      
      {/* Label */}
      <span style={{
        fontSize: '11px',
        color: 'rgba(0,0,0,0.48)',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textAlign: 'center',
        textTransform: 'uppercase',
        transition: 'all 300ms ease',
      }}>
        {item.label}
      </span>
      
      {/* Accent line */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          borderRadius: '2px',
        }} />
      )}
    </div>
  );
}

/* ─── Stats strip ────────────────────────────────────────────────── */
function StatsStrip({ count }: { count: number }) {
  const items = [
    { value: `${count}+`, label: 'marques vérifiées' },
    { value: '100%', label: 'authenticité garantie' },
    { value: 'Sénégal', label: 'streetwear local' },
  ];
  
  return (
    <div
      className="sp-stats-strip"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '48px',
        padding: '0 8px',
      }}
    >
      {items.map((item, i) => (
        <PremiumStatsCard key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}

/* ─── Featured Brand Card (VIP ID Badge Style) ────────────────────── */
function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const [hovered, setHovered] = useState(false);
  const logoSrc = mediaUrl(brand.logo);
  const initial = brand.name.charAt(0).toUpperCase();
  const colors = ['#FF3B30', '#FF9500', '#34C759', '#007AFF'];
  const brandColor = colors[index % colors.length];

  return (
    <Link
      href={brand.slug ? `/brand/${brand.slug}` : '#'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '36px 20px 20px', // Extra padding at top for the hole
        borderRadius: '16px',
        background: hovered 
          ? `linear-gradient(180deg, #FAFAFA 0%, ${brandColor}08 100%)`
          : 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        border: `1px solid ${hovered ? `${brandColor}30` : 'rgba(0,0,0,0.08)'}`,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered
          ? `0 16px 40px ${brandColor}15, 0 4px 12px rgba(0,0,0,0.05)`
          : '0 4px 12px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
        minHeight: '280px', // Ensure enough height for the ID badge look
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 1. Lanyard Hole Punch (Top Center) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50px',
        height: '10px',
        borderRadius: '6px',
        backgroundColor: '#FFFFFF', // Matches the section background
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,1)',
        border: '1px solid rgba(0,0,0,0.08)',
        zIndex: 2,
      }} />

      {/* Badge NEW */}
      {brand.isNew && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          padding: '4px 8px', borderRadius: '4px',
          backgroundColor: '#FF3B30',
          fontSize: '9px', fontWeight: 800,
          color: '#fff', letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          NEW
        </div>
      )}

      {/* Content wrapper centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, marginTop: '8px' }}>
        
        {/* Logo */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '14px',
            backgroundColor: logoSrc ? '#fff' : `${brandColor}10`,
            border: `2px solid ${hovered ? brandColor : 'rgba(0,0,0,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: hovered 
              ? `0 8px 24px ${brandColor}20`
              : '0 4px 12px rgba(0,0,0,0.06)',
            transition: 'all 300ms ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 900, color: brandColor, letterSpacing: '-1px' }}>
                {initial}
              </span>
            )}
          </div>
          {brand.isVerified && (
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              width: '24px', height: '24px', borderRadius: '50%',
              background: `linear-gradient(135deg, #34C759 0%, #30A14E 100%)`,
              border: '3px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(52,199,89,0.4)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Nom + label */}
        <div>
          <p style={{
            fontSize: '18px', fontWeight: 900, color: '#000',
            letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 4px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}>
            {brand.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.45)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Official Partner
            </p>
          </div>
        </div>

      </div>

      {/* VIP Access / Barcode Footer */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px dashed rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Fake Barcode using repeating linear gradient */}
        <div style={{
          width: '100%',
          height: '20px',
          backgroundImage: `repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px, #000 8px, #000 12px, transparent 12px, transparent 14px)`,
          opacity: 0.15,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(0,0,0,0.3)', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
            ID-{brand.id.split('-')[0]?.toUpperCase() || 'KLCT-01'}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 800, color: hovered ? brandColor : 'rgba(0,0,0,0.3)', letterSpacing: '1px', transition: 'color 300ms ease' }}>
            ACCESS
          </span>
        </div>
      </div>

      {/* Accent gradient overlay at the bottom edge */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: `linear-gradient(90deg, ${brandColor} 0%, ${brandColor}80 50%, ${brandColor} 100%)`,
        }} />
      )}
    </Link>
  );
}

/* ─── Marquee Pill ───────────────────────────────────────────────── */
function MarqueePill({ brand }: { brand: Brand }) {
  const logoSrc = mediaUrl(brand.logo);

  const inner = (
    <>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        backgroundColor: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#000' }}>{brand.name.charAt(0)}</span>
        )}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
        {brand.name}
      </span>
      {brand.isVerified && (
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%',
          backgroundColor: '#34C759',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </>
  );

  const shellStyle: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '7px 14px 7px 7px', borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)',
    backgroundColor: '#F8F8F8',
    flexShrink: 0,
    transition: 'all 180ms ease',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset',
  };

  if (brand.slug) {
    return (
      <Link href={`/brand/${brand.slug}`} style={{ ...shellStyle, textDecoration: 'none', color: 'inherit' }} className="sp-pill">
        {inner}
      </Link>
    );
  }
  return <div style={shellStyle} className="sp-pill">{inner}</div>;
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
            res.data.map((b: { id: string; name: string; slug?: string; logo?: string | null; isVerified?: boolean }, idx: number) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              logo: b.logo,
              isVerified: b.isVerified ?? true,
              isNew: idx < 2,
            })),
          );
        } else {
          setBrands([]);
        }
      } catch {
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  if (loading) return <Skeleton />;
  if (brands.length === 0) return null;

  const featured = brands.slice(0, 4);
  const doubled  = [...brands, ...brands];
  const doubled2 = [...brands, ...brands].reverse();

  return (
    <section
      id="brands"
      aria-label="Nos marques partenaires"
      style={{
        padding: '96px 0 80px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY_INTER,
        position: 'relative',
      }}
    >
      {/* Dot grid discret */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)',
              display: 'inline-block',
              boxShadow: '0 0 12px rgba(52,199,89,0.8)',
              animation: 'spPulse 2s ease-in-out infinite',
            }} />
            <p style={{
              fontSize: '12px', fontWeight: 800, color: 'rgba(0,0,0,0.42)',
              letterSpacing: '3px', textTransform: 'uppercase', margin: 0,
            }}>
              Marques vérifiées
            </p>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900, color: '#000',
            letterSpacing: '-2px', lineHeight: 1.05,
            margin: '0 0 16px',
          }}>
            Les créateurs qui font la scène.{' '}
            <span style={{ 
              color: '#FF3B30',
            }}>Tous vérifiés.</span>
          </h2>
          <p style={{
            fontSize: '16px', color: 'rgba(0,0,0,0.48)',
            lineHeight: 1.7, margin: '0 auto', maxWidth: '480px',
            fontWeight: 600,
          }}>
            Chaque marque est sélectionnée par notre équipe et dispose de sa propre vitrine sur Kollect.
          </p>
        </div>

        {/* ── Stats strip ── */}
        <StatsStrip count={brands.length} />

        {/* ── Featured brand cards ── */}
        {featured.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div
              className="sp-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(featured.length, 4)}, 1fr)`,
                gap: '12px',
              }}
            >
              {featured.map((brand, i) => (
                <BrandCard key={brand.id} brand={brand} index={i} />
              ))}
            </div>
            {brands.length > 4 && (
              <p style={{
                textAlign: 'center', marginTop: '16px',
                fontSize: '12px', color: 'rgba(0,0,0,0.3)', fontWeight: 500,
              }}>
                + {brands.length - 4} autre{brands.length - 4 > 1 ? 's' : ''} marque{brands.length - 4 > 1 ? 's' : ''} sur Kollect
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Marquee ── */}
      {brands.length >= 3 && (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 'min(100px, 10vw)', background: 'linear-gradient(to right, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 'min(100px, 10vw)', background: 'linear-gradient(to left, #fff, transparent)', zIndex: 1, pointerEvents: 'none' }} />

          <div style={{ overflow: 'hidden', marginBottom: '10px', maxWidth: '100%' }}>
            <div className="sp-marquee" style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'spMarquee 52s linear infinite' }}>
              {doubled.map((brand, i) => <MarqueePill key={`a-${brand.id}-${i}`} brand={brand} />)}
            </div>
          </div>
          <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
            <div className="sp-marquee-rev" style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'spMarquee 64s linear infinite reverse' }}>
              {doubled2.map((brand, i) => <MarqueePill key={`b-${brand.id}-${i}`} brand={brand} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom CTA créateur ── */}
      <div style={{
        maxWidth: '1200px', margin: '60px auto 0',
        padding: '32px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '20px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #000 0%, #1A1A1A 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(255,59,48,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Tu es créateur ?
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
            Rejoins les marques vérifiées et lance tes drops sur Kollect.
          </p>
        </div>
        <Link
          href="/create-brand"
          className="sp-cta-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', borderRadius: '14px',
            fontSize: '15px', fontWeight: 800,
            color: '#fff', textDecoration: 'none',
            background: 'linear-gradient(135deg, #FF3B30 0%, #FF5A3F 100%)',
            boxShadow: '0 6px 20px rgba(255,59,48,0.35)',
            transition: 'all 250ms ease',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Ouvrir ma boutique
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </Link>
      </div>

      <style>{`
        @keyframes spMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spPulse {
          0%, 100% { opacity: 1;   box-shadow: 0 0 12px rgba(52,199,89,0.8); }
          50%       { opacity: 0.6; box-shadow: 0 0 6px rgba(52,199,89,0.4); }
        }
        @keyframes spNewPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
        @keyframes spSk {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
        .sp-pill:hover {
          background-color: #efefef !important;
          border-color: rgba(0,0,0,0.1) !important;
        }
        .sp-marquee:hover,
        .sp-marquee-rev:hover { animation-play-state: paused; }
        .sp-cta-btn:hover {
          background: linear-gradient(135deg, #FF5A3F 0%, #FF3B30 100%) !important;
          box-shadow: 0 12px 36px rgba(255,59,48,0.45) !important;
          transform: translateY(-2px) !important;
        }
        @media (max-width: 860px) {
          .sp-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .sp-stats-strip { display: none !important; }
        }
        @media (max-width: 480px) {
          .sp-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sp-marquee, .sp-marquee-rev { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

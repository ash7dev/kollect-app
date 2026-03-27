/* eslint-disable @next/next/no-img-element */
'use client';

import type { CollectionProduct } from '@/types/drops';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' FCFA'
  );
}

function getStockMeta(stock: number) {
  if (stock === 0)
    return { label: 'Rupture',       color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' };
  if (stock <= 5)
    return { label: `${stock} restants`, color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' };
  return   { label: `${stock} en stock`, color: '#065F46', bg: '#D1FAE5', dot: '#10B981' };
}

const SIZES_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNIQUE'];

function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ai = SIZES_ORDER.indexOf(a);
    const bi = SIZES_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// ─── Placeholder ─────────────────────────────────────────────────────────────

function NoImage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      background: 'linear-gradient(160deg,#111 0%,#1c1c1c 100%)',
    }}>
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.12)" strokeWidth={1.2}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z"/>
        <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/>
      </svg>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '1.8px',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.12)',
        fontFamily: 'Inter, sans-serif',
      }}>No media</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const F = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

export function ProductCard({ product }: { product: CollectionProduct }) {
  const { name, price, stock, sizes, images } = product;
  const primaryImage = images?.[0];
  const sm = getStockMeta(stock);
  const allSizes = sortSizes(sizes ?? []);
  const visible = allSizes.slice(0, 4);
  const extra = allSizes.length > 4 ? allSizes.length - 4 : 0;

  return (
    <article
      style={{
        fontFamily: F, background: '#FFF',
        border: '1px solid #EBEBEB', borderRadius: 16,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '100%', cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04),0 4px 14px rgba(0,0,0,0.06)',
        transition: 'transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s cubic-bezier(.4,0,.2,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07),0 16px 32px rgba(0,0,0,0.1)';
        const img = el.querySelector<HTMLElement>('[data-pc-img]');
        if (img) img.style.transform = 'scale(1.04)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04),0 4px 14px rgba(0,0,0,0.06)';
        const img = el.querySelector<HTMLElement>('[data-pc-img]');
        if (img) img.style.transform = 'scale(1)';
      }}
    >

      {/* ── Image zone — always dark ── */}
      <div style={{
        background: '#0D0D0D', aspectRatio: '3/4',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {primaryImage
          ? <img
              data-pc-img
              src={primaryImage} alt={name}
              style={{
                width: '100%', height: '100%', objectFit: 'contain',
                display: 'block',
                transition: 'transform .4s cubic-bezier(.4,0,.2,1)',
              }}
            />
          : <NoImage />
        }

        {/* Rupture scrim */}
        {stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.52)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: F, fontSize: 9.5, fontWeight: 800,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              padding: '5px 14px',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.38)',
            }}>Épuisé</span>
          </div>
        )}

        {/* Low-stock floating badge */}
        {stock > 0 && stock <= 5 && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.72)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7, padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
            <span style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: '#FCD34D', letterSpacing: '0.2px' }}>
              {stock} restants
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{
        padding: '13px 14px 15px',
        display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0,
      }}>

        {/* Name — height:18px fixes alignment across entire grid */}
        <p title={name} style={{
          margin: '0 0 4px',
          fontFamily: F, fontSize: 12.5, fontWeight: 600,
          color: '#111', letterSpacing: '-0.15px',
          lineHeight: '18px', height: 18,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {name}
        </p>

        {/* Price — height:20px fixes footer alignment across entire grid */}
        <p style={{
          margin: '0 0 12px',
          fontFamily: F, fontSize: 14.5, fontWeight: 800,
          color: '#E63329', letterSpacing: '-0.4px',
          lineHeight: '20px', height: 20,
        }}>
          {formatPrice(price)}
        </p>

        {/* Footer — stock + sizes, pushed to bottom */}
        <div style={{
          marginTop: 'auto',
          display: 'flex', alignItems: 'center', gap: 5,
          flexWrap: 'nowrap', overflow: 'hidden', minWidth: 0,
        }}>
          {/* Stock pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            fontFamily: F, fontSize: 10.5, fontWeight: 700,
            color: sm.color, background: sm.bg,
            flexShrink: 0, whiteSpace: 'nowrap', letterSpacing: '0.1px',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot, flexShrink: 0 }} />
            {sm.label}
          </span>

          {/* Divider */}
          {visible.length > 0 && (
            <span style={{ width: 1, height: 12, background: '#E5E7EB', flexShrink: 0 }} />
          )}

          {/* Sizes */}
          {visible.map(sz => (
            <span key={sz} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '2px 7px', borderRadius: 5,
              fontFamily: F, fontSize: 10, fontWeight: 700,
              background: '#F4F4F5', color: '#52525B', letterSpacing: '0.1px', flexShrink: 0,
            }}>
              {sz}
            </span>
          ))}

          {/* Extra count */}
          {extra > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '2px 6px', borderRadius: 5,
              fontFamily: F, fontSize: 10, fontWeight: 700,
              background: '#F4F4F5', color: '#A1A1AA', flexShrink: 0,
            }}>
              +{extra}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
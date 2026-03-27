/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import type { WizardProductDraft } from '@/types/drops';
import { Ic, I } from './wizard-icons';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  primary:      '#000000',
  primaryLight: '#1A1A1A',
  accent:       '#FF3B30',
  accentLight:  '#FF6B6B',
  accentDark:   '#CC0000',
  bg:           '#FFFFFF',
  surface:      '#F9F9F9',
  surfaceHover: '#F3F3F3',
  border:       'rgba(0,0,0,0.08)',
  borderMed:    'rgba(0,0,0,0.14)',
  muted:        'rgba(0,0,0,0.38)',
  subtle:       'rgba(0,0,0,0.55)',
  text:         '#111111',
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    cardHover: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
    img: '0 2px 8px rgba(0,0,0,0.12)',
  },
  font: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
  },
} as const;

// ─── Inlined constants (was wizard-styles) ─────────────────────────────────────
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const COLORS: { value: string; name: string }[] = [
  { value: '#000000', name: 'Noir' },
  { value: '#FFFFFF', name: 'Blanc' },
  { value: '#E5E5E5', name: 'Gris clair' },
  { value: '#888888', name: 'Gris' },
  { value: '#FF3B30', name: 'Rouge' },
  { value: '#FF9500', name: 'Orange' },
  { value: '#FFCC00', name: 'Jaune' },
  { value: '#34C759', name: 'Vert' },
  { value: '#007AFF', name: 'Bleu' },
  { value: '#5856D6', name: 'Violet' },
  { value: '#FF2D55', name: 'Rose' },
  { value: '#A2845E', name: 'Marron' },
  { value: '#1C3D5A', name: 'Marine' },
  { value: '#F4E9D8', name: 'Crème' },
];

function genSKU(name: string): string {
  const initials = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.slice(0, 3))
    .join('-');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${initials || 'PRD'}-${rand}`;
}

// ─── emptyProduct ─────────────────────────────────────────────────────────────
export function emptyProduct(): WizardProductDraft {
  return { name: '', description: '', price: 0, stock: 10, sku: '', sizes: [], colors: [], images: [] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

// ─── Small UI atoms ───────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ fontSize: T.font.sm, fontWeight: 700, color: T.primaryLight, marginBottom: 6, letterSpacing: '-0.1px', display: 'flex', gap: 3, alignItems: 'center' }}>
      {children}
      {required && <span style={{ color: T.accent, fontSize: T.font.xs }}>*</span>}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '4px 0 0', fontSize: T.font.xs, color: T.muted, fontWeight: 500, lineHeight: 1.4 }}>{children}</p>;
}

function Input({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: T.radius.md,
        border: `1.5px solid ${T.border}`,
        background: T.surface,
        fontSize: T.font.base,
        fontWeight: 500,
        color: T.text,
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, background 0.15s',
        ...style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.bg; }}
      onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: T.radius.md,
        border: `1.5px solid ${T.border}`,
        background: T.surface,
        fontSize: T.font.base,
        fontWeight: 500,
        color: T.text,
        fontFamily: 'inherit',
        outline: 'none',
        resize: 'vertical',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.bg; }}
      onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
    />
  );
}

// ─── ProductFormPanel ─────────────────────────────────────────────────────────
function ProductFormPanel({ product, onChange, onRemove, idx, open, onToggle }: {
  product: WizardProductDraft;
  onChange: (p: WizardProductDraft) => void;
  onRemove?: () => void;
  idx: number;
  open: boolean;
  onToggle: () => void;
}) {
  // Single ref object instead of two separate refs
  const inputRefs = useRef<Record<'gallery' | 'camera', HTMLInputElement | null>>({ gallery: null, camera: null });
  const [previews, setPreviews] = useState<string[]>(() =>
    product.images.map(f => URL.createObjectURL(f))
  );
  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

  const addImages = (files: FileList | null, input?: HTMLInputElement | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - product.images.length);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...newPreviews].slice(0, 5));
    onChange({ ...product, images: [...product.images, ...newFiles].slice(0, 5) });
    if (input) input.value = '';
  };

  const removeImg = (i: number) => {
    setPreviews(prev => prev.filter((_, j) => j !== i));
    onChange({ ...product, images: product.images.filter((_, j) => j !== i) });
  };

  const setMainImg = (i: number) => {
    if (i === 0) return;
    const newPreviews = [...previews];
    const newImages   = [...product.images];
    [newPreviews[0], newPreviews[i]] = [newPreviews[i], newPreviews[0]];
    [newImages[0],   newImages[i]]   = [newImages[i],   newImages[0]];
    setPreviews(newPreviews);
    onChange({ ...product, images: newImages });
  };

  const toggleSize  = (s: string) => onChange({ ...product, sizes:  product.sizes.includes(s)  ? product.sizes.filter(x => x !== s)  : [...product.sizes, s] });
  const toggleColor = (c: string) => onChange({ ...product, colors: product.colors.includes(c) ? product.colors.filter(x => x !== c) : [...product.colors, c] });
  const autoSku     = () => onChange({ ...product, sku: genSKU(product.name) });

  return (
    <div style={{
      background: T.bg,
      border: `1.5px solid ${open ? 'rgba(255,59,48,0.2)' : T.border}`,
      borderRadius: T.radius.xl,
      padding: '16px 18px',
      marginBottom: 10,
      boxShadow: open ? T.shadow.cardHover : T.shadow.card,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Number badge */}
          <div style={{
            width: 34, height: 34, borderRadius: T.radius.md,
            background: open ? T.accent : 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: T.font.base, fontWeight: 900, color: open ? '#fff' : T.subtle }}>{idx + 1}</span>
          </div>
          <div>
            <div style={{ fontSize: T.font.base, fontWeight: 800, color: T.text, letterSpacing: '-0.2px' }}>
              {product.name || `Produit ${idx + 1}`}
            </div>
            {product.price > 0 && (
              <div style={{ fontSize: T.font.xs, color: T.muted, fontWeight: 600, marginTop: 1 }}>
                {fmtPrice(product.price)} CFA
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onRemove && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{
                width: 30, height: 30, borderRadius: T.radius.sm,
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#EF4444', padding: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
            >
              <Ic d={I.trash} size={13} stroke="#EF4444" sw={1.8} />
            </button>
          )}
          <div style={{
            color: T.muted,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'flex',
          }}>
            <Ic d={I.right} size={14} sw={2} />
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18, borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>

          {/* Nom */}
          <div>
            <Label required>Nom du produit</Label>
            <Input placeholder="Ex: T-shirt Dakar Classic" value={product.name}
              onChange={e => onChange({ ...product, name: e.target.value })} />
          </div>

          {/* Description */}
          <div>
            <Label required>Description</Label>
            <Textarea placeholder="Décris le produit, la matière, la coupe..." value={product.description}
              onChange={e => onChange({ ...product, description: e.target.value })} />
          </div>

          {/* Prix + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label required>Prix (CFA)</Label>
              <Input type="number" min={0} placeholder="15000" value={product.price || ''}
                onChange={e => onChange({ ...product, price: +e.target.value })} />
            </div>
            <div>
              <Label required>Stock</Label>
              <Input type="number" min={0} placeholder="10" value={product.stock || ''}
                onChange={e => onChange({ ...product, stock: +e.target.value })} />
            </div>
          </div>

          {/* SKU */}
          <div>
            <Label>SKU</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input placeholder="Ex: DK01-TEE-BLK" value={product.sku} style={{ flex: 1 }}
                onChange={e => onChange({ ...product, sku: e.target.value })} />
              <button type="button" onClick={autoSku} style={{
                padding: '0 16px', borderRadius: T.radius.md,
                border: `1.5px solid ${T.border}`,
                background: T.surface, fontSize: T.font.sm,
                fontWeight: 700, color: T.subtle, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'background 0.15s, border-color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.borderColor = T.borderMed; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.border; }}
              >
                Auto
              </button>
            </div>
            <Hint>Identifiant unique du produit (généré automatiquement si vide)</Hint>
          </div>

          {/* Photos */}
          <div>
            <Label required>Photos</Label>
            <Hint>{product.images.length}/5 images — Clique sur une image pour la définir en principale</Hint>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
              {previews.map((src, i) => (
                <div key={i} className="prod-img-wrap" style={{
                  position: 'relative', width: 80, height: 80,
                  borderRadius: T.radius.md, overflow: 'hidden', flexShrink: 0, background: '#F5F5F5',
                  boxShadow: i === 0 ? `0 0 0 2.5px ${T.accent}, ${T.shadow.img}` : T.shadow.img,
                  cursor: i === 0 ? 'default' : 'pointer',
                  transition: 'box-shadow 0.15s',
                }} onClick={() => setMainImg(i)}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

                  {/* Overlay "Définir" au hover sur les non-principales */}
                  {i !== 0 && (
                    <div className="prod-img-set-main" style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.52)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.4px', textAlign: 'center', lineHeight: 1.3 }}>
                        DÉFINIR<br />PRINCIPALE
                      </span>
                    </div>
                  )}

                  {/* Badge principale */}
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(255,59,48,0.85))',
                      padding: '4px 0 3px', textAlign: 'center',
                      fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.5px',
                    }}>PRINCIPALE</div>
                  )}

                  {/* Bouton supprimer */}
                  <button type="button" onClick={e => { e.stopPropagation(); removeImg(i); }} style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 20, height: 20, borderRadius: T.radius.pill,
                    background: 'rgba(0,0,0,0.55)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                  }}>
                    <Ic d={I.close} size={10} stroke="#fff" sw={2.5} />
                  </button>
                </div>
              ))}

              {product.images.length < 5 && (
                <>
                  <button type="button" onClick={() => inputRefs.current.gallery?.click()} style={{
                    width: 80, height: 80, borderRadius: T.radius.md,
                    border: `2px dashed rgba(0,0,0,0.14)`,
                    background: T.surface, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 4, color: T.muted, flexShrink: 0,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = 'rgba(255,59,48,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'; e.currentTarget.style.background = T.surface; }}
                  >
                    <Ic d={I.img} size={20} stroke="currentColor" />
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Galerie</span>
                  </button>

                  {isMobile && (
                    <button type="button" onClick={() => inputRefs.current.camera?.click()} style={{
                      width: 80, height: 80, borderRadius: T.radius.md,
                      border: `2px dashed rgba(0,0,0,0.14)`,
                      background: T.surface, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 4, color: T.muted, flexShrink: 0,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = 'rgba(255,59,48,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'; e.currentTarget.style.background = T.surface; }}
                    >
                      <Ic d={['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0']} size={20} stroke="currentColor" />
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Caméra</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Hidden file inputs — unified ref object */}
            <input
              ref={el => { inputRefs.current.gallery = el; }}
              type="file" accept="image/*" multiple
              style={{ display: 'none' }}
              onChange={e => addImages(e.target.files, e.target)}
            />
            <input
              ref={el => { inputRefs.current.camera = el; }}
              type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }}
              onChange={e => addImages(e.target.files, e.target)}
            />
          </div>

          {/* Tailles */}
          <div>
            <Label required>Tailles disponibles</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {SIZES.map(s => {
                const sel = product.sizes.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSize(s)} style={{
                    padding: '6px 14px', borderRadius: T.radius.md,
                    border: `1.5px solid ${sel ? T.accent : T.border}`,
                    background: sel ? T.accent : T.surface,
                    color: sel ? '#fff' : T.subtle,
                    fontSize: T.font.sm, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    letterSpacing: '-0.1px',
                  }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.subtle; } }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <Label required>Couleurs disponibles</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {COLORS.map(c => {
                const sel = product.colors.includes(c.value);
                return (
                  <div
                    key={c.value}
                    title={c.name}
                    onClick={() => toggleColor(c.value)}
                    style={{
                      width: 32, height: 32, borderRadius: T.radius.pill,
                      background: c.value,
                      border: sel
                        ? `2.5px solid ${T.accent}`
                        : c.value === '#FFFFFF'
                          ? '2px solid rgba(0,0,0,0.15)'
                          : '2px solid transparent',
                      boxShadow: sel ? `0 0 0 2px rgba(255,59,48,0.2)` : 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    {sel && (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <Ic d={I.check} size={14} stroke="#fff" sw={2.5} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── StepProducts ─────────────────────────────────────────────────────────────
export function StepProducts({ products, openProducts, productRefs, onToggle, onUpdate, onRemove, onAdd }: {
  products: WizardProductDraft[];
  openProducts: Set<number>;
  productRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onToggle: (idx: number) => void;
  onUpdate: (idx: number, p: WizardProductDraft) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Étape 1 sur 3
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: T.text, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Ajoute tes{' '}
            <span style={{ color: T.accent }}>produits.</span>
          </h2>
          <div style={{
            flexShrink: 0, padding: '5px 14px', borderRadius: T.radius.pill,
            background: 'linear-gradient(135deg, rgba(255,59,48,0.08) 0%, rgba(255,59,48,0.04) 100%)',
            border: `1px solid rgba(255,59,48,0.16)`,
            fontSize: T.font.sm, fontWeight: 800, color: T.accent,
            letterSpacing: '-0.2px', whiteSpace: 'nowrap', marginTop: 4,
          }}>
            {products.length} produit{products.length > 1 ? 's' : ''}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.muted, fontWeight: 500, lineHeight: 1.6, maxWidth: 520 }}>
          Chaque produit a sa propre fiche — photo, prix, tailles, couleurs. Plus ta fiche est complète, plus tes clients auront confiance avant d&apos;acheter.
        </p>
      </div>

      {/* Product cards */}
      {products.map((p, idx) => (
        <div key={idx} ref={el => { productRefs.current[idx] = el; }}>
          <ProductFormPanel
            product={p}
            idx={idx}
            open={openProducts.has(idx)}
            onToggle={() => onToggle(idx)}
            onChange={np => onUpdate(idx, np)}
            onRemove={products.length > 1 ? () => onRemove(idx) : undefined}
          />
        </div>
      ))}

      {/* Add product button */}
      <button
        type="button"
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, width: '100%',
          padding: '16px 18px', borderRadius: T.radius.xl, textAlign: 'left',
          border: `2px dashed rgba(255,59,48,0.18)`,
          background: 'transparent',
          cursor: 'pointer', marginTop: 4, fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = T.accent;
          e.currentTarget.style.background = 'rgba(255,59,48,0.025)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,59,48,0.18)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: T.radius.lg, flexShrink: 0,
          background: 'rgba(255,59,48,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px dashed rgba(255,59,48,0.22)`,
        }}>
          <Ic d={I.plus} size={20} stroke={T.accent} sw={2.5} />
        </div>
        <div>
          <div style={{ fontSize: T.font.md, fontWeight: 800, color: 'rgba(0,0,0,0.72)', letterSpacing: '-0.2px' }}>
            Ajouter un autre produit
          </div>
          <div style={{ fontSize: T.font.sm, color: T.muted, fontWeight: 500, marginTop: 2 }}>
            Chaque produit a ses propres photos, tailles et prix
          </div>
        </div>
      </button>
    </div>
  );
}
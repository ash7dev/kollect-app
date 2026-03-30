/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import type { WizardDraft, WizardProductDraft } from '@/types/drops';
import { useCreateCollection } from '@/hooks/dashboard/useCreateCollection';
import { usePersistedDraft } from '@/hooks/dashboard/usePersistedDraft';
import { getErrorMessage } from '@/services/api/client';
import { toast } from 'sonner';
import { genSKU } from './wizard-styles';
import { DateTimePicker } from './DateTimePicker';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'UNIQUE'];

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

const PRODUCT_TYPES = [
  { value: 'TSHIRT', label: 'T-shirt / Top' },
  { value: 'BONNET', label: 'Bonnet / Casquette' },
  { value: 'SAC', label: 'Sac' },
  { value: 'ENSEMBLE', label: 'Ensemble' },
  { value: 'ACCESSOIRE', label: 'Accessoire' },
];

const PRODUCT_GENDERS = [
  { value: 'HOMME', label: 'Homme' },
  { value: 'FEMME', label: 'Femme' },
  { value: 'UNISEXE', label: 'Unisex' },
];

// Configuration des champs selon le type de produit
const PRODUCT_TYPE_FIELDS = {
  TSHIRT: {
    showSizes: true,
    showColors: true,
    showWeight: false,
    showDescription: true,
    sizeLabel: 'Tailles disponibles',
    colorLabel: 'Couleurs disponibles',
  },
  BONNET: {
    showSizes: false,
    showColors: true,
    showWeight: false,
    showDescription: true,
    sizeLabel: 'Taille unique',
    colorLabel: 'Couleur principale',
  },
  SAC: {
    showSizes: false,
    showColors: true,
    showWeight: true,
    showDescription: true,
    sizeLabel: 'Dimensions',
    colorLabel: 'Couleurs',
  },
  ENSEMBLE: {
    showSizes: true,
    showColors: true,
    showWeight: false,
    showDescription: true,
    sizeLabel: 'Tailles (ex: Haut S + Bas M)',
    colorLabel: 'Couleurs dominantes',
  },
  ACCESSOIRE: {
    showSizes: false,
    showColors: true,
    showWeight: false,
    showDescription: true,
    sizeLabel: 'Taille',
    colorLabel: 'Couleurs',
  },
} as const;

// ─── Icons ───────────────────────────────────────────────────────────────────

function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.5 }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const IC = {
  arrow_left:  'M19 12H5M12 5l-7 7 7 7',
  chevron_down: 'M6 9l6 6 6-6',
  plus:         ['M12 5v14', 'M5 12h14'],
  trash:        ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'],
  upload:       ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  x:            'M18 6 6 18M6 6l12 12',
  check:        'M20 6L9 17l-5-5',
  rocket:       'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  layers:       ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  img:          ['M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  clock:        ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  tag:          'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z',
  info:         ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 8h.01', 'M12 12v4'],
  star:         'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  video:        ['M23 7l-7 5 7 5V7z', 'M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#E63329',
          borderRadius: '50%', animation: 'wz2-spin 0.75s linear infinite',
        }} />
        {message && <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>{message}</p>}
      </div>
      <style>{`@keyframes wz2-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function emptyProduct(): WizardProductDraft {
  return { 
    name: '', 
    description: '', 
    price: 0, 
    stock: 10, 
    sku: '', 
    sizes: [], 
    colors: [], 
    images: [],
    productType: '',
    gender: '',
    weight: undefined
  };
}

function initDraft(): WizardDraft {
  return { name: '', description: '', isFeatured: false, mode: 'disponible', launchDate: '', collectionMedia: null, products: [emptyProduct()] };
}

// ─── Field ────────────────────────────────────────────────────────────────────

const baseInput: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #E5E7EB', background: '#F9FAFB',
  fontSize: 14, fontFamily: 'inherit', color: '#111',
  outline: 'none', transition: 'border-color 0.15s, background 0.15s',
};

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.3px' }}>
        {label}{required && <span style={{ color: '#E63329', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error
        ? <p style={{ fontSize: 11.5, color: '#E63329', fontWeight: 500, margin: 0 }}>{error}</p>
        : hint
          ? <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>{hint}</p>
          : null}
    </div>
  );
}

// ─── Color Swatches ───────────────────────────────────────────────────────────

function ColorSwatches({ selected, onChange }: { selected: string[]; onChange: (c: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(c => c !== v) : [...selected, v]);
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {COLORS.map(c => {
          const sel = selected.includes(c.value);
          return (
            <div key={c.value} title={c.name} onClick={() => toggle(c.value)} style={{
              width: 32, height: 32, borderRadius: 999, background: c.value, cursor: 'pointer',
              border: sel ? '2.5px solid #E63329' : c.value === '#FFFFFF' ? '2px solid rgba(0,0,0,0.15)' : '2px solid transparent',
              boxShadow: sel ? '0 0 0 3px rgba(230,51,41,0.18)' : '0 1px 3px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.12s',
              flexShrink: 0, transform: sel ? 'scale(1.1)' : 'scale(1)',
            }}>
              {sel && (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.18)' }}>
                  <Ic d={IC.check} size={14} stroke={['#FFFFFF','#FFCC00','#F4E9D8'].includes(c.value) ? '#333' : '#fff'} sw={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {selected.map(hex => (
              <div key={hex} style={{
                width: 14, height: 14, borderRadius: 999, background: hex,
                border: hex === '#FFFFFF' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.08)',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, fontWeight: 500 }}>
            {selected.length} couleur{selected.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Product Form Card ─────────────────────────────────────────────────────────

function ProductFormCard({
  product, index, open, onToggle, onChange, onRemove, showRemove,
}: {
  product: WizardProductDraft;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (p: WizardProductDraft) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(() =>
    product.images.map(f => URL.createObjectURL(f)),
  );

  useEffect(() => {
    return () => previews.forEach(u => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset conditional fields when product type changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!product.productType) return;
    
    const fields = PRODUCT_TYPE_FIELDS[product.productType as keyof typeof PRODUCT_TYPE_FIELDS];
    if (!fields) return;

    // Create a copy of product to avoid dependency issues
    const currentProduct = { ...product };

    // Reset sizes if not shown for this product type
    if (!fields.showSizes && currentProduct.sizes.length > 0) {
      onChange({ ...currentProduct, sizes: [] });
    }
    
    // Reset colors if not shown for this product type
    if (!fields.showColors && currentProduct.colors.length > 0) {
      onChange({ ...currentProduct, colors: [] });
    }
    
    // Reset weight if not shown for this product type
    if (!fields.showWeight && currentProduct.weight !== undefined) {
      onChange({ ...currentProduct, weight: undefined });
    }
  }, [product.productType]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 5 - product.images.length);
    if (!valid.length) return;
    const newPreviews = valid.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    onChange({ ...product, images: [...product.images, ...valid].slice(0, 5) });
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setPreviews(prev => prev.filter((_, j) => j !== i));
    onChange({ ...product, images: product.images.filter((_, j) => j !== i) });
  };

  const toggleSize  = (s: string) => onChange({ ...product, sizes:  product.sizes.includes(s)  ? product.sizes.filter(x => x !== s)  : [...product.sizes, s] });

  const fmtPrice = product.price > 0 ? new Intl.NumberFormat('fr-FR').format(product.price) + ' FCFA' : null;
  const isComplete = product.name.trim() && product.price > 0 && product.images.length > 0;

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1.5px solid ${open ? '#E5E7EB' : '#F0F0F0'}`,
      boxShadow: open
        ? '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)'
        : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        {/* Number badge */}
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: open ? '#0A0A0A' : '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}>
          {isComplete && !open ? (
            <Ic d={IC.check} size={15} stroke="#10B981" sw={2.5} />
          ) : (
            <span style={{ fontSize: 13, fontWeight: 900, color: open ? '#fff' : '#6B7280' }}>{index + 1}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700, color: '#0A0A0A',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {product.name.trim() || `Produit ${index + 1}`}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9CA3AF', fontWeight: 500 }}>
            {fmtPrice ? fmtPrice : 'Prix non défini'}
            {product.sizes.length > 0 && ` · ${product.sizes.join(', ')}`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Complete badge */}
          {isComplete && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
              background: '#D1FAE5', color: '#065F46',
            }}>Complet</span>
          )}
          {showRemove && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{
                width: 30, height: 30, borderRadius: 9,
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
            >
              <Ic d={IC.trash} size={12} stroke="#EF4444" sw={1.8} />
            </button>
          )}
          <div style={{
            color: '#9CA3AF', transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s', display: 'flex',
          }}>
            <Ic d={IC.chevron_down} size={15} sw={2} />
          </div>
        </div>
      </div>

      {/* Expanded form */}
      {open && (
        <div style={{
          borderTop: '1px solid #F0F0F0', padding: '24px 20px',
          display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20,
        }}
          className="wz2-product-grid"
        >
          {/* Left: fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Infos générales */}
            <div style={{ padding: '20px', background: '#FAFAFA', borderRadius: 14, border: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 3, height: 12, borderRadius: 2, background: '#E63329', display: 'inline-block' }} />
                Informations
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <Field label="Nom du produit" required>
                  <input type="text" className="wz2-input" placeholder="ex. Jacket Oversize Dakar"
                    style={baseInput} value={product.name}
                    onChange={e => onChange({ ...product, name: e.target.value })}
                    maxLength={100}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Prix" required>
                    <div style={{ position: 'relative' }}>
                      <input type="number" min={0} className="wz2-input" placeholder="15000"
                        style={{ ...baseInput, paddingRight: 54 }}
                        value={product.price || ''}
                        onChange={e => onChange({ ...product, price: +e.target.value })}
                      />
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 800, color: '#9CA3AF', pointerEvents: 'none' }}>FCFA</span>
                    </div>
                  </Field>
                  <Field label="Stock">
                    <input type="number" min={0} className="wz2-input" placeholder="10"
                      style={baseInput} value={product.stock || ''}
                      onChange={e => onChange({ ...product, stock: +e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Description" hint="Optionnel">
                  <textarea className="wz2-input" placeholder="Matières, coupe, inspirations…"
                    style={{ ...baseInput, resize: 'vertical', minHeight: 80 }}
                    value={product.description}
                    onChange={e => onChange({ ...product, description: e.target.value })}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Type de produit" required>
                    <select
                      className="wz2-input"
                      style={baseInput}
                      value={product.productType || ''}
                      onChange={e => onChange({ ...product, productType: e.target.value })}
                    >
                      <option value="">Choisir un type</option>
                      {PRODUCT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Genre" required>
                    <select
                      className="wz2-input"
                      style={baseInput}
                      value={product.gender || ''}
                      onChange={e => onChange({ ...product, gender: e.target.value })}
                    >
                      <option value="">Choisir un genre</option>
                      {PRODUCT_GENDERS.map(gender => (
                        <option key={gender.value} value={gender.value}>{gender.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="SKU" hint="Optionnel — généré automatiquement si vide">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" className="wz2-input" placeholder="DK01-TEE-BLK"
                      style={{ ...baseInput, flex: 1 }} value={product.sku}
                      onChange={e => onChange({ ...product, sku: e.target.value })}
                    />
                    <button type="button" className="wz2-auto-btn"
                      onClick={() => onChange({ ...product, sku: genSKU(product.name) })}>
                      Auto
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* Variantes */}
            {product.productType && (
              <div style={{ padding: '20px', background: '#FAFAFA', borderRadius: 14, border: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 3, height: 12, borderRadius: 2, background: '#6366F1', display: 'inline-block' }} />
                  Variantes
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {(() => {
                    const fields = PRODUCT_TYPE_FIELDS[product.productType as keyof typeof PRODUCT_TYPE_FIELDS];
                    if (!fields) return null;

                    return (
                      <>
                        {fields.showSizes && (
                          <Field label={fields.sizeLabel} required hint="Obligatoire — sélectionne au moins une taille">
                            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 2 }}>
                              {SIZES.map(s => {
                                const sel = product.sizes.includes(s);
                                return (
                                  <button key={s} type="button" className="wz2-size-chip"
                                    data-active={sel ? 'true' : 'false'}
                                    onClick={() => toggleSize(s)}>
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </Field>
                        )}
                        
                        {fields.showColors && (
                          <Field label={fields.colorLabel} required hint="Obligatoire — sélectionne au moins une couleur">
                            <div style={{ marginTop: 4 }}>
                              <ColorSwatches selected={product.colors} onChange={c => onChange({ ...product, colors: c })} />
                            </div>
                          </Field>
                        )}

                        {fields.showWeight && (
                          <Field label="Poids (g)" required hint="Obligatoire pour ce type de produit">
                            <input type="number" min={0} className="wz2-input" placeholder="250"
                              style={baseInput} value={product.weight || ''}
                              onChange={e => onChange({ ...product, weight: +e.target.value })}
                            />
                          </Field>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Right: photos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '20px', background: '#FAFAFA', borderRadius: 14, border: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#9CA3AF', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 3, height: 12, borderRadius: 2, background: '#10B981', display: 'inline-block' }} />
                Photos
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'none', letterSpacing: '0.2px', color: '#D1D5DB' }}>
                  {previews.length}/5
                </span>
              </p>

              {/* Dropzone */}
              <div
                className="wz2-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#F3F4F6', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 10px',
                }}>
                  <Ic d={IC.upload} size={20} stroke="#9CA3AF" sw={1.8} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 3px' }}>
                  Clique ou glisse ici
                </p>
                <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
                  PNG · JPG · WEBP — 5 max
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple
                  style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)} />
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                  {previews.map((url, i) => (
                    <div key={url} className="wz2-img-thumb" style={{ gridColumn: i === 0 ? 'span 3' : undefined, aspectRatio: i === 0 ? '16/9' : '1' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {i === 0 && (
                        <span style={{
                          position: 'absolute', bottom: 5, left: 5,
                          padding: '2px 7px', borderRadius: 5,
                          background: 'rgba(230,51,41,0.85)',
                          fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#fff',
                        }}>Principale</span>
                      )}
                      <button type="button" className="wz2-img-rm"
                        onClick={e => { e.stopPropagation(); removeImage(i); }}>
                        <Ic d={IC.x} size={9} stroke="#fff" sw={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hint */}
            <div style={{
              display: 'flex', gap: 8, padding: '12px 14px',
              background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12,
            }}>
              <Ic d={IC.info} size={14} stroke="#0EA5E9" sw={2} />
              <p style={{ fontSize: 11.5, color: '#0369A1', lineHeight: 1.5, margin: 0 }}>
                Minimum 1 photo requise. La première sera la photo principale.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Products ─────────────────────────────────────────────────────────

function StepProducts({
  products, openProducts, productRefs,
  onToggle, onUpdate, onRemove, onAdd,
}: {
  products: WizardProductDraft[];
  openProducts: Set<number>;
  productRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onToggle: (i: number) => void;
  onUpdate: (i: number, p: WizardProductDraft) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.6px', marginBottom: 4 }}>
        Les produits du drop
      </h1>
      <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
        Ajoute autant de produits que tu veux. Chaque produit aura sa propre fiche, photos et variantes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map((p, idx) => (
          <div key={idx} ref={el => { productRefs.current[idx] = el; }}>
            <ProductFormCard
              product={p}
              index={idx}
              open={openProducts.has(idx)}
              onToggle={() => onToggle(idx)}
              onChange={np => onUpdate(idx, np)}
              onRemove={() => onRemove(idx)}
              showRemove={products.length > 1}
            />
          </div>
        ))}
      </div>

      {/* Add product button */}
      <button
        type="button"
        onClick={onAdd}
        className="wz2-add-product-btn"
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'rgba(230,51,41,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px dashed rgba(230,51,41,0.2)',
        }}>
          <Ic d={IC.plus} size={18} stroke="#E63329" sw={2.5} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#374151' }}>
            Ajouter un produit
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>
            Chaque produit a ses propres photos, tailles et prix
          </p>
        </div>
      </button>
    </div>
  );
}

// ─── Step 2: Collection info ──────────────────────────────────────────────────

function StepCollection({
  draft, setDraft,
}: {
  draft: WizardDraft;
  setDraft: React.Dispatch<React.SetStateAction<WizardDraft>>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [launchDate, setLaunchDate] = useState<Date>(() => {
    if (draft.launchDate) return new Date(draft.launchDate);
    const d = new Date(); d.setHours(d.getHours() + 24); return d;
  });
  const isTeaser = draft.mode === 'teaser';
  const mediaType = draft.collectionMedia?.type?.startsWith('video') ? 'video' : 'image';

  const handleFile = (file: File | null) => {
    if (!file) return;
    setDraft(d => ({ ...d, collectionMedia: file }));
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleDateChange = (d: Date) => {
    setLaunchDate(d);
    const iso = d.toISOString().slice(0, 16);
    setDraft(prev => ({ ...prev, launchDate: iso }));
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.6px', marginBottom: 4 }}>
        Habille ta collection
      </h1>
      <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
        Donne un nom fort à ton drop. C&apos;est ce que tes clients verront en premier.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}
        className="wz2-collection-grid">

        {/* Left: info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Identité */}
          <div className="wz2-card">
            <div className="wz2-card-title">
              <span className="wz2-card-bar" />
              Identité du drop
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Nom de la collection" required>
                <input type="text" className="wz2-input" placeholder='ex. "Dakar Summer 2025"'
                  style={baseInput} value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  maxLength={80}
                />
              </Field>
              <Field label="Description" required hint="Raconte l'histoire de ce drop">
                <textarea className="wz2-input" placeholder="L'inspiration, le style, le mood de cette collection…"
                  style={{ ...baseInput, resize: 'vertical', minHeight: 110 }}
                  value={draft.description}
                  onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                />
              </Field>
              <Field label="Mise en avant">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, isFeatured: !d.isFeatured }))}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: draft.isFeatured ? '#E63329' : '#E5E7EB',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 99, background: '#fff',
                      position: 'absolute', top: 3, left: draft.isFeatured ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                    Mettre ce drop en avant sur la page d&apos;accueil
                  </span>
                </div>
              </Field>
            </div>
          </div>

          {/* Mode de lancement */}
          <div className="wz2-card">
            <div className="wz2-card-title">
              <span className="wz2-card-bar" style={{ background: '#6366F1' }} />
              Mode de lancement
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Toggle buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {(['disponible', 'teaser'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDraft(d => ({ ...d, mode }))}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 12,
                      border: `1.5px solid ${draft.mode === mode ? '#0A0A0A' : '#E5E7EB'}`,
                      background: draft.mode === mode ? '#0A0A0A' : '#F9FAFB',
                      color: draft.mode === mode ? '#fff' : '#6B7280',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Ic d={mode === 'disponible' ? IC.check : IC.clock} size={18}
                      stroke={draft.mode === mode ? '#fff' : '#9CA3AF'} sw={1.8} />
                    <span>{mode === 'disponible' ? 'Disponible' : 'Teaser'}</span>
                    <span style={{ fontSize: 10.5, opacity: 0.65, fontWeight: 500 }}>
                      {mode === 'disponible' ? 'Livraison immédiate' : 'Pré-lancement programmé'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Date picker if teaser */}
              {isTeaser && (
                <div style={{ marginTop: 8 }}>
                  <Field label="Date et heure de lancement" required>
                    <DateTimePicker
                      value={launchDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: cover */}
        <div className="wz2-card" style={{ position: 'sticky', top: 76 }}>
          <div className="wz2-card-title">
            <span className="wz2-card-bar" style={{ background: '#10B981' }} />
            Visuel de couverture
            <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#D1D5DB' }}>Optionnel</span>
          </div>

          {/* Preview */}
          {(mediaPreview || draft.collectionMedia) ? (
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', background: '#0A0A0A', marginBottom: 12 }}>
              {mediaType === 'video' ? (
                <video src={mediaPreview ?? undefined} autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={mediaPreview ?? undefined} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button type="button"
                onClick={() => { setDraft(d => ({ ...d, collectionMedia: null })); setMediaPreview(null); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: 9, border: 'none',
                  background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <Ic d={IC.x} size={12} stroke="#fff" sw={2.5} />
              </button>
              <span style={{
                position: 'absolute', bottom: 8, left: 8,
                padding: '3px 8px', borderRadius: 6,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
              }}>
                {mediaType === 'video' ? 'Vidéo' : 'Image'}
              </span>
            </div>
          ) : (
            <div
              className="wz2-dropzone"
              style={{ marginBottom: 12, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null); }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ic d={IC.img} size={20} stroke="#9CA3AF" sw={1.8} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 3px' }}>Ajouter un visuel</p>
              <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>Photo ou vidéo teaser</p>
            </div>
          )}

          <button type="button" className="wz2-outline-btn" onClick={() => fileRef.current?.click()}>
            <Ic d={IC.upload} size={13} stroke="currentColor" sw={2} />
            {draft.collectionMedia ? 'Changer le visuel' : 'Choisir un fichier'}
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files?.[0] ?? null)} />

          <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 8, lineHeight: 1.5 }}>
            Ce visuel apparaîtra sur la page de ta collection et sur la page d&apos;accueil si le drop est mis en avant.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────

function StepConfirmation({ draft }: { draft: WizardDraft }) {
  const totalValue = draft.products.reduce((s, p) => s + p.price * p.stock, 0);
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.6px', marginBottom: 4 }}>
        Dernière vérification
      </h1>
      <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
        Tout est bon ? Lance le drop.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Collection card */}
        <div className="wz2-card">
          <div className="wz2-card-title">
            <span className="wz2-card-bar" />
            Collection
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {draft.collectionMedia ? (
              <div style={{ width: 80, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#0A0A0A' }}>
                <img src={URL.createObjectURL(draft.collectionMedia)} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ width: 80, height: 60, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic d={IC.layers} size={22} stroke="#D1D5DB" sw={1.5} />
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0A0A0A' }}>{draft.name || '—'}</p>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{draft.description || '—'}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#F3F4F6', color: '#6B7280' }}>
                  {draft.mode === 'teaser' ? 'Teaser' : 'Disponible'}
                </span>
                {draft.isFeatured && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#FEF3C7', color: '#92400E' }}>
                    Mis en avant
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products summary */}
        <div className="wz2-card">
          <div className="wz2-card-title">
            <span className="wz2-card-bar" style={{ background: '#6366F1' }} />
            {draft.products.length} produit{draft.products.length > 1 ? 's' : ''}
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>
              · Valeur stock estimée : {fmt(totalValue)} FCFA
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {draft.products.map((p, i) => {
              const img = p.images[0] ? URL.createObjectURL(p.images[0]) : null;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px', borderRadius: 12, background: '#FAFAFA', border: '1px solid #F0F0F0',
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#0A0A0A' }}>
                    {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ic d={IC.img} size={18} stroke="rgba(255,255,255,0.3)" sw={1.2} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name || `Produit ${i + 1}`}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#9CA3AF' }}>
                      {p.price > 0 ? fmt(p.price) + ' FCFA' : 'Prix non défini'}
                      {p.sizes.length > 0 && ` · ${p.sizes.join(', ')}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {p.colors.slice(0, 4).map(hex => (
                      <div key={hex} style={{
                        width: 14, height: 14, borderRadius: 99, background: hex,
                        border: hex === '#FFFFFF' ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(0,0,0,0.08)',
                      }} />
                    ))}
                  </div>
                  {p.images.length === 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#FEE2E2', color: '#991B1B' }}>
                      Pas de photo
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DropsWizardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { checking } = useOnboardingGuard();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { draft, setDraft, step, setStep, clearPersisted } = usePersistedDraft(initDraft);
  const [error, setError] = useState<string | null>(null);
  const [openProducts, setOpenProducts] = useState<Set<number>>(new Set([0]));
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const createMutation = useCreateCollection();
  const submitting = createMutation.isPending;

  const reset = useCallback(() => {
    setStep(1); setDraft(initDraft()); setError(null); setOpenProducts(new Set([0])); clearPersisted();
  }, [clearPersisted, setDraft, setStep]);

  const handleCancel = () => { reset(); router.push('/dashboard/drops'); };

  const toggleProduct = (idx: number) => {
    setOpenProducts(s => { const ns = new Set(s); ns.has(idx) ? ns.delete(idx) : ns.add(idx); return ns; });
  };
  const updateProduct = (idx: number, p: WizardProductDraft) => {
    setDraft(d => { const prods = [...d.products]; prods[idx] = p; return { ...d, products: prods }; });
  };
  const removeProduct = (idx: number) => {
    setDraft(d => ({ ...d, products: d.products.filter((_, i) => i !== idx) }));
    setOpenProducts(s => { const ns = new Set([...s].map(i => i > idx ? i - 1 : i)); ns.delete(idx); return ns; });
  };
  const addProduct = () => {
    const newIdx = draft.products.length;
    setDraft(d => ({ ...d, products: [...d.products, emptyProduct()] }));
    setOpenProducts(s => new Set([...s, newIdx]));
    setTimeout(() => { productRefs.current[newIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  };

  const canProceed = () => {
    if (step === 1) return draft.products.length > 0 && draft.products.every(
      p => {
        if (!p.name.trim() || !p.productType || !p.gender || p.price <= 0 || p.images.length === 0) return false;
        
        const fields = PRODUCT_TYPE_FIELDS[p.productType as keyof typeof PRODUCT_TYPE_FIELDS];
        if (!fields) return false;
        
        if (fields.showSizes && p.sizes.length === 0) return false;
        if (fields.showColors && p.colors.length === 0) return false;
        if (fields.showWeight && (!p.weight || p.weight <= 0)) return false;
        
        return true;
      }
    );
    if (step === 2) {
      const base = !!draft.name.trim() && !!draft.description.trim();
      if (draft.mode === 'teaser') return base && !!draft.launchDate;
      return base;
    }
    return true;
  };

  const handleLaunch = async () => {
    setError(null);
    const products = draft.products.map(p => ({ ...p, sku: p.sku.trim() || genSKU(p.name) }));
    const toastId = toast.loading('Création du drop en cours…');
    try {
      await createMutation.mutateAsync({ ...draft, products });
      toast.success('Drop lancé avec succès !', { id: toastId, description: `"${draft.name}" est maintenant en ligne.`, duration: 5000 });
      reset();
      router.push('/dashboard/drops');
    } catch (e) {
      const msg = getErrorMessage(e);
      toast.error('Échec du lancement', { id: toastId, description: msg, duration: 6000 });
      setError(msg);
    }
  };

  const STEPS = [
    { label: 'Produits',    sub: 'Articles, photos et variantes' },
    { label: 'Collection',  sub: 'Nom, description et visuel' },
    { label: 'Confirmation', sub: 'Dernière vérification' },
  ];

  if (checking || isLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO)         return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wz2-layout {
          min-height: 100vh; display: grid; background: #FAFAFA;
          font-family: 'Inter', -apple-system, sans-serif;
          transition: grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .wz2-main { min-width: 0; display: flex; flex-direction: column; background: #FAFAFA; }

        /* Topbar */
        .wz2-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid #F0F0F0;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; gap: 14px;
        }
        .wz2-back-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #374151; flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .wz2-back-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }
        .wz2-back-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Step pills */
        .wz2-steps {
          display: flex; align-items: center; gap: 6px; margin-left: auto;
        }
        .wz2-step-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 99px;
          font-size: 12px; font-weight: 700;
          transition: all 0.2s;
        }
        .wz2-step-pill-num {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; flex-shrink: 0;
        }

        /* Content */
        .wz2-content {
          flex: 1; padding: 40px 32px 120px;
          max-width: 1060px; width: 100%; margin: 0 auto;
        }

        /* Cards */
        .wz2-card {
          background: #fff; border: 1px solid #F0F0F0;
          border-radius: 20px; padding: 24px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
        }
        .wz2-card-title {
          font-size: 11px; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: #9CA3AF;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }
        .wz2-card-bar {
          display: inline-block; width: 3px; height: 14px;
          border-radius: 2px; background: #E63329; flex-shrink: 0;
        }

        /* Inputs */
        .wz2-input:focus {
          border-color: #0A0A0A !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06) !important;
        }

        .wz2-auto-btn {
          flex-shrink: 0; padding: 0 14px; height: 44px; border-radius: 12px;
          border: 1.5px solid #E5E7EB; background: #F9FAFB;
          font-family: inherit; font-size: 12px; font-weight: 700;
          color: #6B7280; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .wz2-auto-btn:hover { background: #F3F4F6; border-color: #D1D5DB; color: #374151; }

        /* Size chips */
        .wz2-size-chip {
          padding: 7px 12px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-family: inherit; font-size: 12px; font-weight: 700; color: #6B7280;
          cursor: pointer; transition: all 0.15s;
        }
        .wz2-size-chip:hover { border-color: #0A0A0A; color: #0A0A0A; }
        .wz2-size-chip[data-active="true"] { background: #0A0A0A; border-color: #0A0A0A; color: #fff; }

        /* Dropzone */
        .wz2-dropzone {
          border: 2px dashed #E5E7EB; border-radius: 14px;
          padding: 24px 16px; text-align: center;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          background: #FAFAFA;
        }
        .wz2-dropzone:hover { border-color: #0A0A0A; background: #F9FAFB; }

        /* Image thumbs */
        .wz2-img-thumb {
          border-radius: 10px; overflow: hidden;
          position: relative; background: #F3F4F6;
          border: 1.5px solid #E5E7EB;
        }
        .wz2-img-rm {
          position: absolute; top: 5px; right: 5px;
          width: 22px; height: 22px; border-radius: 7px;
          border: none; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.15s;
        }
        .wz2-img-thumb:hover .wz2-img-rm { opacity: 1; }

        /* Add product button */
        .wz2-add-product-btn {
          width: 100%; display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: 18px; text-align: left;
          border: 2px dashed rgba(230,51,41,0.18); background: transparent;
          cursor: pointer; font-family: inherit; margin-top: 12px;
          transition: border-color 0.15s, background 0.15s;
        }
        .wz2-add-product-btn:hover {
          border-color: #E63329;
          background: rgba(230,51,41,0.025);
        }

        /* Product grid (2 cols inside card) */
        .wz2-product-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .wz2-collection-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }

        /* Outline button */
        .wz2-outline-btn {
          width: 100%; padding: 10px; border-radius: 11px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #374151; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background 0.15s, border-color 0.15s;
        }
        .wz2-outline-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }

        /* Bottom bar */
        .wz2-bottombar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: rgba(255,255,255,0.96); backdrop-filter: blur(16px);
          border-top: 1px solid #F0F0F0;
          padding: 16px 32px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .wz2-btn-cancel {
          padding: 12px 22px; border-radius: 12px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          color: #374151; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .wz2-btn-cancel:hover { background: #F3F4F6; border-color: #D1D5DB; }
        .wz2-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .wz2-btn-next {
          padding: 12px 24px; border-radius: 12px;
          border: none; background: #0A0A0A;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .wz2-btn-next:hover:not(:disabled) { background: #1A1A1A; transform: translateY(-1px); }
        .wz2-btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .wz2-btn-launch {
          padding: 12px 28px; border-radius: 12px;
          border: none; background: #E63329;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(230,51,41,0.35);
        }
        .wz2-btn-launch:hover:not(:disabled) { background: #CC2920; transform: translateY(-1px); }
        .wz2-btn-launch:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .wz2-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: wz2-spin 0.65s linear infinite; flex-shrink: 0;
        }

        @keyframes wz2-spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .wz2-product-grid { grid-template-columns: 1fr; }
          .wz2-collection-grid { grid-template-columns: 1fr; }
          .wz2-content { padding: 24px 20px 120px; }
          .wz2-bottombar { padding: 14px 20px; }
          .wz2-topbar { padding: 0 20px; }
        }
      `}</style>

      <div
        className="wz2-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr` }}
      >
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="drops"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview') router.push('/dashboard');
            else if (section === 'drops') router.push('/dashboard/drops');
            else if (section === 'products') router.push('/dashboard/produits');
            else router.push('/dashboard');
          }}
          brandName={user?.brand?.name ?? undefined}
          userInitials={((user?.firstName ?? user?.email ?? 'C')[0]).toUpperCase()}
          userEmail={user?.email ?? undefined}
          notificationCount={0}
        />

        <div className="wz2-main">

          {/* Topbar */}
          <div className="wz2-topbar">
            <button
              type="button"
              className="wz2-back-btn"
              onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : handleCancel()}
              disabled={submitting}
            >
              <Ic d={IC.arrow_left} size={15} sw={2} />
            </button>
            <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Drops</span>
            <span style={{ color: '#D1D5DB', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>
              Nouveau drop
            </span>

            {/* Step pills */}
            <div className="wz2-steps">
              {STEPS.map((s, i) => {
                const n = i + 1;
                const isActive = n === step;
                const isDone = n < step;
                return (
                  <div key={n} className="wz2-step-pill" style={{
                    background: isActive ? '#0A0A0A' : isDone ? '#D1FAE5' : 'transparent',
                  }}>
                    <div className="wz2-step-pill-num" style={{
                      background: isActive ? '#E63329' : isDone ? '#10B981' : '#F3F4F6',
                      color: isActive || isDone ? '#fff' : '#9CA3AF',
                    }}>
                      {isDone ? <Ic d={IC.check} size={11} stroke="#fff" sw={2.5} /> : n}
                    </div>
                    <span style={{ color: isActive ? '#fff' : isDone ? '#065F46' : '#9CA3AF' }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="wz2-content">
            {step === 1 && (
              <StepProducts
                products={draft.products}
                openProducts={openProducts}
                productRefs={productRefs}
                onToggle={toggleProduct}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                onAdd={addProduct}
              />
            )}
            {step === 2 && <StepCollection draft={draft} setDraft={setDraft} />}
            {step === 3 && <StepConfirmation draft={draft} />}

            {error && (
              <div style={{
                marginTop: 16, padding: '14px 18px', borderRadius: 12,
                background: '#FEE2E2', border: '1px solid #FECACA',
                fontSize: 13, color: '#991B1B', fontWeight: 600,
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="wz2-bottombar">
            <button
              type="button"
              className="wz2-btn-cancel"
              onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : handleCancel()}
              disabled={submitting}
            >
              {step === 1 ? 'Annuler' : '← Précédent'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 5 }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{
                    height: 6, borderRadius: 99, transition: 'width 0.25s, background 0.2s',
                    width: n === step ? 20 : 6,
                    background: n < step ? '#10B981' : n === step ? '#E63329' : '#E5E7EB',
                  }} />
                ))}
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  className="wz2-btn-next"
                  onClick={() => setStep(s => (s + 1) as 2 | 3)}
                  disabled={!canProceed()}
                >
                  Suivant
                  <Ic d={IC.arrow_left} size={14} stroke="#fff" sw={2.5}
                    // rotate 180 for arrow right
                  />
                </button>
              ) : (
                <button
                  type="button"
                  className="wz2-btn-launch"
                  onClick={handleLaunch}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><div className="wz2-spinner" />Création…</>
                  ) : (
                    <><Ic d={IC.rocket} size={15} stroke="#fff" sw={1.8} />Lancer le drop</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

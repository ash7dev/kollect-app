/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { fetchCeoCollections } from '@/services/api/collections';
import type { CeoCollection, CollectionStatus } from '@/types/drops';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'UNIQUE'];

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

const COLORS: { value: string; name: string }[] = [
  // Nuances de noir / blanc / gris
  { name: 'Noir', value: '#000000' },
  { name: 'Noir charbon', value: '#1c1c1c' },
  { name: 'Gris très foncé', value: '#2f2f2f' },
  { name: 'Gris', value: '#808080' },
  { name: 'Gris clair', value: '#c2c2c2' },
  { name: 'Gris perle', value: '#d9d9d9' },
  { name: 'Blanc cassé', value: '#f5f5f5' },
  { name: 'Blanc', value: '#ffffff' },

  // Rouges / roses
  { name: 'Rouge', value: '#ff0000' },
  { name: 'Rouge foncé', value: '#8b0000' },
  { name: 'Bordeaux', value: '#800020' },
  { name: 'Rouge corail', value: '#ff4040' },
  { name: 'Rose', value: '#ff69b4' },
  { name: 'Vieux rose', value: '#c08081' },

  // Oranges / jaunes
  { name: 'Orange', value: '#ff8c00' },
  { name: 'Orange brûlé', value: '#cc5500' },
  { name: 'Saumon', value: '#fa8072' },
  { name: 'Jaune', value: '#ffff00' },
  { name: 'Jaune moutarde', value: '#ffdb58' },
  { name: 'Jaune pâle', value: '#fffacd' },

  // Verts
  { name: 'Vert', value: '#008000' },
  { name: 'Vert foncé', value: '#006400' },
  { name: 'Vert clair', value: '#90ee90' },
  { name: 'Vert menthe', value: '#98ff98' },
  { name: 'Kaki', value: '#78866b' },
  { name: 'Olive', value: '#808000' },

  // Bleus
  { name: 'Bleu', value: '#0000ff' },
  { name: 'Bleu ciel', value: '#87ceeb' },
  { name: 'Bleu clair', value: '#add8e6' },
  { name: 'Bleu marine', value: '#000080' },
  { name: 'Bleu pétrole', value: '#004f59' },
  { name: 'Turquoise', value: '#40e0d0' },

  // Violets
  { name: 'Violet', value: '#800080' },
  { name: 'Lavande', value: '#e6e6fa' },
  { name: 'Prune', value: '#6a0dad' },

  // Marrons / beiges
  { name: 'Marron', value: '#8b4513' },
  { name: 'Chocolat', value: '#5c3317' },
  { name: 'Beige', value: '#f5f5dc' },
  { name: 'Sable', value: '#f4a460' },

  // Métallisés
  { name: 'Doré', value: '#d4af37' },
  { name: 'Or rose', value: '#b76e79' },
  { name: 'Argent', value: '#c0c0c0' },
];

const STATUS_META: Record<CollectionStatus, { label: string; bg: string; color: string }> = {
  DISPONIBLE: { label: 'Disponible', bg: '#D1FAE5', color: '#065F46' },
  TEASER:     { label: 'Teaser',     bg: '#FEF3C7', color: '#92400E' },
  BROUILLON:  { label: 'Brouillon',  bg: '#F3F4F6', color: '#6B7280' },
  EPUISEE:    { label: 'Épuisée',    bg: '#FEE2E2', color: '#991B1B' },
  TERMINE:    { label: 'Terminée',   bg: '#F3F4F6', color: '#6B7280' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldError = Partial<Record<
  'collectionId' | 'productType' | 'gender' | 'name' | 'price' | 'stock' | 'images' | 'sizes' | 'colors' | 'weight',
  string
>>;

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

const ICONS = {
  arrow_left: 'M19 12H5M12 5l-7 7 7 7',
  layers:  ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  upload:  ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  x:       'M18 6 6 18M6 6l12 12',
  check:   'M20 6L9 17l-5-5',
  info:    ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 8h.01', 'M12 12v4'],
  chevron: 'M6 9l6 6 6-6',
  lock:    ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  box:     ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.27 6.96L12 12.01l8.73-5.05', 'M12 22.08V12'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#E63329',
          borderRadius: '50%', animation: 'ap-spin 0.75s linear infinite',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>{message}</p>
      </div>
      <style>{`@keyframes ap-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.3px' }}>
        {label}
        {required && <span style={{ color: '#E63329', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error ? (
        <p style={{ fontSize: 11.5, color: '#E63329', fontWeight: 500, margin: 0 }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>{hint}</p>
      ) : null}
    </div>
  );
}

const baseInput: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #E5E7EB', background: '#F9FAFB',
  fontSize: 14, fontFamily: 'inherit', color: '#111',
  outline: 'none', transition: 'border-color 0.15s, background 0.15s',
};
const errInput: React.CSSProperties = { ...baseInput, borderColor: '#FECACA', background: '#FFF5F5' };

// ─── Collection Picker ────────────────────────────────────────────────────────

function CollectionPicker({
  collections, loading, value, onChange, error, onCreateNew,
}: {
  collections: CeoCollection[];
  loading: boolean;
  value: string;
  onChange: (id: string) => void;
  error?: string;
  onCreateNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = collections.find(c => c.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 12,
          border: `1.5px solid ${error ? '#FECACA' : open ? '#0A0A0A' : '#E5E7EB'}`,
          background: error ? '#FFF5F5' : '#F9FAFB',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          transition: 'border-color 0.15s, background 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(10,10,10,0.06)' : 'none',
        }}
      >
        {selected ? (
          <>
            <div style={{
              width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: '#0A0A0A', overflow: 'hidden',
              border: '1.5px solid rgba(0,0,0,0.08)',
            }}>
              {selected.coverImage ? (
                <img src={selected.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic d={ICONS.box} size={16} stroke="rgba(255,255,255,0.4)" sw={1.2} />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected.name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                {selected._count?.products ?? 0} produit{(selected._count?.products ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <StatusPill status={selected.status} />
          </>
        ) : (
          <span style={{ fontSize: 13.5, color: '#9CA3AF', fontWeight: 500, flex: 1 }}>
            {loading ? 'Chargement…' : '— Choisir une collection —'}
          </span>
        )}
        <div style={{
          flexShrink: 0, color: '#9CA3AF',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          <Ic d={ICONS.chevron} size={15} sw={2} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden', animation: 'ap-dropdown 0.16s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Chargement…</div>
          ) : collections.length === 0 ? (
            <div style={{ padding: '20px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px', fontWeight: 500 }}>
                Aucune collection disponible.
              </p>
              <button
                type="button"
                onClick={() => { setOpen(false); onCreateNew(); }}
                style={{
                  padding: '9px 18px', borderRadius: 10,
                  background: '#0A0A0A', color: '#fff', border: 'none',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Créer un drop d&apos;abord
              </button>
            </div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto', padding: 6 }}>
              {collections.map(col => {
                const isSelected = col.id === value;
                const meta = STATUS_META[col.status];
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => { onChange(col.id); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 12,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      background: isSelected ? '#F3F4F6' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? '#F3F4F6' : 'transparent'; }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: '#0A0A0A', overflow: 'hidden',
                      border: isSelected ? '2px solid #E63329' : '1.5px solid rgba(0,0,0,0.07)',
                    }}>
                      {col.coverImage ? (
                        <img src={col.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Ic d={ICONS.layers} size={18} stroke="rgba(255,255,255,0.4)" sw={1.5} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 13.5, fontWeight: 700, color: '#111',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {col.name}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                        {col._count?.products ?? 0} produit{(col._count?.products ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Status + check */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px',
                        borderRadius: 99, background: meta.bg, color: meta.color,
                      }}>
                        {meta.label}
                      </span>
                      {isSelected && (
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, background: '#E63329',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Ic d={ICONS.check} size={11} stroke="#fff" sw={2.5} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: CollectionStatus }) {
  const meta = STATUS_META[status];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 8px',
      borderRadius: 99, background: meta.bg, color: meta.color,
      letterSpacing: '0.3px', flexShrink: 0,
    }}>
      {meta.label}
    </span>
  );
}

// ─── Locked Collection Display ─────────────────────────────────────────────────

function LockedCollectionDisplay({ collection }: { collection: CeoCollection }) {
  const meta = STATUS_META[collection.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 12,
      border: '1.5px solid #E5E7EB',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: '#0A0A0A', overflow: 'hidden',
        border: '1.5px solid rgba(0,0,0,0.08)',
      }}>
        {collection.coverImage ? (
          <img src={collection.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic d={ICONS.layers} size={16} stroke="rgba(255,255,255,0.4)" sw={1.2} />
          </div>
        )}
      </div>

      {/* Name + count */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {collection.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
          {collection._count?.products ?? 0} produit{(collection._count?.products ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status + lock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px',
          borderRadius: 99, background: meta.bg, color: meta.color,
        }}>
          {meta.label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: '#F3F4F6', border: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="Collection pré-sélectionnée depuis le drop">
          <Ic d={ICONS.lock} size={12} stroke="#9CA3AF" sw={2} />
        </div>
      </div>
    </div>
  );
}

// ─── Color Swatches ────────────────────────────────────────────────────────────

function ColorSwatches({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (colors: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(c => c !== value)
        : [...selected, value],
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {COLORS.map(c => {
          const isSelected = selected.includes(c.value);
          // Calculer une ombre dynamique basée sur la couleur
          const shadowColor = isSelected ? `${c.value}66` : 'rgba(0,0,0,0.1)';
          
          return (
            <div
              key={c.value}
              title={c.name}
              onClick={() => toggle(c.value)}
              className="ap-color-swatch"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: c.value,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isSelected ? '3px solid #E63329' : '2px solid transparent',
                boxShadow: isSelected 
                  ? `0 6px 16px ${shadowColor}` 
                  : '0 2px 4px rgba(0,0,0,0.08)',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                flexShrink: 0,
                // Bordure subtile pour le blanc
                ...(c.value === '#FFFFFF' && !isSelected ? { border: '1.5px solid #E5E7EB' } : {})
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: '50%',
                  color: 'white'
                }}>
                  <Ic d={ICONS.check} size={18} stroke="#fff" sw={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingLeft: 4 }}>
          <div style={{ display: 'flex', gap: -4 }}>
            {selected.map((hex, i) => (
              <div
                key={hex}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: hex,
                  border: '2px solid #fff',
                  marginLeft: i === 0 ? 0 : -6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: selected.length - i
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontWeight: 600 }}>
            {selected.length} couleur{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCollectionId = searchParams.get('collectionId') ?? '';
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const qc = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──
  const [collectionId, setCollectionId] = useState(prefilledCollectionId);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [productType, setProductType] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState('');

  // ── Collections ──
  const collectionsQuery = useQuery({
    queryKey: ['dashboard', 'collections', 'ceo'],
    queryFn: () => fetchCeoCollections(),
    enabled: !!user?.isCEO,
  });
  const collections = collectionsQuery.data?.data ?? [];
  const lockedCollection = prefilledCollectionId
    ? collections.find(c => c.id === prefilledCollectionId) ?? null
    : null;

  // ── Image previews ──
  useEffect(() => {
    const urls = images.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  // ── Validation ──
  const validate = useCallback((): FieldError => {
    const e: FieldError = {};
    if (!collectionId)                                              e.collectionId = 'Choisis une collection';
    if (!productType)                                             e.productType = 'Choisis un type de produit';
    if (!gender)                                                  e.gender = 'Choisis un genre';
    if (!name.trim() || name.trim().length < 3)                    e.name  = 'Nom trop court (3 car. min)';
    if (!price || isNaN(Number(price)) || Number(price) < 0)       e.price = 'Prix invalide';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) e.stock = 'Stock invalide';
    if (images.length === 0)                                        e.images = 'Ajoute au moins une photo';
    
    // Validation conditionnelle selon le type
    const fields = PRODUCT_TYPE_FIELDS[productType as keyof typeof PRODUCT_TYPE_FIELDS];
    if (fields?.showSizes && sizes.length === 0)                     e.sizes = 'Ajoute au moins une taille';
    if (fields?.showColors && colors.length === 0)                    e.colors = 'Ajoute au moins une couleur';
    if (fields?.showWeight && (!weight || isNaN(Number(weight))))        e.weight = 'Poids invalide';
    
    return e;
  }, [collectionId, productType, gender, name, price, stock, images, sizes, colors, weight]);

  const fieldError = (key: keyof FieldError) =>
    (submitted || touched.has(key)) ? errors[key] : undefined;

  const touch = (key: string) =>
    setTouched(prev => new Set(prev).add(key));

  useEffect(() => { setErrors(validate()); }, [validate]);

  // ── Reset conditional fields when product type changes ──
  useEffect(() => {
    if (!productType) return;
    
    const fields = PRODUCT_TYPE_FIELDS[productType as keyof typeof PRODUCT_TYPE_FIELDS];
    if (!fields) return;

    // Reset weight if not shown for this product type
    if (!fields.showWeight) {
      setWeight('');
    }

    // Reset sizes if not shown for this product type
    if (!fields.showSizes) {
      setSizes([]);
    }

    // Reset colors if not shown for this product type
    if (!fields.showColors) {
      setColors([]);
    }
  }, [productType]);

  // ── Submit ──
  const createMutation = useMutation({
    mutationFn: async () => {
      const dto = {
        collectionId,
        productType: productType || null,
        gender: gender || null,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        sizes: sizes.length ? sizes : ['UNIQUE'],
        colors,
        description: description.trim() || undefined,
        weight: weight ? Number(weight) : undefined,
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(dto));
      images.forEach((file, i) => fd.append(`image-${i}`, file, file.name));
      const { data } = await apiClient.post(API_ENDPOINTS.PRODUITS.CREATE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'produits', 'ceo'] });
      if (prefilledCollectionId) {
        await qc.invalidateQueries({ queryKey: ['dashboard', 'collections', 'ceo', prefilledCollectionId] });
      }
      toast.success('Produit publié avec succès');
      router.push(prefilledCollectionId
        ? `/dashboard/drops/${prefilledCollectionId}`
        : '/dashboard/produits');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Impossible de créer le produit');
    },
  });

  const handleSubmit = () => {
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error('Remplis les champs obligatoires');
      return;
    }
    createMutation.mutate();
  };

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...valid].slice(0, 6));
  };

  const removeImage = (idx: number) =>
    setImages(prev => prev.filter((_, i) => i !== idx));

  // ── Guards ──
  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO)            return <FullPageSpinner message="Accès réservé aux comptes CEO." />;

  const isSubmitting = createMutation.isPending;
  const hasErrors    = Object.keys(errors).length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-layout {
          min-height: 100vh; display: grid;
          background: #FAFAFA;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .ap-main { min-width: 0; display: flex; flex-direction: column; background: #FAFAFA; }

        .ap-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid #F0F0F0;
          padding: 0 32px; height: 60px;
          display: flex; align-items: center; gap: 14px;
        }
        .ap-back-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #374151; flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .ap-back-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }

        .ap-content {
          flex: 1; padding: 40px 32px 120px;
          max-width: 1060px; width: 100%; margin: 0 auto;
        }
        .ap-grid {
          display: grid; grid-template-columns: 1fr 400px;
          gap: 20px; align-items: start;
        }

        .ap-card {
          background: #fff; border: 1px solid #F0F0F0;
          border-radius: 20px; padding: 28px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
        }
        .ap-card + .ap-card { margin-top: 20px; }
        .ap-card-title {
          font-size: 11px; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: #9CA3AF;
          margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
        }
        .ap-card-title-bar {
          width: 3px; height: 14px; border-radius: 2px;
          background: #E63329; flex-shrink: 0;
        }

        .ap-input:focus {
          border-color: #0A0A0A !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06) !important;
        }
        .ap-price-wrap { position: relative; }
        .ap-price-suffix {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 11px; font-weight: 800; color: #9CA3AF;
          pointer-events: none; letter-spacing: 0.5px;
        }

        .ap-size-chip {
          padding: 7px 13px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #F9FAFB;
          font-family: inherit; font-size: 12px; font-weight: 700; color: #6B7280;
          cursor: pointer; transition: all 0.15s;
        }
        .ap-size-chip:hover { border-color: #0A0A0A; color: #0A0A0A; background: #fff; }
        .ap-size-chip[data-active="true"] { background: #0A0A0A; border-color: #0A0A0A; color: #fff; }

        .ap-dropzone {
          border: 2px dashed #E5E7EB; border-radius: 16px;
          padding: 28px 20px; text-align: center;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          background: #FAFAFA;
        }
        .ap-dropzone:hover { border-color: #0A0A0A; background: #F9FAFB; }
        .ap-dropzone-err { border-color: #FECACA !important; background: #FFF5F5 !important; }

        .ap-img-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 14px; }
        .ap-img-thumb {
          aspect-ratio: 1; border-radius: 12px; overflow: hidden;
          position: relative; background: #F3F4F6; border: 1.5px solid #E5E7EB;
        }
        .ap-img-thumb:first-child { grid-column: span 3; aspect-ratio: 16/9; }
        .ap-img-rm {
          position: absolute; top: 6px; right: 6px;
          width: 24px; height: 24px; border-radius: 8px;
          border: none; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.15s;
        }
        .ap-img-thumb:hover .ap-img-rm { opacity: 1; }
        .ap-img-primary-badge {
          position: absolute; bottom: 6px; left: 6px;
          padding: 3px 8px; border-radius: 6px;
          background: rgba(230,51,41,0.85);
          font-size: 9px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: #fff;
        }

        .ap-color-swatch:hover {
          transform: translateY(-2px) scale(1.05) !important;
        }

        .ap-bottombar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: rgba(255,255,255,0.96); backdrop-filter: blur(16px);
          border-top: 1px solid #F0F0F0;
          padding: 16px 32px;
          display: flex; align-items: center; justify-content: flex-end; gap: 12px;
        }
        .ap-btn-cancel {
          padding: 12px 22px; border-radius: 12px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          color: #374151; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .ap-btn-cancel:hover { background: #F3F4F6; border-color: #D1D5DB; }
        .ap-btn-submit {
          padding: 12px 28px; border-radius: 12px;
          border: none; background: #E63329;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          color: #fff; cursor: pointer; letter-spacing: -0.2px;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(230,51,41,0.35);
        }
        .ap-btn-submit:hover:not(:disabled) { background: #CC2920; transform: translateY(-1px); }
        .ap-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .ap-hint-box {
          display: flex; gap: 10px; padding: 14px 16px;
          border-radius: 12px; background: #F0F9FF; border: 1px solid #BAE6FD;
        }

        @keyframes ap-spin { to { transform: rotate(360deg); } }
        @keyframes ap-dropdown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ap-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: ap-spin 0.65s linear infinite; flex-shrink: 0;
        }

        .ap-fields-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @media (max-width: 860px) {
          .ap-grid { grid-template-columns: 1fr; }
          .ap-content { padding: 24px 20px 120px; }
          .ap-bottombar { padding: 14px 20px; }
          .ap-topbar { padding: 0 14px; }
        }
        @media (max-width: 768px) {
          .ap-layout { grid-template-columns: 1fr !important; }
          .ap-content { padding: 16px 14px 100px; }
          .ap-card { padding: 18px 16px; }
          .ap-topbar { padding: 0 12px; height: 52px; }
          .ap-bottombar { padding: 12px 14px; }
          .ap-fields-2col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="ap-layout"
        style={{
          gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr`,
          transition: 'grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <DashboardSidebar
          brandName={user?.brand?.name ?? undefined}
          userInitials={((user?.firstName ?? user?.email ?? 'C')[0]).toUpperCase()}
          userEmail={user?.email ?? undefined}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="products"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')      router.push('/dashboard');
            else if (section === 'drops')    router.push('/dashboard/drops');
            else if (section === 'products') router.push('/dashboard/produits');
            else router.push('/dashboard');
          }}
        />

        <div className="ap-main">

          {/* Top bar */}
          <div className="ap-topbar">
            <button
              type="button"
              className="ap-back-btn"
              onClick={() => prefilledCollectionId
                ? router.push(`/dashboard/drops/${prefilledCollectionId}`)
                : router.push('/dashboard/produits')}
            >
              <Ic d={ICONS.arrow_left} size={15} sw={2} />
            </button>
            {prefilledCollectionId ? (
              <>
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Drops</span>
                <span style={{ color: '#D1D5DB', fontSize: 14 }}>/</span>
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lockedCollection?.name ?? 'Collection'}
                </span>
                <span style={{ color: '#D1D5DB', fontSize: 14 }}>/</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>
                  Nouveau produit
                </span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Produits</span>
                <span style={{ color: '#D1D5DB', fontSize: 14 }}>/</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>
                  Nouveau produit
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="ap-content">
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.6px', marginBottom: 6 }}>
              Ajouter un produit
            </h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 36 }}>
              Les champs marqués <span style={{ color: '#E63329' }}>*</span> sont obligatoires.
            </p>

            <div className="ap-grid">

              {/* ── Left ── */}
              <div>

                {/* Infos générales */}
                <div className="ap-card">
                  <div className="ap-card-title">
                    <div className="ap-card-title-bar" />
                    Informations générales
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                    <Field
                      label="Collection"
                      required
                      error={lockedCollection ? undefined : fieldError('collectionId')}
                      hint={lockedCollection
                        ? 'Collection pré-sélectionnée depuis la page du drop.'
                        : !fieldError('collectionId') ? 'Le produit sera rattaché à cette collection.' : undefined}
                    >
                      {lockedCollection ? (
                        <LockedCollectionDisplay collection={lockedCollection} />
                      ) : (
                        <CollectionPicker
                          collections={collections}
                          loading={collectionsQuery.isLoading}
                          value={collectionId}
                          onChange={(id) => { setCollectionId(id); touch('collectionId'); }}
                          error={fieldError('collectionId')}
                          onCreateNew={() => router.push('/dashboard/drops/new')}
                        />
                      )}
                    </Field>

                    <Field label="Type de produit" required error={fieldError('productType')}>
                      <select
                        className="ap-input"
                        style={fieldError('productType') ? errInput : baseInput}
                        value={productType}
                        onChange={e => { setProductType(e.target.value); touch('productType'); }}
                      >
                        <option value="">Choisir un type</option>
                        {PRODUCT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Genre" required error={fieldError('gender')}>
                      <select
                        className="ap-input"
                        style={fieldError('gender') ? errInput : baseInput}
                        value={gender}
                        onChange={e => { setGender(e.target.value); touch('gender'); }}
                      >
                        <option value="">Choisir un genre</option>
                        {PRODUCT_GENDERS.map(g => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Nom du produit" required error={fieldError('name')}>
                      <input
                        type="text"
                        placeholder="ex. Jacket Oversize Dakar"
                        className="ap-input"
                        style={fieldError('name') ? errInput : baseInput}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => touch('name')}
                        maxLength={120}
                      />
                    </Field>

                    <div className="ap-fields-2col">
                      <Field label="Prix" required error={fieldError('price')}>
                        <div className="ap-price-wrap">
                          <input
                            type="number" min={0} placeholder="15000"
                            className="ap-input"
                            style={{ ...(fieldError('price') ? errInput : baseInput), paddingRight: 54 }}
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            onBlur={() => touch('price')}
                          />
                          <span className="ap-price-suffix">FCFA</span>
                        </div>
                      </Field>
                      <Field label="Stock initial" required error={fieldError('stock')}>
                        <input
                          type="number" min={0} placeholder="10"
                          className="ap-input"
                          style={fieldError('stock') ? errInput : baseInput}
                          value={stock}
                          onChange={e => setStock(e.target.value)}
                          onBlur={() => touch('stock')}
                        />
                      </Field>
                    </div>

                    <Field label="Description" hint="Optionnel — visible sur la page produit.">
                      <textarea
                        placeholder="Décris le produit : matières, coupe, inspirations…"
                        className="ap-input"
                        style={{ ...baseInput, resize: 'vertical', minHeight: 100 }}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {/* Variantes */}
                {productType && (
                  <div className="ap-card">
                    <div className="ap-card-title">
                      <div className="ap-card-title-bar" style={{ background: '#6366F1' }} />
                      Variantes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                      {(() => {
                        const fields = PRODUCT_TYPE_FIELDS[productType as keyof typeof PRODUCT_TYPE_FIELDS];
                        if (!fields) return null;

                        return (
                          <>
                            {/* Champ Poids (uniquement pour les sacs) */}
                            {fields.showWeight && (
                              <Field label="Poids (g)" error={fieldError('weight')}>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="500"
                                  className="ap-input"
                                  style={fieldError('weight') ? errInput : baseInput}
                                  value={weight}
                                  onChange={e => setWeight(e.target.value)}
                                  onBlur={() => touch('weight')}
                                />
                              </Field>
                            )}

                            {/* Champ Tailles */}
                            {fields.showSizes && (
                              <Field label={fields.sizeLabel} hint="Si aucune, le produit sera vendu en taille UNIQUE.">
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                  {PRESET_SIZES.map(s => (
                                    <button
                                      key={s} type="button"
                                      className="ap-size-chip"
                                      data-active={sizes.includes(s) ? 'true' : 'false'}
                                      onClick={() => toggleSize(s)}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </Field>
                            )}

                            {/* Champ Couleurs */}
                            {fields.showColors && (
                              <Field label={fields.colorLabel} hint="Optionnel — clique pour sélectionner.">
                                <div style={{ marginTop: 4 }}>
                                  <ColorSwatches selected={colors} onChange={setColors} />
                                </div>
                              </Field>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right ── */}
              <div>
                <div className="ap-card">
                  <div className="ap-card-title">
                    <div className="ap-card-title-bar" style={{ background: '#10B981' }} />
                    Photos du produit
                    <span style={{
                      fontSize: 10, color: '#9CA3AF', fontWeight: 500,
                      letterSpacing: '0.2px', textTransform: 'none',
                    }}>
                      {previews.length}/6
                    </span>
                  </div>

                  <div
                    className={`ap-dropzone${fieldError('images') ? ' ap-dropzone-err' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Ic d={ICONS.upload} size={22} stroke="#9CA3AF" sw={1.8} />
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>
                      Clique ou glisse tes photos ici
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                      PNG, JPG, WEBP — 6 photos max
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file" accept="image/*" multiple
                      style={{ display: 'none' }}
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </div>

                  {fieldError('images') && (
                    <p style={{ fontSize: 11.5, color: '#E63329', fontWeight: 500, margin: '8px 0 0' }}>
                      {fieldError('images')}
                    </p>
                  )}

                  {previews.length > 0 && (
                    <div className="ap-img-grid">
                      {previews.map((url, i) => (
                        <div key={url} className="ap-img-thumb">
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          {i === 0 && <span className="ap-img-primary-badge">Principale</span>}
                          <button
                            type="button"
                            className="ap-img-rm"
                            onClick={e => { e.stopPropagation(); removeImage(i); }}
                          >
                            <Ic d={ICONS.x} size={10} stroke="#fff" sw={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="ap-hint-box">
                    <Ic d={ICONS.info} size={15} stroke="#0EA5E9" sw={2} />
                    <p style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.55, margin: 0 }}>
                      La première photo sera utilisée comme visuel principal dans la boutique. Tu pourras modifier le produit après publication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="ap-bottombar">
            <button
              type="button"
              className="ap-btn-cancel"
              onClick={() => prefilledCollectionId
                ? router.push(`/dashboard/drops/${prefilledCollectionId}`)
                : router.push('/dashboard/produits')}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              className="ap-btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || (submitted && hasErrors)}
            >
              {isSubmitting ? (
                <><div className="ap-spinner" />Publication…</>
              ) : (
                <><Ic d={ICONS.check} size={15} stroke="#fff" sw={2.5} />Publier le produit</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

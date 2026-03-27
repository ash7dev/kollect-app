/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { CollectionStatus } from '@/types/drops';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'UNIQUE'];

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

const STATUS_META: Record<CollectionStatus, { label: string; bg: string; color: string }> = {
  DISPONIBLE: { label: 'Disponible', bg: '#D1FAE5', color: '#065F46' },
  TEASER:     { label: 'Teaser',     bg: '#FEF3C7', color: '#92400E' },
  BROUILLON:  { label: 'Brouillon',  bg: '#F3F4F6', color: '#6B7280' },
  EPUISEE:    { label: 'Épuisée',    bg: '#FEE2E2', color: '#991B1B' },
  TERMINE:    { label: 'Terminée',   bg: '#F3F4F6', color: '#6B7280' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CeoProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  isVisible: boolean;
  isFeatured: boolean;
  collection: { id: string; name: string; status: CollectionStatus } | null;
};

type FieldError = Partial<Record<'name' | 'price' | 'stock' | 'images', string>>;

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
  upload:  ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  x:       'M18 6 6 18M6 6l12 12',
  check:   'M20 6L9 17l-5-5',
  info:    ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 8h.01', 'M12 12v4'],
  layers:  ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  eye:     ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  eyeOff:  ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24', 'M1 1l22 22'],
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  crown:   'M2 20h20M5 20V10l7-6 7 6v10',
};

// ─── Image types ──────────────────────────────────────────────────────────────

type ExistingItem = { kind: 'existing'; url: string };
type NewItem      = { kind: 'new'; file: File };
type ImageItem    = ExistingItem | NewItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FAFAFA' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto 16px',
          border: '2px solid #F0F0F0', borderTopColor: '#E63329',
          borderRadius: '50%', animation: 'ep-spin 0.75s linear infinite',
        }} />
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>{message}</p>
      </div>
      <style>{`@keyframes ep-spin { to { transform: rotate(360deg); } }`}</style>
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

// ─── Color Swatches ────────────────────────────────────────────────────────────

function ColorSwatches({ selected, onChange }: { selected: string[]; onChange: (c: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(c => c !== v) : [...selected, v]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {COLORS.map(c => {
          const sel = selected.includes(c.value);
          return (
            <div
              key={c.value}
              title={c.name}
              onClick={() => toggle(c.value)}
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: c.value,
                border: sel ? '2.5px solid #E63329' : c.value === '#FFFFFF' ? '2px solid rgba(0,0,0,0.15)' : '2px solid transparent',
                boxShadow: sel ? '0 0 0 3px rgba(230,51,41,0.18)' : '0 1px 3px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.12s',
                flexShrink: 0,
                transform: sel ? 'scale(1.1)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              {sel && (
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  <Ic d={ICONS.check} size={14}
                    stroke={c.value === '#FFFFFF' || c.value === '#FFCC00' || c.value === '#F4E9D8' ? '#333' : '#fff'}
                    sw={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {selected.map(hex => (
              <div key={hex} style={{
                width: 14, height: 14, borderRadius: 999, background: hex,
                border: hex === '#FFFFFF' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.08)',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, fontWeight: 500 }}>
            {selected.length} couleur{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
      onClick={() => onChange(!checked)}
    >
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>{label}</span>
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: checked ? '#0A0A0A' : '#E5E7EB',
        transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 21 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EditProductPage({ productId }: { productId: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { checking } = useOnboardingGuard();
  const qc = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Stable object URL cache — avoids re-creating blob URLs on every render
  const previewCache = useRef<Map<File, string>>(new Map());

  // ── Form state ──
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  // Unified image list — existing URLs + new Files, in display order
  const [images, setImages] = useState<ImageItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  // ── Load product ──
  const productQuery = useQuery({
    queryKey: ['dashboard', 'produits', 'ceo-one', productId],
    queryFn: async () => {
      const res = await apiClient.get<CeoProduct>(API_ENDPOINTS.PRODUITS.CEO_ONE(productId));
      return res.data;
    },
    enabled: !!user?.isCEO && !!productId,
  });

  // ── Populate form on load ──
  useEffect(() => {
    if (!productQuery.data || initialized) return;
    const p = productQuery.data;
    setName(p.name);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setDescription(p.description ?? '');
    setSizes(p.sizes ?? []);
    setColors(p.colors ?? []);
    setIsVisible(p.isVisible);
    setIsFeatured(p.isFeatured);
    setImages((p.images ?? []).map(url => ({ kind: 'existing' as const, url })));
    setInitialized(true);
  }, [productQuery.data, initialized]);

  // ── Revoke object URLs on unmount ──
  useEffect(() => {
    const cache = previewCache.current;
    return () => { cache.forEach(u => URL.revokeObjectURL(u)); };
  }, []);

  // ── Stable preview URL helper ──
  const getPreview = useCallback((item: ImageItem): string => {
    if (item.kind === 'existing') return item.url;
    if (!previewCache.current.has(item.file)) {
      previewCache.current.set(item.file, URL.createObjectURL(item.file));
    }
    return previewCache.current.get(item.file)!;
  }, []);

  const totalImages = images.length;

  // Derived: existing URLs in current order (for DTO)
  const existingUrls = useMemo(
    () => images.filter(i => i.kind === 'existing').map(i => (i as ExistingItem).url),
    [images],
  );
  // Derived: new files in current order (for multipart upload)
  const newFiles = useMemo(
    () => images.filter(i => i.kind === 'new').map(i => (i as NewItem).file),
    [images],
  );

  // ── Validation ──
  const validate = useCallback((): FieldError => {
    const e: FieldError = {};
    if (!name.trim() || name.trim().length < 3)                    e.name  = 'Nom trop court (3 car. min)';
    if (!price || isNaN(Number(price)) || Number(price) < 0)       e.price = 'Prix invalide';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) e.stock = 'Stock invalide';
    if (totalImages === 0)                                          e.images = 'Au moins une photo est requise';
    return e;
  }, [name, price, stock, totalImages]);

  const fieldError = (key: keyof FieldError) =>
    (submitted || touched.has(key)) ? errors[key] : undefined;

  const touch = (key: string) => setTouched(prev => new Set(prev).add(key));

  useEffect(() => { setErrors(validate()); }, [validate]);

  // ── Submit ──
  const updateMutation = useMutation({
    mutationFn: async () => {
      const dto: Record<string, unknown> = {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        sizes: sizes.length ? sizes : ['UNIQUE'],
        colors,
        isVisible,
        isFeatured,
        ...(description.trim() ? { description: description.trim() } : { description: null }),
        // Send existing URLs in the user-chosen order; backend appends new uploads after
        ...(existingUrls.length > 0 ? { images: existingUrls } : {}),
      };
      const fd = new FormData();
      fd.append('data', JSON.stringify(dto));
      newFiles.forEach((file, i) => fd.append(`image-${i}`, file, file.name));
      const { data } = await apiClient.put(API_ENDPOINTS.PRODUITS.UPDATE(productId), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['dashboard', 'produits', 'ceo'] });
      await qc.invalidateQueries({ queryKey: ['dashboard', 'produits', 'ceo-one', productId] });
      toast.success('Produit mis à jour avec succès');
      router.push('/dashboard/produits');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Impossible de mettre à jour le produit');
    },
  });

  const handleSubmit = () => {
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error('Remplis les champs obligatoires');
      return;
    }
    updateMutation.mutate();
  };

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => {
      const newItems: ImageItem[] = valid.map(file => ({ kind: 'new' as const, file }));
      return [...prev, ...newItems].slice(0, 6);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const item = prev[idx];
      if (item.kind === 'new') {
        const cached = previewCache.current.get((item as NewItem).file);
        if (cached) {
          URL.revokeObjectURL(cached);
          previewCache.current.delete((item as NewItem).file);
        }
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const setPrimary = (idx: number) => {
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
    toast.success('Photo principale mise à jour');
  };

  // ── Guards ──
  if (checking || authLoading) return <FullPageSpinner message="Chargement…" />;
  if (!user?.isCEO)            return <FullPageSpinner message="Accès réservé aux comptes CEO." />;
  if (productQuery.isLoading || !initialized) return <FullPageSpinner message="Chargement du produit…" />;
  if (productQuery.isError)    return <FullPageSpinner message="Produit introuvable." />;

  const isSubmitting = updateMutation.isPending;
  const product = productQuery.data!;
  const collectionMeta = product.collection
    ? STATUS_META[product.collection.status]
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ep-layout {
          min-height: 100vh; display: grid;
          background: #FAFAFA;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .ep-main { min-width: 0; display: flex; flex-direction: column; background: #FAFAFA; }

        .ep-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid #F0F0F0;
          padding: 0 32px; height: 60px;
          display: flex; align-items: center; gap: 14px;
        }
        .ep-back-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #374151; flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .ep-back-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }

        .ep-content {
          flex: 1; padding: 40px 32px 120px;
          max-width: 1060px; width: 100%; margin: 0 auto;
        }
        .ep-grid {
          display: grid; grid-template-columns: 1fr 400px;
          gap: 20px; align-items: start;
        }

        .ep-card {
          background: #fff; border: 1px solid #F0F0F0;
          border-radius: 20px; padding: 28px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
        }
        .ep-card + .ep-card { margin-top: 20px; }
        .ep-card-title {
          font-size: 11px; font-weight: 800; letter-spacing: 2.5px;
          text-transform: uppercase; color: #9CA3AF;
          margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
        }
        .ep-card-title-bar {
          width: 3px; height: 14px; border-radius: 2px;
          background: #E63329; flex-shrink: 0;
        }

        .ep-input:focus {
          border-color: #0A0A0A !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06) !important;
        }
        .ep-price-wrap { position: relative; }
        .ep-price-suffix {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 11px; font-weight: 800; color: #9CA3AF;
          pointer-events: none; letter-spacing: 0.5px;
        }

        .ep-size-chip {
          padding: 7px 13px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #F9FAFB;
          font-family: inherit; font-size: 12px; font-weight: 700; color: #6B7280;
          cursor: pointer; transition: all 0.15s;
        }
        .ep-size-chip:hover { border-color: #0A0A0A; color: #0A0A0A; background: #fff; }
        .ep-size-chip[data-active="true"] { background: #0A0A0A; border-color: #0A0A0A; color: #fff; }

        .ep-dropzone {
          border: 2px dashed #E5E7EB; border-radius: 16px;
          padding: 28px 20px; text-align: center;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          background: #FAFAFA;
        }
        .ep-dropzone:hover { border-color: #0A0A0A; background: #F9FAFB; }
        .ep-dropzone-err { border-color: #FECACA !important; background: #FFF5F5 !important; }
        .ep-dropzone-disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

        .ep-img-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 14px; }
        .ep-img-thumb {
          aspect-ratio: 1; border-radius: 12px; overflow: hidden;
          position: relative; background: #F3F4F6; border: 1.5px solid #E5E7EB;
        }
        .ep-img-thumb:first-child { grid-column: span 3; aspect-ratio: 16/9; }
        .ep-img-rm {
          position: absolute; top: 6px; right: 6px;
          width: 24px; height: 24px; border-radius: 8px;
          border: none; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.15s;
        }
        .ep-img-thumb:hover .ep-img-rm { opacity: 1; }
        .ep-img-pin {
          position: absolute; top: 6px; left: 6px;
          width: 26px; height: 26px; border-radius: 8px;
          border: none; background: rgba(255,255,255,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .ep-img-thumb:hover .ep-img-pin { opacity: 1; transform: scale(1.08); }
        .ep-img-primary-badge {
          position: absolute; bottom: 6px; left: 6px;
          padding: 3px 8px; border-radius: 6px;
          background: rgba(230,51,41,0.85);
          font-size: 9px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: #fff;
        }
        .ep-img-new-badge {
          position: absolute; bottom: 6px; right: 6px;
          padding: 3px 8px; border-radius: 6px;
          background: rgba(99,102,241,0.85);
          font-size: 9px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: #fff;
        }

        .ep-bottombar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          background: rgba(255,255,255,0.96); backdrop-filter: blur(16px);
          border-top: 1px solid #F0F0F0;
          padding: 16px 32px;
          display: flex; align-items: center; justify-content: flex-end; gap: 12px;
        }
        .ep-btn-cancel {
          padding: 12px 22px; border-radius: 12px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-family: inherit; font-size: 13.5px; font-weight: 700;
          color: #374151; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .ep-btn-cancel:hover { background: #F3F4F6; border-color: #D1D5DB; }
        .ep-btn-submit {
          padding: 12px 28px; border-radius: 12px;
          border: none; background: #0A0A0A;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          color: #fff; cursor: pointer; letter-spacing: -0.2px;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
        .ep-btn-submit:hover:not(:disabled) { background: #222; transform: translateY(-1px); }
        .ep-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .ep-hint-box {
          display: flex; gap: 10px; padding: 14px 16px;
          border-radius: 12px; background: #F0F9FF; border: 1px solid #BAE6FD;
        }

        @keyframes ep-spin { to { transform: rotate(360deg); } }
        .ep-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: ep-spin 0.65s linear infinite; flex-shrink: 0;
        }

        @media (max-width: 860px) {
          .ep-grid { grid-template-columns: 1fr; }
          .ep-content { padding: 24px 20px 120px; }
          .ep-bottombar { padding: 14px 20px; }
          .ep-topbar { padding: 0 20px; }
        }
      `}</style>

      <div
        className="ep-layout"
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

        <div className="ep-main">

          {/* Top bar */}
          <div className="ep-topbar">
            <button
              type="button"
              className="ep-back-btn"
              onClick={() => router.push('/dashboard/produits')}
            >
              <Ic d={ICONS.arrow_left} size={15} sw={2} />
            </button>
            <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Produits</span>
            <span style={{ color: '#D1D5DB', fontSize: 14 }}>/</span>
            <span style={{
              fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px',
              maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {product.name}
            </span>
          </div>

          {/* Content */}
          <div className="ep-content">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.6px' }}>
                Modifier le produit
              </h1>
              {/* Collection badge */}
              {product.collection && collectionMeta && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 12,
                  border: '1.5px solid #F0F0F0', background: '#fff',
                  flexShrink: 0,
                }}>
                  <Ic d={ICONS.layers} size={12} stroke="#9CA3AF" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {product.collection.name}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 99, background: collectionMeta.bg, color: collectionMeta.color,
                  }}>
                    {collectionMeta.label}
                  </span>
                </div>
              )}
            </div>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 36 }}>
              Les champs marqués <span style={{ color: '#E63329' }}>*</span> sont obligatoires.
            </p>

            <div className="ep-grid">

              {/* ── Left ── */}
              <div>

                {/* Infos générales */}
                <div className="ep-card">
                  <div className="ep-card-title">
                    <div className="ep-card-title-bar" />
                    Informations générales
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                    <Field label="Nom du produit" required error={fieldError('name')}>
                      <input
                        type="text"
                        placeholder="ex. Jacket Oversize Dakar"
                        className="ep-input"
                        style={fieldError('name') ? errInput : baseInput}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => touch('name')}
                        maxLength={120}
                      />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Prix" required error={fieldError('price')}>
                        <div className="ep-price-wrap">
                          <input
                            type="number" min={0} placeholder="15000"
                            className="ep-input"
                            style={{ ...(fieldError('price') ? errInput : baseInput), paddingRight: 54 }}
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            onBlur={() => touch('price')}
                          />
                          <span className="ep-price-suffix">FCFA</span>
                        </div>
                      </Field>
                      <Field label="Stock" required error={fieldError('stock')}>
                        <input
                          type="number" min={0} placeholder="10"
                          className="ep-input"
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
                        className="ep-input"
                        style={{ ...baseInput, resize: 'vertical', minHeight: 100 }}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {/* Variantes */}
                <div className="ep-card">
                  <div className="ep-card-title">
                    <div className="ep-card-title-bar" style={{ background: '#6366F1' }} />
                    Variantes
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

                    <Field label="Tailles disponibles" hint="Si aucune, le produit sera vendu en taille UNIQUE.">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                        {PRESET_SIZES.map(s => (
                          <button
                            key={s} type="button"
                            className="ep-size-chip"
                            data-active={sizes.includes(s) ? 'true' : 'false'}
                            onClick={() => toggleSize(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Couleurs disponibles" hint="Optionnel — clique pour sélectionner.">
                      <div style={{ marginTop: 4 }}>
                        <ColorSwatches selected={colors} onChange={setColors} />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Paramètres */}
                <div className="ep-card">
                  <div className="ep-card-title">
                    <div className="ep-card-title-bar" style={{ background: '#F59E0B' }} />
                    Paramètres
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Toggle
                      checked={isVisible}
                      onChange={setIsVisible}
                      label="Produit visible dans la boutique"
                    />
                    <div style={{ height: 1, background: '#F3F4F6' }} />
                    <Toggle
                      checked={isFeatured}
                      onChange={setIsFeatured}
                      label="Produit mis en avant (coup de cœur)"
                    />
                  </div>
                </div>
              </div>

              {/* ── Right ── */}
              <div>
                <div className="ep-card">
                  <div className="ep-card-title">
                    <div className="ep-card-title-bar" style={{ background: '#10B981' }} />
                    Photos du produit
                    <span style={{
                      fontSize: 10, color: '#9CA3AF', fontWeight: 500,
                      letterSpacing: '0.2px', textTransform: 'none',
                    }}>
                      {totalImages}/6
                    </span>
                  </div>

                  {/* Image grid — unified list, first = primary */}
                  {totalImages > 0 && (
                    <div className="ep-img-grid">
                      {images.map((item, i) => {
                        const src = getPreview(item);
                        const isPrimary = i === 0;
                        const isNew = item.kind === 'new';
                        return (
                          <div key={`img-${i}`} className="ep-img-thumb">
                            <img
                              src={src}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />

                            {/* "Définir comme principale" — visible on hover for non-primary */}
                            {!isPrimary && (
                              <button
                                type="button"
                                className="ep-img-pin"
                                title="Définir comme photo principale"
                                onClick={e => { e.stopPropagation(); setPrimary(i); }}
                              >
                                <Ic d={ICONS.crown} size={11} stroke="#E63329" sw={2.2} />
                              </button>
                            )}

                            {/* Primary badge */}
                            {isPrimary && (
                              <span className="ep-img-primary-badge">⭐ Principale</span>
                            )}

                            {/* New badge */}
                            {isNew && !isPrimary && (
                              <span className="ep-img-new-badge">Nouvelle</span>
                            )}
                            {isNew && isPrimary && (
                              <span className="ep-img-new-badge" style={{ bottom: 28 }}>Nouvelle</span>
                            )}

                            {/* Remove */}
                            <button
                              type="button"
                              className="ep-img-rm"
                              onClick={e => { e.stopPropagation(); removeImage(i); }}
                            >
                              <Ic d={ICONS.x} size={10} stroke="#fff" sw={2.5} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dropzone */}
                  {totalImages < 6 && (
                    <div
                      className={`ep-dropzone${fieldError('images') ? ' ep-dropzone-err' : ''}${totalImages > 0 ? '' : ''}`}
                      style={{ marginTop: totalImages > 0 ? 14 : 0 }}
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
                        {totalImages > 0 ? 'Ajouter d\'autres photos' : 'Clique ou glisse tes photos ici'}
                      </p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                        PNG, JPG, WEBP — {6 - totalImages} emplacement{6 - totalImages > 1 ? 's' : ''} restant{6 - totalImages > 1 ? 's' : ''}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file" accept="image/*" multiple
                        style={{ display: 'none' }}
                        onChange={e => handleFiles(e.target.files)}
                      />
                    </div>
                  )}

                  {fieldError('images') && (
                    <p style={{ fontSize: 11.5, color: '#E63329', fontWeight: 500, margin: '8px 0 0' }}>
                      {fieldError('images')}
                    </p>
                  )}
                </div>

                {/* Visibilité rapide */}
                <div style={{ marginTop: 16 }}>
                  <div className="ep-hint-box">
                    <Ic d={isVisible ? ICONS.eye : ICONS.eyeOff} size={15} stroke="#0EA5E9" sw={2} />
                    <p style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.55, margin: 0 }}>
                      {isVisible
                        ? 'Ce produit est actuellement visible dans la boutique.'
                        : 'Ce produit est masqué — les acheteurs ne peuvent pas le voir.'}
                    </p>
                  </div>
                </div>

                {/* Featured */}
                {isFeatured && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      display: 'flex', gap: 10, padding: '14px 16px',
                      borderRadius: 12, background: '#FFF7ED', border: '1px solid #FED7AA',
                    }}>
                      <Ic d={ICONS.star} size={15} stroke="#F59E0B" sw={2} />
                      <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.55, margin: 0 }}>
                        Ce produit est mis en avant. Il apparaît en priorité dans la boutique.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="ep-bottombar">
            <button
              type="button"
              className="ep-btn-cancel"
              onClick={() => router.push('/dashboard/produits')}
            >
              Annuler
            </button>
            <button
              type="button"
              className="ep-btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="ep-spinner" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Ic d={ICONS.check} size={14} stroke="#fff" sw={2.5} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

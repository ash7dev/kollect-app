'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { DashboardSidebar, type SidebarSection } from '@/components/dashboard/DashboardSidebar';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

// ─── Types ────────────────────────────────────────────────────────────────────

type PromotionKind = 'auto_brand' | 'auto_collection' | 'code_promo';
type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
type Step = 1 | 2 | 3;

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
  back:    'M19 12H5M12 5l-7 7 7 7',
  brand:   ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  coll:    ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  code:    ['M7 20l4-16m2 16l4-16', 'M6 9h14', 'M4 15h14'],
  check:   'M20 6L9 17l-5-5',
  percent: ['M19 5L5 19', 'M6.5 6.5h.01', 'M17.5 17.5h.01'],
  fcfa:    ['M12 1v22', 'M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6'],
  arrow:   'M5 12h14M12 5l7 7-7 7',
};

const KIND_CONFIG: Record<PromotionKind, { title: string; sub: string; iconD: string | string[]; tag: string }> = {
  auto_brand: {
    title: 'Toute la boutique',
    tag: 'Automatique',
    sub: "La remise s'applique automatiquement à tous vos produits lors du checkout.",
    iconD: ICONS.brand,
  },
  auto_collection: {
    title: 'Une collection',
    tag: 'Automatique',
    sub: "La remise s'applique automatiquement aux produits d'une collection précise.",
    iconD: ICONS.coll,
  },
  code_promo: {
    title: 'Code promo',
    tag: 'Manuel',
    sub: 'Le client saisit un code au moment du checkout pour bénéficier de la remise.',
    iconD: ICONS.code,
  },
};

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const steps = ['Type', 'Remise', 'Planning'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const idx = i + 1 as Step;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#111' : active ? '#FF3B30' : '#F3F4F6',
                color: done || active ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                boxShadow: active ? '0 0 0 4px rgba(255,59,48,0.15)' : undefined,
                transition: 'background 0.25s',
              }}>
                {done ? <Ic d={ICONS.check} size={16} sw={2.5} /> : idx}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#FF3B30' : done ? '#111' : '#9CA3AF', marginTop: 6, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#111' : '#F3F4F6', margin: '0 8px', marginBottom: 22, transition: 'background 0.25s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Type Card ────────────────────────────────────────────────────────────────

function KindCard({ kind, selected, onSelect }: {
  kind: PromotionKind; selected: boolean; onSelect: () => void;
}) {
  const cfg = KIND_CONFIG[kind];
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        padding: '20px 22px', borderRadius: 16,
        background: selected ? '#111' : '#fff',
        boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.16)' : '0 2px 8px rgba(0,0,0,0.05)',
        border: `2px solid ${selected ? '#111' : '#EBEBEB'}`,
        transition: 'all 0.18s', color: selected ? '#fff' : '#111',
        display: 'flex', alignItems: 'flex-start', gap: 16,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: selected ? 'rgba(255,255,255,0.12)' : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ic d={cfg.iconD} size={20} stroke={selected ? '#fff' : '#6B7280'} sw={1.5} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{cfg.title}</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, color: selected ? 'rgba(255,255,255,0.5)' : '#FF3B30' }}>
          {cfg.tag}
        </div>
        <div style={{ fontSize: 12.5, color: selected ? 'rgba(255,255,255,0.55)' : '#6B7280', lineHeight: 1.55 }}>
          {cfg.sub}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CreatePromotionForm() {
  const router = useRouter();
  const { user } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>(1);
  const [kind, setKind] = useState<PromotionKind | null>(null);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Step 2
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isSingleUse, setIsSingleUse] = useState(false);

  // Step 3
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Collections list
  const collectionsQuery = useQuery({
    queryKey: ['dashboard', 'collections', 'ceo'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ id: string; name: string }> }>(
        API_ENDPOINTS.COLLECTIONS.LIST_CEO
      );
      return res.data.data ?? [];
    },
    enabled: !!user?.isCEO,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (kind === 'code_promo') {
        return apiClient.post(API_ENDPOINTS.PROMOTIONS.CREATE_CODE, payload);
      }
      return apiClient.post(API_ENDPOINTS.PROMOTIONS.CREATE_AUTO, payload);
    },
    onSuccess: () => {
      toast.success('Promotion créée avec succès !');
      router.push('/dashboard/promotions');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Une erreur est survenue.');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!kind) return;
    const base = {
      description: description || undefined,
      discountType,
      discountValue: parseInt(discountValue),
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : undefined,
      minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : undefined,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };

    if (kind === 'code_promo') {
      mutation.mutate({
        ...base,
        code: codeValue.toUpperCase().trim(),
        scope: collectionId ? 'COLLECTION' : 'BRAND',
        collectionId: collectionId || undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        isSingleUse,
      });
    } else {
      mutation.mutate({
        ...base,
        scope: kind === 'auto_brand' ? 'BRAND' : 'COLLECTION',
        collectionId: kind === 'auto_collection' ? collectionId : undefined,
      });
    }
  }, [kind, description, discountType, discountValue, maxDiscount, minOrderAmount, startsAt, expiresAt, codeValue, collectionId, usageLimit, isSingleUse, mutation]);

  // Validate each step
  const canGoNext = useCallback((): boolean => {
    if (step === 1) return kind !== null;
    if (step === 2) {
      if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) return false;
      if (discountType === 'PERCENTAGE' && Number(discountValue) > 100) return false;
      if (kind === 'code_promo' && !codeValue.trim()) return false;
      if (kind === 'auto_collection' && !collectionId) return false;
      return true;
    }
    if (step === 3) return !!startsAt;
    return false;
  }, [step, kind, discountValue, discountType, codeValue, collectionId, startsAt]);

  // Shared input style
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid #EBEBEB', fontSize: 14, fontFamily: 'inherit',
    background: '#FAFAFA', color: '#111', outline: 'none', transition: '0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: '0.4px', textTransform: 'uppercase' as const, display: 'block',
  };

  return (
    <>
      <style>{`
        .create-input:focus { border-color: #FF3B30 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(255,59,48,0.1) !important; }
        .create-radio { cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-radius: 10px; border: 2px solid #EBEBEB; background: #fff; transition: 0.15s; }
        .create-radio:hover { border-color: #D1D5DB; }
        .create-radio.selected { border-color: #111; background: #0A0A0A; color: #fff; }
        .create-btn { display: inline-flex; align-items: center; gap: 7px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: 0.15s; font-family: inherit; }
        .create-btn.primary { background: #111; color: #fff; }
        .create-btn.primary:hover { background: #333; transform: translateY(-1px); }
        .create-btn.secondary { background: #F3F4F6; color: #111; }
        .create-btn.secondary:hover { background: #E5E7EB; }
        .create-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
        .create-btn.red { background: #FF3B30; color: #fff; }
        .create-btn.red:hover { background: #E0321F; transform: translateY(-1px); }

        .pp-layout {
          display: grid;
          min-height: 100vh;
          background-color: #FAFAFA;
        }
        .pp-mobile-burger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #EBEBEB;
          background: #fff;
          color: #111;
          cursor: pointer;
          margin-bottom: 20px;
        }
        @media (max-width: 1024px) {
          .pp-layout { grid-template-columns: 1fr !important; }
          .pp-mobile-burger { display: flex; }
        }
      `}</style>

      <div 
        className="pp-layout"
        style={{ gridTemplateColumns: `${sidebarCollapsed ? 68 : 256}px 1fr`, transition: 'grid-template-columns 0.22s cubic-bezier(0.4,0,0.2,1)', fontFamily: 'Inter, sans-serif' }}
      >
        <DashboardSidebar
          brandName={user?.brand?.name ?? undefined}
          userInitials={((user?.firstName ?? user?.email ?? 'C')[0]).toUpperCase()}
          userEmail={user?.email ?? undefined}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          active="promotions"
          onNavigate={(section: SidebarSection) => {
            if (section === 'overview')  router.push('/dashboard');
            else if (section === 'drops')    router.push('/dashboard/drops');
            else if (section === 'products') router.push('/dashboard/produits');
            else if (section === 'promotions') router.push('/dashboard/promotions');
            else router.push('/dashboard');
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main style={{ padding: '40px 24px', minWidth: 0, overflowY: 'auto' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 }}>
              <button
                type="button"
                className="pp-mobile-burger"
                style={{ margin: 0 }}
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              {/* Back */}
              <button className="create-btn secondary" onClick={() => router.push('/dashboard/promotions')} style={{ margin: 0 }}>
                <Ic d={ICONS.back} size={14} /> Retour
              </button>
            </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-0.6px', marginBottom: 6 }}>
            Nouvelle promotion
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 40 }}>
            Configure ta promotion en 3 étapes simples.
          </p>

          <StepBar step={step} />

          {/* ── Step 1: Kind ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 20 }}>Quel type de promotion ?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(['auto_brand', 'auto_collection', 'code_promo'] as PromotionKind[]).map(k => (
                  <KindCard key={k} kind={k} selected={kind === k} onSelect={() => setKind(k)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Discount ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 0 }}>Configure la remise</h2>

              {/* Code promo name */}
              {kind === 'code_promo' && (
                <div>
                  <label style={labelStyle}>Code promo *</label>
                  <input
                    value={codeValue}
                    onChange={e => setCodeValue(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="Ex : SUMMER20"
                    className="create-input"
                    style={inputStyle}
                    maxLength={50}
                  />
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Majuscules, chiffres, tirets uniquement.</p>
                </div>
              )}

              {/* Collection picker */}
              {(kind === 'auto_collection') && (
                <div>
                  <label style={labelStyle}>Collection *</label>
                  <select
                    value={collectionId}
                    onChange={e => setCollectionId(e.target.value)}
                    className="create-input"
                    style={{ ...inputStyle, appearance: 'none' }}
                  >
                    <option value="">Sélectionner une collection</option>
                    {(collectionsQuery.data ?? []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional collection on code promo */}
              {kind === 'code_promo' && (
                <div>
                  <label style={labelStyle}>Restreindre à une collection (optionnel)</label>
                  <select
                    value={collectionId}
                    onChange={e => setCollectionId(e.target.value)}
                    className="create-input"
                    style={{ ...inputStyle, appearance: 'none' }}
                  >
                    <option value="">Toute la boutique</option>
                    {(collectionsQuery.data ?? []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Discount type toggle */}
              <div>
                <label style={labelStyle}>Type de remise *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['PERCENTAGE', 'FIXED_AMOUNT'] as DiscountType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDiscountType(t)}
                      className={`create-radio${discountType === t ? ' selected' : ''}`}
                      style={{ flex: 1, border: discountType === t ? '2px solid #111' : '2px solid #EBEBEB', background: discountType === t ? '#111' : '#fff', color: discountType === t ? '#fff' : '#6B7280', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: '0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <Ic d={t === 'PERCENTAGE' ? ICONS.percent : ICONS.fcfa} size={15} />
                      {t === 'PERCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount value */}
              <div>
                <label style={labelStyle}>Valeur de la remise *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'PERCENTAGE' ? 'Ex : 20' : 'Ex : 5000'}
                    className="create-input"
                    style={inputStyle}
                    min={1}
                    max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: '#9CA3AF' }}>
                    {discountType === 'PERCENTAGE' ? '%' : 'CFA'}
                  </span>
                </div>
                {discountType === 'PERCENTAGE' && (
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Entre 1 et 100.</p>
                )}
              </div>

              {/* Max discount cap (PERCENTAGE only) */}
              {discountType === 'PERCENTAGE' && (
                <div>
                  <label style={labelStyle}>Plafond maximum (optionnel)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={e => setMaxDiscount(e.target.value)}
                      placeholder="Ex : 15000 (pas de plafond si vide)"
                      className="create-input"
                      style={inputStyle}
                      min={1}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: '#9CA3AF' }}>CFA</span>
                  </div>
                </div>
              )}

              {/* Min order */}
              <div>
                <label style={labelStyle}>Montant minimum de commande (optionnel)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(e.target.value)}
                    placeholder="Ex : 20000 (pas de minimum si vide)"
                    className="create-input"
                    style={inputStyle}
                    min={1}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: '#9CA3AF' }}>CFA</span>
                </div>
              </div>

              {/* Usage limit & singleUse (code promo only) */}
              {kind === 'code_promo' && (
                <>
                  <div>
                    <label style={labelStyle}>Limite d'utilisations (optionnel)</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      placeholder="Illimité si vide"
                      className="create-input"
                      style={inputStyle}
                      min={1}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#374151', fontWeight: 500 }}>
                    <input type="checkbox" checked={isSingleUse} onChange={e => setIsSingleUse(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#FF3B30' }} />
                    Usage unique par client
                  </label>
                </>
              )}

              {/* Description */}
              <div>
                <label style={labelStyle}>Description interne (optionnel)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex : Promo soldes d'été 2025"
                  className="create-input"
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  maxLength={300}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Planning ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 0 }}>Programmation</h2>

              <div>
                <label style={labelStyle}>Date de début *</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  className="create-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Date de fin (optionnel)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="create-input"
                  style={inputStyle}
                  min={startsAt}
                />
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Si vide, la promotion est sans limite de temps.</p>
              </div>

              {/* Recap */}
              <div style={{
                background: '#111', borderRadius: 16, padding: '20px 24px',
                color: '#fff', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>Récapitulatif</h3>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>
                  {discountValue ? (discountType === 'PERCENTAGE' ? `-${discountValue}%` : `-${parseInt(discountValue).toLocaleString('fr-FR')} CFA`) : '--'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                  {kind === 'auto_brand' && '✅ Promo automatique sur toute la boutique'}
                  {kind === 'auto_collection' && '✅ Promo automatique sur une collection'}
                  {kind === 'code_promo' && `✅ Code promo : ${codeValue || '---'}`}
                </div>
                {startsAt && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Du {new Date(startsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {expiresAt ? ` au ${new Date(expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' — sans date de fin'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Nav ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid #F3F4F6' }}>
            {step > 1 ? (
              <button className="create-btn secondary" onClick={() => setStep(s => (s - 1) as Step)}>
                ← Retour
              </button>
            ) : <div />}

            {step < 3 ? (
              <button className="create-btn primary" disabled={!canGoNext()} onClick={() => setStep(s => (s + 1) as Step)}>
                Suivant <Ic d={ICONS.arrow} size={14} />
              </button>
            ) : (
              <button
                className="create-btn red"
                disabled={!canGoNext() || mutation.isPending}
                onClick={handleSubmit}
              >
                {mutation.isPending ? 'Création...' : '🚀 Créer la promotion'}
              </button>
            )}
          </div>

          </div>
        </main>
      </div>
    </>
  );
}

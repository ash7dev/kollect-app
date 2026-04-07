/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useBrandCartStore, type BrandCartItem } from '@/stores/brandCartStore';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { FONT_FAMILY_INTER } from '@/styles/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

type FormFields = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

type Props = {
  open: boolean;
  onClose: () => void;
  brandSlug: string;
  brandName: string;
  accent?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

const PHONE_RE = /^(77|78|76|75|70)[0-9]{7}$/;

function validate(f: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!f.firstName.trim())                errors.firstName = 'Prénom obligatoire';
  if (!f.lastName.trim())                 errors.lastName  = 'Nom obligatoire';
  if (!PHONE_RE.test(f.phone.trim()))     errors.phone     = 'Numéro sénégalais invalide (ex: 771234567)';
  if (f.address.trim().length < 10)       errors.address   = 'Adresse trop courte (min 10 caractères)';
  if (f.city.trim().length < 2)           errors.city      = 'Ville obligatoire';
  return errors;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' CFA';
}

// ─── Input Component ─────────────────────────────────────────────────────────

function Field({
  label, value, onChange, error, placeholder, type = 'text',
  hint, required = true,
}: {
  label: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; type?: string;
  hint?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const borderColor = hasError ? '#EF4444' : focused ? '#0a0a0a' : 'rgba(0,0,0,0.12)';

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase',
        color: hasError ? '#EF4444' : 'rgba(0,0,0,0.45)',
      }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          padding: '13px 14px',
          borderRadius: 12,
          border: `1.5px solid ${borderColor}`,
          fontSize: 14,
          fontWeight: 500,
          color: '#0a0a0a',
          background: '#fff',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
          fontFamily: FONT_FAMILY_INTER,
        }}
      />
      {error && (
        <span style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </span>
      )}
      {hint && !error && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>{hint}</span>}
    </label>
  );
}

// ─── Order Item Row ────────────────────────────────────────────────────────────

function OrderItemRow({ item, accent }: { item: BrandCartItem; accent: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 10,
        overflow: 'hidden', flexShrink: 0,
        background: `${accent}15`,
      }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.06)' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0a0a0a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {item.name}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>
          Qté : {item.quantity}
        </p>
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0a0a0a', flexShrink: 0, letterSpacing: '-0.3px' }}>
        {fmtPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({ orderNumber, onClose, accent }: { orderNumber: string; onClose: () => void; accent: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 40px', textAlign: 'center',
      gap: 0,
      animation: 'ck-popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Check circle */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#D1FAE5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 0 0 12px rgba(16,185,129,0.08)',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: '#10B981' }}>
        Commande envoyée
      </p>
      <h2 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px', lineHeight: 1.1 }}>
        C&apos;est parti !
      </h2>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.65, maxWidth: 300 }}>
        Ta commande a bien été enregistrée. La boutique va la confirmer sous peu.
      </p>

      {/* Order number */}
      <div style={{
        margin: '20px 0 32px',
        padding: '12px 20px',
        background: '#F3F4F6',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        <code style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a', letterSpacing: '0.5px' }}>
          {orderNumber}
        </code>
      </div>

      {/* Payment info */}
      <div style={{
        width: '100%', maxWidth: 320,
        padding: '14px 18px',
        borderRadius: 14,
        background: `${accent}12`,
        border: `1.5px solid ${accent}25`,
        marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}>
          <strong style={{ color: '#0a0a0a' }}>Paiement à la livraison.</strong>{' '}
          Tu règles directement au livreur.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          padding: '14px 40px',
          borderRadius: 14,
          background: '#0a0a0a',
          color: '#fff',
          border: 'none',
          fontSize: 14,
          fontWeight: 900,
          cursor: 'pointer',
          letterSpacing: '-0.1px',
        }}
      >
        Fermer
      </button>
    </div>
  );
}

// ─── Main CheckoutModal ────────────────────────────────────────────────────────

export function CheckoutModal({ open, onClose, brandSlug, brandName, accent = '#0a0a0a' }: Props) {
  const items = useBrandCartStore(s => s.itemsByBrand[brandSlug] ?? []);
  const subtotal = useBrandCartStore(s => s.getSubtotal(brandSlug));
  const clearBrand = useBrandCartStore(s => s.clearBrand);

  const [visible, setVisible] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<FormFields>({
    firstName: '', lastName: '', phone: '',
    address: '', city: '', notes: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState<{ amount: number; codeId: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; kind: 'error' | 'success' } | null>(null);

  const set = useCallback((k: keyof FormFields) => (v: string) => {
    setFields(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const errors = validate(fields);
  const visibleErrors: FormErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => submittedOnce || touched[k as keyof FormFields]),
  ) as FormErrors;

  const isValid = Object.keys(errors).length === 0;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  // Animations
  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else {
      setVisible(false);
      setTimeout(() => {
        setOrderNumber(null);
        setSubmittedOnce(false);
        setTouched({});
        setPromoCode('');
        setDiscount(null);
        setPromoMessage(null);
        setFields({ firstName: '', lastName: '', phone: '', address: '', city: '', notes: '' });
      }, 350);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus first input on open
  useEffect(() => {
    if (visible && !orderNumber) {
      setTimeout(() => firstInputRef.current?.focus(), 300);
    }
  }, [visible, orderNumber]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const dto = {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.selectedSize ?? null,
          color: i.selectedColor ?? null,
        })),
        adresseLivraison: {
          nom: `${fields.firstName.trim()} ${fields.lastName.trim()}`,
          adresse: fields.address.trim(),
          ville: fields.city.trim(),
          telephone: fields.phone.trim(),
        },
        codePromo: discount ? promoCode.trim().toUpperCase() : undefined,
        notes: fields.notes.trim() || undefined,
      };
      const res = await apiClient.post<{ orderNumber: string }>('/commandes', dto);
      return res.data;
    },
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      clearBrand(brandSlug);
    },
  });

  const missingSize = items.some(
    i => i.availableSizes && i.availableSizes.length > 1 && !i.selectedSize,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (!isValid) return;
    if (missingSize) {
      toast.error('Choisis une taille pour chaque article dans ton panier');
      return;
    }
    submitMutation.mutate();
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoMessage(null);
    try {
      const res = await apiClient.get<{ discount: number; promoCodeData: any }>(
        API_ENDPOINTS.PROMOTIONS.VALIDATE(promoCode.trim().toUpperCase(), subtotal, brandSlug)
      );
      setDiscount({ amount: res.data.discount, codeId: res.data.promoCodeData.id });
      setPromoMessage({ text: 'Code appliqué !', kind: 'success' });
    } catch (e: any) {
      setDiscount(null);
      setPromoMessage({ text: e.response?.data?.message || 'Code invalide.', kind: 'error' });
    } finally {
      setValidatingPromo(false);
    }
  };

  if (!open) return null;

  const isLoading = submitMutation.isPending;

  return (
    <>
      <style>{`
        @keyframes ck-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ck-slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ck-popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .ck-submit:hover:not(:disabled) { filter: brightness(1.08); }
        .ck-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .ck-close:hover { background: rgba(0,0,0,0.06) !important; }
        textarea.ck-textarea:focus { border-color: #0a0a0a !important; outline: none; }
        @media (max-width: 720px) {
          .ck-inner { flex-direction: column !important; max-height: none !important; height: auto !important; }
          .ck-recap { border-right: none !important; border-bottom: 1.5px solid rgba(0,0,0,0.07) !important; max-height: 260px !important; }
          .ck-form-col { max-height: none !important; }
          .ck-modal { border-radius: 20px 20px 0 0 !important; position: fixed !important; bottom: 0 !important; top: auto !important; left: 0 !important; right: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Finaliser ma commande"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2500,
          background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(8px)' : 'none',
          transition: 'background 0.3s, backdrop-filter 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'ck-backdrop 0.2s ease',
        }}
      >
        {/* Modal */}
        <div
          className="ck-modal"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fafafa',
            borderRadius: 24,
            width: '100%',
            maxWidth: 860,
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1), opacity 0.28s ease',
          }}
        >
          {/* ── Accent top bar ── */}
          <div style={{
            height: 3, flexShrink: 0,
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          }} />

          {/* ── Modal header ── */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 4 }}>
                {brandName}
              </p>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.5px' }}>
                Finaliser ma commande
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ck-close"
              style={{
                width: 38, height: 38, borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.09)',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(0,0,0,0.45)',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {orderNumber ? (
            <SuccessState orderNumber={orderNumber} onClose={onClose} accent={accent} />
          ) : (
            /* ── Two-column layout ── */
            <div className="ck-inner" style={{
              display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0,
            }}>

              {/* ── Left: Order recap ── */}
              <div className="ck-recap" style={{
                width: 320, minWidth: 280,
                borderRight: '1.5px solid rgba(0,0,0,0.07)',
                padding: '24px 24px',
                overflowY: 'auto',
                background: '#fff',
                display: 'flex', flexDirection: 'column',
                flexShrink: 0,
              }}>
                <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
                  Récapitulatif · {totalItems} article{totalItems > 1 ? 's' : ''}
                </p>

                {/* Items */}
                <div style={{ flex: 1 }}>
                  {items.map(item => (
                    <OrderItemRow key={item.productId} item={item} accent={accent} />
                  ))}
                </div>

                {/* Totals */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Sous-total</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{fmtPrice(subtotal)}</span>
                  </div>
                  {discount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>Remise ({promoCode.toUpperCase()})</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#10B981' }}>- {fmtPrice(discount.amount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Livraison</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>Gratuite</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.07)',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a' }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1px' }}>
                      {fmtPrice(Math.max(0, subtotal - (discount?.amount || 0)))}
                    </span>
                  </div>
                </div>

                {/* Payment badge */}
                <div style={{
                  marginTop: 16, padding: '12px 14px',
                  borderRadius: 12,
                  background: `${accent}10`,
                  border: `1.5px solid ${accent}20`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#0a0a0a' }}>Paiement à la livraison</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(0,0,0,0.45)', marginTop: 1 }}>Tu règles directement au livreur</p>
                  </div>
                </div>
              </div>

              {/* ── Right: Form ── */}
              <form
                onSubmit={handleSubmit}
                className="ck-form-col"
                style={{
                  flex: 1, overflowY: 'auto',
                  padding: '24px 28px',
                  display: 'flex', flexDirection: 'column', gap: 0,
                }}
                noValidate
              >
                {/* API error */}
                {submitMutation.isError && (
                  <div style={{
                    marginBottom: 20,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: '#FEF2F2',
                    border: '1.5px solid #FECACA',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style={{ margin: 0, fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
                      {(submitMutation.error as Error)?.message || 'Une erreur est survenue. Réessaie.'}
                    </p>
                  </div>
                )}

                {/* ── Section: Identité ── */}
                <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 800, color: '#0a0a0a', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Tes informations
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div ref={el => { if (el) { const input = el.querySelector('input'); if (input && !firstInputRef.current) (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = input; }}}>
                    <Field label="Prénom" value={fields.firstName} onChange={set('firstName')} error={visibleErrors.firstName} placeholder="Moussa" />
                  </div>
                  <Field label="Nom" value={fields.lastName} onChange={set('lastName')} error={visibleErrors.lastName} placeholder="Diallo" />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Field
                    label="Téléphone"
                    value={fields.phone}
                    onChange={set('phone')}
                    error={visibleErrors.phone}
                    placeholder="771234567"
                    type="tel"
                    hint="Format sénégalais : 77, 78, 76, 75 ou 70"
                  />
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 20 }} />

                {/* ── Section: Livraison ── */}
                <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 800, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Adresse de livraison
                </p>

                <div style={{ marginBottom: 12 }}>
                  <Field
                    label="Adresse complète"
                    value={fields.address}
                    onChange={set('address')}
                    error={visibleErrors.address}
                    placeholder="Rue 12, Villa 4, Mermoz"
                    hint="Quartier, rue, numéro de porte..."
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Field label="Ville" value={fields.city} onChange={set('city')} error={visibleErrors.city} placeholder="Dakar" />
                </div>

                {/* ── Promo Code ── */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
                    Code promotionnel (optionnel)
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="ck-textarea"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Ex : SUMMER25"
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid rgba(0,0,0,0.12)',
                        fontSize: 14,
                        color: '#0a0a0a',
                        textTransform: 'uppercase',
                        background: '#fff',
                      }}
                    />
                    <button
                      type="button"
                      disabled={validatingPromo || !promoCode}
                      onClick={handleValidatePromo}
                      style={{
                        padding: '0 20px',
                        borderRadius: 12,
                        background: '#0a0a0a',
                        color: '#fff',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: validatingPromo || !promoCode ? 'not-allowed' : 'pointer',
                        opacity: validatingPromo || !promoCode ? 0.6 : 1,
                      }}
                    >
                      {validatingPromo ? '...' : 'Appliquer'}
                    </button>
                  </div>
                  {promoMessage && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: promoMessage.kind === 'error' ? '#EF4444' : '#10B981', marginTop: 2 }}>
                      {promoMessage.text}
                    </span>
                  )}
                </label>

                {/* ── Notes optionnelles ── */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
                    Instructions optionnelles
                  </span>
                  <textarea
                    className="ck-textarea"
                    value={fields.notes}
                    onChange={e => set('notes')(e.target.value)}
                    placeholder="Étage, code d'entrée, heure préférée..."
                    rows={3}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid rgba(0,0,0,0.12)',
                      fontSize: 14,
                      color: '#0a0a0a',
                      background: '#fff',
                      resize: 'vertical',
                      fontFamily: FONT_FAMILY_INTER,
                      transition: 'border-color 0.15s',
                      lineHeight: 1.55,
                    }}
                  />
                </label>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ck-submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 16,
                    border: 'none',
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    letterSpacing: '-0.2px',
                    boxShadow: `0 8px 24px ${accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'filter 0.15s, opacity 0.15s',
                    marginBottom: 10,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'ck-spin 0.7s linear infinite',
                      }} />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Confirmer la commande
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

                <p style={{ margin: 0, fontSize: 11, color: 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.55 }}>
                  En confirmant, tu acceptes les conditions de vente. Paiement sécurisé à la livraison.
                </p>

                <style>{`@keyframes ck-spin { to { transform: rotate(360deg); } }`}</style>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

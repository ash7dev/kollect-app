'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient, getErrorMessage } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { BackendUser } from '@/types/api';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Role = 'client' | 'vendeur' | null;
type Step = 1 | 2;

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

const IconBuyer = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconSeller = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const IconCheck = ({ color = '#fff', size = 10 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.75s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

// ─────────────────────────────────────────────
// Role Card
// ─────────────────────────────────────────────

interface RoleCardProps {
  id: Role;
  selected: boolean;
  onSelect: () => void;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  badge?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  tag: string;
}

function RoleCard({
  id, selected, onSelect,
  accentColor, accentBg, accentBorder,
  badge, icon, title, subtitle, description, features, tag,
}: RoleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      style={{
        flex: 1,
        minWidth: 0,
        background: selected ? '#fff' : '#fafafa',
        border: `2px solid ${selected ? accentColor : '#ebebeb'}`,
        borderRadius: 20,
        padding: '28px 24px 24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.15s',
        boxShadow: selected
          ? `0 0 0 4px ${accentColor}18, 0 8px 32px ${accentColor}14`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: selected ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: selected ? accentColor : 'transparent',
        borderRadius: '18px 18px 0 0',
        transition: 'background 0.2s',
      }} />

      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: accentColor, borderRadius: 6,
          padding: '3px 9px',
          fontSize: 10, fontWeight: 700, color: '#fff',
          letterSpacing: '0.6px', textTransform: 'uppercase',
        }}>
          {badge}
        </div>
      )}

      {/* Check indicator */}
      <div style={{
        position: 'absolute', top: 16, right: badge ? 80 : 16,
        width: 22, height: 22, borderRadius: '50%',
        background: selected ? accentColor : '#e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.2s',
        transform: selected ? 'scale(1)' : 'scale(0.85)',
      }}>
        <IconCheck color={selected ? '#fff' : '#d1d5db'} size={9} />
      </div>

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: selected ? accentBg : '#f0f0f0',
        border: `1.5px solid ${selected ? accentBorder : '#e5e7eb'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, color: selected ? accentColor : '#9ca3af',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      }}>
        {icon}
      </div>

      {/* Titles */}
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: 3 }}>
        {title}
      </p>
      <p style={{ fontSize: 12, fontWeight: 500, color: accentColor, marginBottom: 14, letterSpacing: '0.2px' }}>
        {subtitle}
      </p>
      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 22 }}>
        {description}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: '#f0f0f0', marginBottom: 18 }} />

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <div style={{
              width: 17, height: 17, borderRadius: '50%',
              background: selected ? accentBg : '#f5f5f5',
              border: `1px solid ${selected ? accentBorder : '#e8e8e8'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
              transition: 'background 0.2s, border-color 0.2s',
            }}>
              <IconCheck color={selected ? accentColor : '#d1d5db'} size={8} />
            </div>
            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Tag pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 10px', borderRadius: 999,
        background: selected ? accentBg : '#f5f5f5',
        border: `1px solid ${selected ? accentBorder : '#ebebeb'}`,
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: selected ? accentColor : '#9ca3af', letterSpacing: '0.3px' }}>
          {tag}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserRole, applyAuthResponse, refreshUser } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 — Brand form
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Slug auto-gen ──
  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    if (!slugManual) setBrandSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlugManual(true);
    setBrandSlug(slugify(value));
  };

  // ── Logo ──
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Step 1 submit ──
  // Pour les vendeurs, on ne touche pas encore au backend : l'appel updateUserRole
  // est différé au moment du submit ou du skip step 2, pour que le retour arrière
  // ne laisse pas un état incohérent côté serveur.
  const handleStep1Continue = async () => {
    if (!role) return;
    setError(null);

    if (role === 'client') {
      try {
        setLoading(true);
        await updateUserRole('client');
        router.replace('/');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Vendeur → step 2, pas d'appel API ici
    setStep(2);
  };

  // ── Step 2 submit ──
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setError(null);

    try {
      setLoading(true);

      // 1. Confirmer le rôle vendeur
      await updateUserRole('vendeur');

      // 2. Créer la marque
      const formData = new FormData();
      formData.append('name', brandName.trim());
      formData.append('slug', brandSlug || slugify(brandName));
      if (bio.trim()) formData.append('bio', bio.trim());
      if (whatsapp.trim()) formData.append('whatsapp', whatsapp.trim());
      if (instagram.trim()) formData.append('instagram', instagram.trim());
      if (logoFile) formData.append('logo', logoFile);

      const { data } = await apiClient.post<{ user: BackendUser; access_token: string }>(
        API_ENDPOINTS.BRANDS.CREATE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      // 3. Sync le contexte auth avec les données fraîches (brand attachée)
      applyAuthResponse(data);

      router.replace('/dashboard');
    } catch (err) {
      try { await refreshUser(); } catch { /* ignore */ }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Skip brand creation ──
  // L'user est vendeur mais décide de créer sa marque plus tard depuis le dashboard.
  const handleSkipBrand = async () => {
    setError(null);
    try {
      setLoading(true);
      await updateUserRole('vendeur');
      router.replace('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <main style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ob-step { animation: fadeUp 0.28s ease both; }
        .ob-input {
          width: 100%; padding: 12px 16px;
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
          color: #111; font-size: 15px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box; font-family: inherit;
        }
        .ob-input::placeholder { color: #b0b0b0; }
        .ob-input:focus { border-color: #FF3B30; box-shadow: 0 0 0 3px rgba(255,59,48,0.08); }
        .ob-textarea {
          width: 100%; padding: 12px 16px;
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
          color: #111; font-size: 15px; outline: none; resize: none; line-height: 1.6;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box; font-family: inherit;
        }
        .ob-textarea::placeholder { color: #b0b0b0; }
        .ob-textarea:focus { border-color: #FF3B30; box-shadow: 0 0 0 3px rgba(255,59,48,0.08); }
        .ob-btn-primary {
          padding: 13px 28px; background: #FF3B30; color: #fff;
          font-size: 15px; font-weight: 600; border-radius: 10px; border: none;
          cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: inherit; box-shadow: 0 4px 14px rgba(255,59,48,0.28);
        }
        .ob-btn-primary:hover:not(:disabled) { background: #e02920; box-shadow: 0 6px 20px rgba(255,59,48,0.36); }
        .ob-btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .ob-btn-primary:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }
        .ob-btn-ghost {
          padding: 12px 18px; background: transparent; color: #6b7280;
          font-size: 14px; font-weight: 500; border-radius: 10px; border: 1.5px solid #e5e7eb;
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s, border-color 0.15s, color 0.15s; font-family: inherit;
        }
        .ob-btn-ghost:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }
        .ob-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .ob-error {
          padding: 12px 16px; background: #fff5f4; border: 1.5px solid #ffd5d2;
          border-radius: 10px; font-size: 13px; color: #dc2626; line-height: 1.5;
        }
        .ob-drop-zone {
          border: 2px dashed #e5e7eb; border-radius: 14px; padding: 32px 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #fafafa;
        }
        .ob-drop-zone:hover, .ob-drop-zone.dragging { border-color: #FF3B30; background: #fff9f9; }
        .ob-cards { display: flex; gap: 16px; }
        @media (max-width: 600px) { .ob-cards { flex-direction: column !important; } }
        @media (max-width: 580px) { .ob-form-grid { grid-template-columns: 1fr !important; } }
      `}} />

      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: -200, right: -200, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,48,0.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -160, left: -160, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760, padding: '32px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            { n: 1, label: 'Profil' },
            { n: 2, label: 'Marque' },
          ].map(({ n, label }, idx) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {idx > 0 && (
                <div style={{ width: 36, height: 2, background: step >= n ? '#FF3B30' : '#e5e7eb', borderRadius: 2, transition: 'background 0.35s' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= n ? '#FF3B30' : '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step >= n ? '0 2px 8px rgba(255,59,48,0.28)' : 'none',
                  transition: 'background 0.35s, box-shadow 0.35s',
                }}>
                  {step > n
                    ? <IconCheck size={11} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: step >= n ? '#fff' : '#9ca3af' }}>{n}</span>
                  }
                </div>
                <span style={{ fontSize: 12, fontWeight: step === n ? 600 : 400, color: step === n ? '#111' : '#9ca3af', transition: 'color 0.2s' }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 760, padding: '52px 28px 72px', flex: 1 }}>

        {/* ═══════════ STEP 1 ═══════════ */}
        {step === 1 && (
          <div className="ob-step">
            {/* Heading */}
            <div style={{ marginBottom: 44 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999, background: '#fff5f4', border: '1px solid #ffd5d2', marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#FF3B30' }}>Personnalisation</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 800, color: '#111', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 14 }}>
                Comment souhaitez-vous<br />
                <span style={{ color: '#FF3B30' }}>utiliser Kollect ?</span>
              </h1>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 520 }}>
                Votre expérience sera adaptée à votre profil. Ce choix peut être modifié à tout moment depuis vos paramètres.
              </p>
            </div>

            {/* Cards */}
            <div className="ob-cards" style={{ marginBottom: 36 }}>
              <RoleCard
                id="client"
                selected={role === 'client'}
                onSelect={() => setRole('client')}
                accentColor="#FF3B30"
                accentBg="#fff5f4"
                accentBorder="#ffd5d2"
                icon={<IconBuyer />}
                title="Acheteur"
                subtitle="Je découvre & j'achète"
                description="Accédez aux drops de vos créateurs préférés, suivez leurs actualités et commandez en avant-première."
                features={[
                  'Drops exclusifs en avant-première',
                  '2 400+ créateurs à découvrir',
                  'Commandes protégées & suivies',
                ]}
                tag="Accès gratuit"
              />
              <RoleCard
                id="vendeur"
                selected={role === 'vendeur'}
                onSelect={() => setRole('vendeur')}
                accentColor="#7c3aed"
                accentBg="#f5f3ff"
                accentBorder="#ddd6fe"
                badge="Créateur"
                icon={<IconSeller />}
                title="Vendeur"
                subtitle="Je lance & je scale"
                description="Créez votre boutique, organisez des drops limités et vendez à une audience de 18 000+ acheteurs qualifiés."
                features={[
                  'Page de marque & boutique dédiée',
                  'Gestion des drops et des stocks',
                  'Encaissements sécurisés en avance',
                ]}
                tag="Dashboard CEO inclus"
              />
            </div>

            {/* Error */}
            {error && <div className="ob-error" style={{ marginBottom: 20 }}>{error}</div>}

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="ob-btn-primary"
                disabled={!role || loading}
                onClick={handleStep1Continue}
                style={{ minWidth: 200 }}
              >
                {loading ? <IconSpinner /> : (
                  <>
                    {role === 'vendeur' ? 'Créer ma marque' : 'Accéder à Kollect'}
                    <IconArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2 ═══════════ */}
        {step === 2 && (
          <div className="ob-step">
            {/* Heading */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999, background: '#f5f3ff', border: '1px solid #ddd6fe', marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#7c3aed' }}>Votre marque</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 800, color: '#111', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: 14 }}>
                Donnez vie à<br />
                <span style={{ color: '#FF3B30' }}>votre marque.</span>
              </h1>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 480 }}>
                Quelques informations pour créer votre espace. Tout peut être modifié depuis votre dashboard.
              </p>
            </div>

            <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Nom + Slug */}
              <div className="ob-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="ob-label" htmlFor="brandName">
                    Nom de la marque <span style={{ color: '#FF3B30' }}>*</span>
                  </label>
                  <input
                    id="brandName"
                    type="text"
                    className="ob-input"
                    placeholder="ex : Dakar Vibes"
                    value={brandName}
                    onChange={(e) => handleBrandNameChange(e.target.value)}
                    required
                    maxLength={60}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="ob-label" htmlFor="brandSlug">
                    URL de la boutique
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 13, color: '#9ca3af', pointerEvents: 'none',
                      fontFamily: "'SF Mono','Fira Code',monospace", whiteSpace: 'nowrap',
                    }}>
                      kollect.co/
                    </span>
                    <input
                      id="brandSlug"
                      type="text"
                      className="ob-input"
                      placeholder="dakar-vibes"
                      value={brandSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      maxLength={40}
                      style={{ paddingLeft: 102, fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 14 }}
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="ob-label">
                  Logo <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                </label>
                {logoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Preview" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: '1.5px solid #f0f0f0' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>Logo sélectionné</p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>{logoFile?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLogoPreview(null); setLogoFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#9ca3af', display: 'flex', borderRadius: 6 }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className={`ob-drop-zone${isDragging ? ' dragging' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <IconImage />
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 3 }}>Glissez votre logo ici</p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>
                        ou <span style={{ color: '#FF3B30', fontWeight: 500 }}>cliquez pour choisir</span>
                        {' '}· PNG, JPG, WebP — max 2 Mo
                      </p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>

              {/* Bio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="ob-label" style={{ marginBottom: 0 }}>
                    Bio <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                  </label>
                  <span style={{ fontSize: 12, color: bio.length > 260 ? '#FF3B30' : '#9ca3af' }}>{bio.length}/300</span>
                </div>
                <textarea
                  className="ob-textarea"
                  rows={3}
                  placeholder="Décrivez votre marque en quelques mots…"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                />
              </div>

              {/* Contacts */}
              <div className="ob-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="ob-label" htmlFor="whatsapp">
                    WhatsApp <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    </span>
                    <input id="whatsapp" type="tel" className="ob-input" placeholder="+221 77 000 00 00" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} style={{ paddingLeft: 36 }} />
                  </div>
                </div>
                <div>
                  <label className="ob-label" htmlFor="instagram">
                    Instagram <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optionnel)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af', fontWeight: 500, pointerEvents: 'none' }}>@</span>
                    <input id="instagram" type="text" className="ob-input" placeholder="dakar_vibes" value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))} style={{ paddingLeft: 30 }} />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && <div className="ob-error">{error}</div>}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                <button
                  type="button"
                  className="ob-btn-ghost"
                  onClick={() => { setStep(1); setError(null); }}
                  disabled={loading}
                >
                  <IconArrowLeft />
                  Retour
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Skip */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSkipBrand}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: '#9ca3af', fontFamily: 'inherit',
                      padding: '4px 8px', borderRadius: 6,
                      transition: 'color 0.15s',
                      textDecoration: 'underline', textUnderlineOffset: 3,
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    Passer pour l&apos;instant
                  </button>

                  <button
                    type="submit"
                    className="ob-btn-primary"
                    disabled={!brandName.trim() || loading}
                    style={{ minWidth: 210 }}
                  >
                    {loading ? <IconSpinner /> : (
                      <>
                        Lancer ma marque
                        <IconArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </div>
    </main>
  );
}

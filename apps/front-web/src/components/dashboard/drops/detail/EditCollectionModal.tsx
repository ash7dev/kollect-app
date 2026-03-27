'use client';

import { useState, useRef } from 'react';
import type { CeoCollectionDetail } from '@/types/drops';

const F = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

// ─── Field styles ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6,
  fontSize: 11.5, fontWeight: 700, color: 'rgba(0,0,0,0.5)',
  letterSpacing: '0.3px', textTransform: 'uppercase', fontFamily: F,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 11,
  fontSize: 13.5, fontWeight: 500, color: '#111', fontFamily: F,
  outline: 'none', transition: 'border-color 0.15s',
  background: '#fff',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type EditCollectionFields = {
  name: string;
  description: string;
  isFeatured: boolean;
  launchDate: string;
  /** undefined = pas de changement, null = supprimer, File = nouveau fichier */
  coverFile?: File | null;
};

type Props = {
  collection: CeoCollectionDetail;
  isPending: boolean;
  onSave: (fields: EditCollectionFields) => void;
  onCancel: () => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function EditCollectionModal({ collection, isPending, onSave, onCancel }: Props) {
  const [name, setName]             = useState(collection.name);
  const [description, setDesc]      = useState(collection.description ?? '');
  const [isFeatured, setFeatured]   = useState(collection.isFeatured);
  const [launchDate, setLaunchDate] = useState(() => {
    if (!collection.launchDate) return '';
    return new Date(collection.launchDate).toISOString().slice(0, 16);
  });
  // undefined = pas de changement, null = supprimer, File = nouveau fichier
  const [coverFile, setCoverFile]   = useState<File | null | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const currentCover = collection.teaserVideo ?? collection.coverImage ?? null;
  const isVideo = (url: string | null) => !!url && /\.(mp4|webm|mov)$/i.test(url);

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) { setCoverFile(undefined); setPreviewUrl(null); return; }
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const isTeaser = collection.status === 'TEASER';
  const canSave  = name.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({ name: name.trim(), description: description.trim(), isFeatured, launchDate, coverFile });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
        fontFamily: F,
        animation: 'cd-modal-in 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#FF3B30', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Modifier
            </p>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.3px' }}>
              Informations de la collection
            </h3>
          </div>
          <button
            type="button" onClick={onCancel}
            style={{
              width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(0,0,0,0.1)',
              background: 'rgba(0,0,0,0.03)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,0,0,0.45)" strokeWidth={2.2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '16px 0' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Nom de la collection *</label>
            <input
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Capsule Dakar 01"
              maxLength={100}
              onFocus={e => (e.currentTarget.style.borderColor = '#FF3B30')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.55 }}
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="L'histoire, l'inspiration, le style…"
              onFocus={e => (e.currentTarget.style.borderColor = '#FF3B30')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            />
          </div>

          {/* Cover media */}
          <div>
            <label style={labelStyle}>Cover (image ou vidéo)</label>

            {/* Current or new preview */}
            {(() => {
              const displayUrl  = previewUrl ?? (coverFile === null ? null : currentCover);
              const displayIsVideo = previewUrl
                ? coverFile instanceof File && coverFile.type.startsWith('video/')
                : isVideo(displayUrl);

              return displayUrl ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 10, aspectRatio: '16/9', background: '#0A0A0A' }}>
                  {displayIsVideo ? (
                    <video
                      src={displayUrl}
                      autoPlay loop muted playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayUrl}
                      alt="Cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  {/* Remove overlay button */}
                  <button
                    type="button"
                    onClick={() => { handleFileChange(null); setCoverFile(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}
                    title="Supprimer le média"
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  {previewUrl && (
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8,
                      padding: '3px 9px', borderRadius: 6,
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                      fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.3px',
                    }}>
                      Nouveau fichier
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state — click to pick */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    marginBottom: 10, aspectRatio: '16/9',
                    borderRadius: 12, border: '1.5px dashed rgba(0,0,0,0.15)',
                    background: 'rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 6, cursor: 'pointer',
                  }}
                >
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
                    stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                  </svg>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>Aucun média</span>
                </div>
              );
            })()}

            {/* Action row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  background: 'rgba(0,0,0,0.02)', color: 'rgba(0,0,0,0.6)',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
                }}
              >
                {currentCover || previewUrl ? 'Remplacer' : 'Choisir un fichier'}
              </button>
              {(currentCover || coverFile !== undefined) && coverFile !== null && (
                <button
                  type="button"
                  onClick={() => { if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } setCoverFile(null); }}
                  style={{
                    height: 36, padding: '0 14px', borderRadius: 10,
                    border: '1.5px solid rgba(239,68,68,0.25)',
                    background: 'rgba(239,68,68,0.04)', color: '#EF4444',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Launch date — TEASER only */}
          {isTeaser && (
            <div>
              <label style={labelStyle}>Date de lancement</label>
              <input
                type="datetime-local"
                style={inputStyle}
                value={launchDate}
                onChange={e => setLaunchDate(e.target.value)}
                onFocus={e => (e.currentTarget.style.borderColor = '#FF3B30')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
              />
            </div>
          )}

          {/* Featured toggle */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
            onClick={() => setFeatured(v => !v)}
          >
            {/* Toggle */}
            <div style={{
              width: 42, height: 24, borderRadius: 12, flexShrink: 0,
              background: isFeatured ? '#FF3B30' : 'rgba(0,0,0,0.12)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: isFeatured ? 20 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                transition: 'left 0.2s',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Mettre en avant (Featured)</div>
              <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.4)', marginTop: 1 }}>Apparaît en haut des listes et de l&apos;explorer.</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button" onClick={onCancel}
              style={{
                flex: 1, height: 42, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12,
                background: 'rgba(0,0,0,0.03)', color: 'rgba(0,0,0,0.6)',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSave || isPending}
              style={{
                flex: 1, height: 42, border: 'none', borderRadius: 12,
                background: (!canSave || isPending)
                  ? 'rgba(0,0,0,0.08)'
                  : 'linear-gradient(135deg, #FF3B30, #E0321F)',
                color: (!canSave || isPending) ? 'rgba(0,0,0,0.3)' : '#fff',
                fontSize: 13.5, fontWeight: 700,
                cursor: (!canSave || isPending) ? 'not-allowed' : 'pointer',
                fontFamily: F,
                boxShadow: (!canSave || isPending) ? 'none' : '0 4px 14px rgba(255,59,48,0.28)',
              }}
            >
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes cd-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import type { WizardDraft } from '@/types/drops';
import { Ic, I } from './wizard-icons';
import { CoverCropModal } from './CoverCropModal';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 800, letterSpacing: '0.1px',
      background: color === 'amber'  ? 'rgba(245,158,11,0.1)'  :
                  color === 'green'  ? 'rgba(16,185,129,0.1)'  :
                  color === 'red'    ? 'rgba(255,59,48,0.1)'   : 'rgba(0,0,0,0.06)',
      color:      color === 'amber'  ? '#B45309' :
                  color === 'green'  ? '#047857' :
                  color === 'red'    ? '#FF3B30'  : 'rgba(0,0,0,0.5)',
      border: `1px solid ${
                  color === 'amber'  ? 'rgba(245,158,11,0.2)'  :
                  color === 'green'  ? 'rgba(16,185,129,0.2)'  :
                  color === 'red'    ? 'rgba(255,59,48,0.2)'   : 'rgba(0,0,0,0.1)'}`,
    }}>
      {children}
    </span>
  );
}

function MetaCard({ icon, label, value, sub }: { icon: string | string[]; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{
      padding: '16px 18px', borderRadius: 16,
      background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'rgba(255,59,48,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ic d={icon} size={15} stroke="#FF3B30" sw={1.8} />
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.6px', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', fontWeight: 500, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function StepConfirmation({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const [mediaUrl, setMediaUrl] = useState(() => draft.collectionMedia ? URL.createObjectURL(draft.collectionMedia) : null);
  const [fallbackUrl] = useState(() => draft.products[0]?.images[0] ? URL.createObjectURL(draft.products[0].images[0]) : null);
  const [productUrls] = useState<string[]>(() => draft.products.map(p => p.images[0] ? URL.createObjectURL(p.images[0]) : ''));
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number } | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (file: File | null) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setCropFile(file);
      setCropSrc(URL.createObjectURL(file));
    } else {
      setDraft(d => ({ ...d, collectionMedia: file }));
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  const handleCropConfirm = (file: File, preview: string) => {
    setDraft(d => ({ ...d, collectionMedia: file }));
    setMediaUrl(preview);
    setCropSrc(null);
    setCropFile(null);
  };

  const isVideo  = draft.collectionMedia?.type?.startsWith('video');
  const isTeaser = draft.mode === 'teaser';

  const launchStr = draft.launchDate
    ? new Date(draft.launchDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const totalStock = draft.products.reduce((s, p) => s + Number(p.stock), 0);

  useEffect(() => {
    if (!isTeaser || !draft.launchDate) return;
    const tick = () => {
      const diff = new Date(draft.launchDate).getTime() - Date.now();
      if (diff > 0) setCountdown({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000) });
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [isTeaser, draft.launchDate]);

  return (
    <>
    {cropSrc && cropFile && (
      <CoverCropModal
        src={cropSrc}
        originalFile={cropFile}
        onConfirm={handleCropConfirm}
        onClose={() => { setCropSrc(null); setCropFile(null); }}
      />
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#FF3B30', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Prêt à lancer
        </p>
        <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.6px', lineHeight: 1.15 }}>
          Ton drop est{' '}
          <span style={{ color: '#FF3B30' }}>prêt à être lancé.</span>
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.45)', fontWeight: 500, lineHeight: 1.6, maxWidth: 520 }}>
          Vérifie les informations ci-dessous, puis clique sur <strong style={{ color: '#0A0A0A', fontWeight: 700 }}>Lancer le drop</strong> pour mettre ta collection en ligne. Une fois lancée, elle sera visible par ta communauté.
        </p>
      </div>

      {/* ── Cover hero ── */}
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden',
        position: 'relative', background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        {mediaUrl && !isVideo && (
          <img src={mediaUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {mediaUrl && isVideo && (
          <video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} muted playsInline />
        )}
        {!mediaUrl && fallbackUrl && (
          <img src={fallbackUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'blur(8px) brightness(0.45)', transform: 'scale(1.05)' }} />
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />

        {/* Actions cover */}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
          {mediaUrl && !isVideo && (
            <button type="button" onClick={() => { setCropFile(draft.collectionMedia); setCropSrc(mediaUrl); }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
            >
              <Ic d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" size={12} stroke="#fff" sw={2} />
              Ajuster
            </button>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
          >
            <Ic d={I.upload} size={12} stroke="#fff" sw={2} />
            Changer
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
          onChange={e => handleMediaChange(e.target.files?.[0] ?? null)} />

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
          <Badge color={isTeaser ? 'amber' : 'green'}>
            <Ic d={isTeaser ? I.clock : I.rocket} size={10} stroke="currentColor" sw={2.5} />
            {isTeaser ? 'Teaser' : 'Disponible'}
          </Badge>
          {draft.isFeatured && (
            <Badge color="red">
              <Ic d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={10} stroke="currentColor" sw={2} />
              Featured
            </Badge>
          )}
        </div>

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 4 }}>
            {draft.name || 'Sans titre'}
          </div>
          {draft.description && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {draft.description}
            </div>
          )}
        </div>
      </div>

      {/* ── Meta cards rail ── */}
      <div style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', paddingBottom: 4,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }} className="conf-rail">
        {[
          { icon: isTeaser ? I.clock : I.rocket, label: 'MODE',     value: isTeaser ? 'Teaser' : 'Immédiat',  sub: isTeaser ? 'Compte à rebours actif' : 'Dispo dès publication' },
          { icon: I.layers,                       label: 'PRODUITS', value: `${draft.products.length} article${draft.products.length > 1 ? 's' : ''}`, sub: `${totalStock} unités au total` },
          { icon: I.tag,                           label: 'STATUT',   value: draft.isFeatured ? 'Featured' : 'Standard', sub: draft.isFeatured ? "Mis en avant sur l'explorer" : 'Apparition normale' },
        ].map((card) => (
          <div key={card.label} style={{ flex: 1, minWidth: '180px', scrollSnapAlign: 'start' }}>
            <MetaCard {...card} />
          </div>
        ))}
      </div>

      {/* ── Date lancement ── */}
      {isTeaser && launchStr && (
        <div style={{
          padding: '16px 20px', borderRadius: 16,
          background: 'rgba(245,158,11,0.06)',
          border: '1.5px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ic d={I.clock} size={16} stroke="#B45309" sw={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#B45309', letterSpacing: '0.5px', marginBottom: 3 }}>DATE DE LANCEMENT</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '-0.2px', textTransform: 'capitalize' }}>{launchStr}</div>
          </div>
          {countdown && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {[{ v: countdown.d, u: 'j' }, { v: countdown.h, u: 'h' }, { v: countdown.m, u: 'm' }].map(({ v, u }) => (
                <div key={u} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: '#fff', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10, padding: '6px 10px', minWidth: 40,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#B45309', lineHeight: 1 }}>{v}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.3px', marginTop: 2 }}>{u}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Produits rail ── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.6px', marginBottom: 12 }}>
          PRODUITS INCLUS ({draft.products.length})
        </div>
        <div style={{
          display: 'flex', gap: 14,
          overflowX: 'auto', paddingBottom: 8,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }} className="conf-rail">
          {draft.products.map((p, i) => (
            <div key={i} style={{ flex: '0 0 min(220px, 72vw)', scrollSnapAlign: 'start' }}>
              <div className="conf-product-card" style={{
                borderRadius: 18, overflow: 'hidden',
                background: '#000', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}>
                {/* Image 3/4 */}
                <div style={{ aspectRatio: '3/4', background: '#111', overflow: 'hidden', position: 'relative' }}>
                  {productUrls[i]
                    ? <img src={productUrls[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1a1a1a, #111)' }}>
                        <Ic d={I.img} size={28} stroke="rgba(255,255,255,0.15)" />
                      </div>
                  }
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 800, letterSpacing: '0.8px', color: '#fff', background: '#FF3B30', padding: '3px 8px', borderRadius: 99 }}>
                      PRINCIPAL
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name || `Produit ${i + 1}`}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#FF3B30', letterSpacing: '-0.4px', marginBottom: 8 }}>
                    {p.price > 0 ? `${fmt(p.price)} CFA` : '—'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.sizes.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 5 }}>{s}</span>
                      ))}
                      {p.sizes.length > 3 && <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>+{p.sizes.length - 3}</span>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>{p.stock} unités</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .conf-rail { scrollbar-width: none; }
        .conf-rail::-webkit-scrollbar { display: none; }
        .conf-product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important; }
      `}</style>
    </div>
    </>
  );
}

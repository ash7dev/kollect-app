/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, useCallback } from 'react';
import type { WizardDraft, WizardProductDraft } from '@/types/drops';
import { useCreateCollection } from '@/hooks/dashboard/useCreateCollection';
import { getErrorMessage } from '@/services/api/client';
import { WIZARD_CSS, COLORS, SIZES, genSKU } from './wizard-styles';

// ─── Inline SVG icons ──────────────────────────────────────────────────────────
function Ic({ d, size = 16, stroke = 'currentColor', sw = 1.6, fill = 'none' }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number; fill?: string;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}
const I = {
  check: 'M20 6L9 17l-5-5',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 6l6 6-6 6',
  plus: ['M12 5v14', 'M5 12h14'],
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2'],
  img: ['M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  video: ['M23 7l-7 5 7 5V7z', 'M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  rocket: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  clock: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z',
  info: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 16v-4', 'M12 8h.01'],
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  close: ['M18 6L6 18', 'M6 6l12 12'],
  layers: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
};

// ─── Calendar Component ────────────────────────────────────────────────────────
function Calendar({ value, onChange, minDate }: {
  value: Date; onChange: (d: Date) => void; minDate?: Date;
}) {
  const [view, setView] = useState(() => {
    const d = new Date(value); d.setDate(1); return d;
  });
  const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const today = new Date(); today.setHours(0,0,0,0);

  const prevMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth() - 1); return d; });
  const nextMonth = () => setView(v => { const d = new Date(v); d.setMonth(d.getMonth() + 1); return d; });

  const year = view.getFullYear(); const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; cur: boolean; date: Date }> = [];
  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i); cells.push({ day: daysInPrev - i, cur: false, date: d });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, cur: true, date: new Date(year, month, i) });
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(year, month + 1, cells.length - daysInMonth - offset + 1);
    cells.push({ day: d.getDate(), cur: false, date: d });
  }

  return (
    <div className="wz-cal">
      <div className="wz-cal-header">
        <button type="button" className="wz-cal-nav" onClick={prevMonth}><Ic d={I.left} size={14} sw={2} /></button>
        <span className="wz-cal-month">{MONTHS[month]} {year}</span>
        <button type="button" className="wz-cal-nav" onClick={nextMonth}><Ic d={I.right} size={14} sw={2} /></button>
      </div>
      <div className="wz-cal-days">
        {DAYS.map(d => <div key={d} className="wz-cal-day-label">{d}</div>)}
        {cells.map((cell, idx) => {
          const cellDate = cell.date; cellDate.setHours(0,0,0,0);
          const isDisabled = minDate ? cellDate < minDate : false;
          const isSel = value.toDateString() === cellDate.toDateString();
          const isToday = today.toDateString() === cellDate.toDateString();
          return (
            <button key={idx} type="button" disabled={isDisabled}
              className={`wz-cal-day${isSel ? ' sel' : isToday ? ' today' : ''}${!cell.cur ? ' other-month' : ''}`}
              onClick={() => { const nd = new Date(value); nd.setFullYear(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate()); onChange(nd); }}
            >{cell.day}</button>
          );
        })}
      </div>
    </div>
  );
}

function TimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const hh = value.getHours().toString().padStart(2,'0');
  const mm = value.getMinutes().toString().padStart(2,'0');
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="wz-time-wrap">
      <div className="wz-time-label">HEURE DE LANCEMENT</div>
      <div className="wz-time-row">
        <input className="wz-time-input" type="number" min={0} max={23} value={hh}
          onChange={e => { const nd = new Date(value); nd.setHours(clamp(+e.target.value,0,23)); onChange(nd); }} />
        <span className="wz-time-sep">:</span>
        <input className="wz-time-input" type="number" min={0} max={59} value={mm}
          onChange={e => { const nd = new Date(value); nd.setMinutes(clamp(+e.target.value,0,59)); onChange(nd); }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
        {value.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })} à {hh}:{mm}
      </div>
    </div>
  );
}

// ─── Step 1 – Products ─────────────────────────────────────────────────────────
function emptyProduct(): WizardProductDraft {
  return { name:'', description:'', price:0, stock:10, sku:'', sizes:[], colors:[], images:[] };
}

function ProductFormPanel({ product, onChange, onRemove, idx }: {
  product: WizardProductDraft; onChange: (p: WizardProductDraft) => void;
  onRemove?: () => void; idx: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [open, setOpen] = useState(idx === 0);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - product.images.length);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...newPreviews].slice(0,5));
    onChange({ ...product, images: [...product.images, ...newFiles].slice(0,5) });
  };

  const removeImg = (i: number) => {
    const imgs = product.images.filter((_,j) => j!==i);
    const prevs = previews.filter((_,j) => j!==i);
    setPreviews(prevs); onChange({ ...product, images: imgs });
  };

  const toggleSize = (s: string) => {
    const next = product.sizes.includes(s) ? product.sizes.filter(x=>x!==s) : [...product.sizes, s];
    onChange({ ...product, sizes: next });
  };
  const toggleColor = (c: string) => {
    const next = product.colors.includes(c) ? product.colors.filter(x=>x!==c) : [...product.colors, c];
    onChange({ ...product, colors: next });
  };

  const autoSku = () => onChange({ ...product, sku: genSKU(product.name) });

  return (
    <div className="wz-product-card">
      {/* Collapsed header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }} onClick={() => setOpen(o=>!o)}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:13, fontWeight:900, color:'#FF3B30' }}>{idx+1}</span>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:'#111' }}>{product.name || `Produit ${idx+1}`}</div>
            {product.price > 0 && <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', fontWeight:600 }}>{new Intl.NumberFormat('fr-FR').format(product.price)} CFA</div>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {onRemove && (
            <button type="button" onClick={e=>{ e.stopPropagation(); onRemove(); }}
              style={{ width:30, height:30, borderRadius:8, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#EF4444' }}>
              <Ic d={I.trash} size={13} stroke="#EF4444" sw={1.8} />
            </button>
          )}
          <div style={{ color:'rgba(0,0,0,0.3)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
            <Ic d={I.right} size={14} sw={2} />
          </div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Name */}
          <div className="wz-field">
            <label className="wz-label">Nom du produit <span>*</span></label>
            <input className="wz-input" placeholder="Ex: T-shirt Dakar Classic" value={product.name}
              onChange={e => onChange({ ...product, name: e.target.value })} />
          </div>

          {/* Desc */}
          <div className="wz-field">
            <label className="wz-label">Description <span>*</span></label>
            <textarea className="wz-textarea" placeholder="Décris le produit, la matière, la coupe..." value={product.description}
              onChange={e => onChange({ ...product, description: e.target.value })} />
          </div>

          {/* Price + Stock */}
          <div className="wz-grid-2">
            <div className="wz-field">
              <label className="wz-label">Prix (CFA) <span>*</span></label>
              <input className="wz-input" type="number" min={0} placeholder="15000" value={product.price || ''}
                onChange={e => onChange({ ...product, price: +e.target.value })} />
            </div>
            <div className="wz-field">
              <label className="wz-label">Stock <span>*</span></label>
              <input className="wz-input" type="number" min={0} placeholder="10" value={product.stock || ''}
                onChange={e => onChange({ ...product, stock: +e.target.value })} />
            </div>
          </div>

          {/* SKU */}
          <div className="wz-field">
            <label className="wz-label">SKU</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className="wz-input" placeholder="Ex: DK01-TEE-BLK" value={product.sku}
                onChange={e => onChange({ ...product, sku: e.target.value })} style={{ flex:1 }} />
              <button type="button" onClick={autoSku}
                style={{ padding:'0 14px', borderRadius:12, border:'1.5px solid rgba(0,0,0,0.12)', background:'rgba(0,0,0,0.03)', fontSize:12, fontWeight:700, color:'rgba(0,0,0,0.55)', cursor:'pointer', whiteSpace:'nowrap' }}>
                Auto
              </button>
            </div>
            <p className="wz-hint">Identifiant unique du produit (généré automatiquement si vide)</p>
          </div>

          {/* Images */}
          <div className="wz-field">
            <label className="wz-label">Photos <span>*</span></label>
            <p className="wz-hint" style={{ marginTop:0, marginBottom:8 }}>{product.images.length}/5 images — La première sera l&apos;image principale</p>
            <div className="wz-img-grid">
              {previews.map((src, i) => (
                <div key={i} className="wz-img-thumb">
                  <img src={src} alt="" />
                  <button type="button" className="wz-img-remove" onClick={() => removeImg(i)}>
                    <Ic d={I.close} size={10} stroke="#fff" sw={2.5} />
                  </button>
                  {i === 0 && <div className="wz-img-main-badge">PRINCIPAL</div>}
                </div>
              ))}
              {product.images.length < 5 && (
                <button type="button" className="wz-add-img" onClick={() => fileRef.current?.click()}>
                  <Ic d={I.img} size={20} stroke="currentColor" />
                  <span className="wz-add-img-label">Ajouter</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }}
              onChange={e => addImages(e.target.files)} />
          </div>

          {/* Sizes */}
          <div className="wz-field">
            <label className="wz-label">Tailles disponibles <span>*</span></label>
            <div className="wz-pills">
              {SIZES.map(s => (
                <button key={s} type="button" className={`wz-pill${product.sizes.includes(s) ? ' sel' : ''}`}
                  onClick={() => toggleSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="wz-field">
            <label className="wz-label">Couleurs disponibles <span>*</span></label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:6 }}>
              {COLORS.map(c => (
                <div key={c.value} title={c.name}
                  className={`wz-color-swatch${product.colors.includes(c.value) ? ' sel' : ''}`}
                  style={{ background: c.value, border: c.value === '#FFFFFF' ? '2px solid rgba(0,0,0,0.15)' : undefined }}
                  onClick={() => toggleColor(c.value)}>
                  {product.colors.includes(c.value) && (
                    <div style={{ width:'100%', height:'100%', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.25)' }}>
                      <Ic d={I.check} size={14} stroke="#fff" sw={2.5} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 – Collection & Teaser ─────────────────────────────────────────────
function StepTeaser({ draft, setDraft }: { draft: WizardDraft; setDraft: React.Dispatch<React.SetStateAction<WizardDraft>> }) {
  const [dragging, setDragging] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [launchDate, setLaunchDate] = useState<Date>(() => {
    if (draft.launchDate) return new Date(draft.launchDate);
    const d = new Date(); d.setHours(d.getHours() + 24); return d;
  });

  const minDate = new Date(); minDate.setHours(0,0,0,0);
  const isTeaser = draft.mode === 'teaser';
  const mediaType = draft.collectionMedia?.type?.startsWith('video') ? 'video' : 'photo';

  const handleFile = (file: File | null) => {
    if (!file) return;
    setDraft(d => ({ ...d, collectionMedia: file }));
    setMediaPreview(URL.createObjectURL(file));
  };

  const updateLaunchDate = (d: Date) => {
    setLaunchDate(d);
    setDraft(prev => ({ ...prev, launchDate: d.toISOString() }));
  };

  return (
    <div>
      <h2 className="wz-section-title">Identité de la collection</h2>
      <p className="wz-section-sub">Nomme ta collection et configure le teaser avant le lancement.</p>

      {/* Name */}
      <div className="wz-field">
        <label className="wz-label">Nom de la collection <span>*</span></label>
        <input className="wz-input" placeholder="Ex: Capsule Dakar 01" value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
      </div>

      {/* Description */}
      <div className="wz-field">
        <label className="wz-label">Description <span>*</span></label>
        <textarea className="wz-textarea" placeholder="L'histoire, l'inspiration, le style..." value={draft.description}
          onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
      </div>

      {/* Mode */}
      <div className="wz-field">
        <label className="wz-label">Mode de lancement <span>*</span></label>
        <div className="wz-toggle-group">
          <button type="button" className={`wz-toggle-btn${!isTeaser ? ' active' : ''}`}
            onClick={() => setDraft(d => ({ ...d, mode: 'disponible' }))}>
            <Ic d={I.rocket} size={14} stroke="currentColor" />
            Disponible immédiatement
          </button>
          <button type="button" className={`wz-toggle-btn${isTeaser ? ' active' : ''}`}
            onClick={() => setDraft(d => ({ ...d, mode: 'teaser' }))}>
            <Ic d={I.clock} size={14} stroke="currentColor" />
            Teaser (lancement planifié)
          </button>
        </div>
        <p className="wz-hint" style={{ marginTop:8 }}>
          {isTeaser ? 'Une date de lancement est requise. La collection sera en mode teaser jusqu&apos;à cette date.' : 'La collection sera disponible immédiatement à l&apos;achat.'}
        </p>
      </div>

      {/* Media */}
      <div className="wz-field">
        <label className="wz-label">Média teaser <span style={{ color:'rgba(0,0,0,0.35)', fontWeight:500 }}>(optionnel)</span></label>
        <div className="wz-info-box">
          <Ic d={I.info} size={16} stroke="#3B82F6" sw={1.8} />
          <span>Avec un média, la collection démarre en mode <strong>Teaser</strong> avec un compte à rebours. Sans média, elle est disponible immédiatement.</span>
        </div>
        {mediaPreview ? (
          <div className="wz-media-preview">
            {mediaType === 'video'
              ? <video src={mediaPreview} controls muted style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              : <img src={mediaPreview} alt="Aperçu" />
            }
            <button type="button" className="wz-media-change" onClick={() => fileRef.current?.click()}>
              Changer
            </button>
            <button type="button" onClick={() => { setMediaPreview(null); setDraft(d => ({ ...d, collectionMedia: null })); }}
              style={{ position:'absolute', top:10, right:10, width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.55)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ic d={I.close} size={12} stroke="#fff" sw={2.5} />
            </button>
          </div>
        ) : (
          <div className={`wz-upload-zone${dragging ? ' drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <div className="wz-upload-zone-icon">
              <Ic d={I.upload} size={22} stroke="rgba(0,0,0,0.4)" />
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'rgba(0,0,0,0.65)', marginBottom:4 }}>
              Glisse une image ou une vidéo ici
            </div>
            <div style={{ fontSize:12, color:'rgba(0,0,0,0.38)' }}>ou clique pour parcourir — JPG, PNG, MP4, MOV (max 100 Mo)</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)} />
      </div>

      {/* Launch date (only in teaser mode) */}
      {isTeaser && (
        <div className="wz-field">
          <label className="wz-label">Date & heure de lancement <span>*</span></label>
          <div className="wz-cal-wrap">
            <Calendar value={launchDate} onChange={updateLaunchDate} minDate={minDate} />
            <TimePicker value={launchDate} onChange={updateLaunchDate} />
          </div>
        </div>
      )}

      {/* Featured */}
      <div className="wz-field">
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:'rgba(0,0,0,0.02)', border:'1px solid rgba(0,0,0,0.08)', cursor:'pointer' }}
          onClick={() => setDraft(d => ({ ...d, isFeatured: !d.isFeatured }))}>
          <div style={{ width:44, height:24, borderRadius:12, background: draft.isFeatured ? '#FF3B30' : 'rgba(0,0,0,0.12)', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
            <div style={{ position:'absolute', top:3, left: draft.isFeatured ? 22 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)', transition:'left 0.2s' }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Mettre en avant (Featured)</div>
            <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.4)', marginTop:2 }}>La collection apparaîtra en haut des listes et de l&apos;explorer.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 – Confirmation ─────────────────────────────────────────────────────
function StepConfirmation({ draft }: { draft: WizardDraft }) {
  const [countdown, setCountdown] = useState<{d:number;h:number;m:number;s:number}|null>(null);
  const firstImg = draft.products[0]?.images[0];
  const [previewUrl] = useState(() => firstImg ? URL.createObjectURL(firstImg) : null);
  const mediaPreviewUrl = draft.collectionMedia ? URL.createObjectURL(draft.collectionMedia) : null;
  const isVideo = draft.collectionMedia?.type?.startsWith('video');
  const hasMedia = !!draft.collectionMedia;

  // Countdown
  if (draft.mode === 'teaser' && draft.launchDate && !countdown) {
    const tick = () => {
      const diff = new Date(draft.launchDate).getTime() - Date.now();
      if (diff > 0) {
        setCountdown({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
      }
    };
    tick();
  }

  const launchStr = draft.launchDate
    ? new Date(draft.launchDate).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : 'Immédiat';

  return (
    <div>
      <h2 className="wz-section-title">Récapitulatif du drop</h2>
      <p className="wz-section-sub">Vérifie tout avant de lancer ta collection.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }} className="wz-confirm-grid">
        {/* Left: summary card */}
        <div className="wz-summary-card">
          {/* Cover */}
          <div style={{ width:'100%', height:180, background:'linear-gradient(135deg,#1a1a2e,#0f3460)', position:'relative', overflow:'hidden' }}>
            {mediaPreviewUrl && !isVideo && <img src={mediaPreviewUrl} alt="Cover" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
            {mediaPreviewUrl && isVideo && <video src={mediaPreviewUrl} style={{ width:'100%', height:'100%', objectFit:'contain' }} muted />}
            {!mediaPreviewUrl && previewUrl && <img src={previewUrl} alt="Cover" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)' }} />
            <div style={{ position:'absolute', bottom:14, left:14, right:14 }}>
              <div style={{ fontSize:16, fontWeight:900, color:'#fff', letterSpacing:'-0.3px' }}>{draft.name || 'Sans titre'}</div>
              <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99, background: hasMedia ? 'rgba(245,158,11,0.8)' : 'rgba(16,185,129,0.8)', color:'#fff' }}>
                  {hasMedia ? 'Teaser' : 'Disponible'}
                </span>
                {draft.isFeatured && (
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99, background:'rgba(255,59,48,0.8)', color:'#fff' }}>Featured</span>
                )}
              </div>
            </div>
          </div>

          <div className="wz-summary-body">
            <div className="wz-summary-row">
              <div className="wz-summary-icon"><Ic d={I.tag} size={14} stroke="rgba(0,0,0,0.5)" /></div>
              <div><div className="wz-summary-key">COLLECTION</div><div className="wz-summary-val">{draft.name || '—'}</div></div>
            </div>
            <div className="wz-summary-row">
              <div className="wz-summary-icon"><Ic d={I.clock} size={14} stroke="rgba(0,0,0,0.5)" /></div>
              <div>
                <div className="wz-summary-key">LANCEMENT</div>
                <div className="wz-summary-val">{launchStr}</div>
                {countdown && <div style={{ marginTop:6, display:'flex', gap:4, flexWrap:'wrap' }}>
                  {[`${countdown.d}j`, `${countdown.h}h`, `${countdown.m}m`].map(v => (
                    <span key={v} style={{ fontSize:11, fontWeight:800, background:'rgba(245,158,11,0.1)', color:'#B45309', padding:'2px 7px', borderRadius:6 }}>{v}</span>
                  ))}
                </div>}
              </div>
            </div>
            <div className="wz-summary-row">
              <div className="wz-summary-icon"><Ic d={I.layers} size={14} stroke="rgba(0,0,0,0.5)" /></div>
              <div><div className="wz-summary-key">PRODUITS</div><div className="wz-summary-val">{draft.products.length} produit{draft.products.length > 1 ? 's' : ''}</div></div>
            </div>
          </div>
        </div>

        {/* Right: products minilist */}
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:'rgba(0,0,0,0.5)', letterSpacing:'0.5px', marginBottom:12 }}>PRODUITS INCLUS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {draft.products.map((p, i) => {
              const imgUrl = p.images[0] ? URL.createObjectURL(p.images[0]) : null;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:14, background:'#fff', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:'#F5F5F5', flexShrink:0 }}>
                    {imgUrl && <img src={imgUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name || `Produit ${i+1}`}</div>
                    <div style={{ fontSize:12, color:'rgba(0,0,0,0.4)', fontWeight:600, marginTop:2 }}>
                      {p.price > 0 ? `${new Intl.NumberFormat('fr-FR').format(p.price)} CFA` : '—'} · {p.stock} units
                    </div>
                  </div>
                  {p.images.length > 0 && (
                    <div style={{ fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.3)' }}>{p.images.length} img</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 750px) { .wz-confirm-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ─── Main wizard ───────────────────────────────────────────────────────────────
function initDraft(): WizardDraft {
  return { name:'', description:'', isFeatured:false, mode:'disponible', launchDate:'', collectionMedia:null, products:[emptyProduct()] };
}

export function DropsWizardModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<WizardDraft>(initDraft);
  const [error, setError] = useState<string|null>(null);
  const createMutation = useCreateCollection();
  const submitting = createMutation.isPending;

  const reset = useCallback(() => { setStep(1); setDraft(initDraft()); setError(null); }, []);
  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  const updateProduct = (idx: number, p: WizardProductDraft) => {
    setDraft(d => { const prods = [...d.products]; prods[idx] = p; return { ...d, products: prods }; });
  };
  const removeProduct = (idx: number) => {
    setDraft(d => ({ ...d, products: d.products.filter((_,i) => i!==idx) }));
  };
  const addProduct = () => {
    setDraft(d => ({ ...d, products: [...d.products, emptyProduct()] }));
  };

  // Validation per step
  const canProceed = () => {
    if (step === 1) {
      return draft.products.length > 0 && draft.products.every(p => p.name.trim() && p.price > 0 && p.images.length > 0 && p.sizes.length > 0 && p.colors.length > 0);
    }
    if (step === 2) {
      const base = !!draft.name.trim() && !!draft.description.trim();
      if (draft.mode === 'teaser') return base && !!draft.launchDate;
      return base;
    }
    return true;
  };

  const handleLaunch = async () => {
    setError(null);
    // Auto-fill SKUs
    const products = draft.products.map(p => ({ ...p, sku: p.sku.trim() || genSKU(p.name) }));
    try {
      await createMutation.mutateAsync({ ...draft, products });
      onCreated?.();
      reset();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{WIZARD_CSS}</style>
      <div className="wz-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="wz-modal" onMouseDown={e => e.stopPropagation()}>

          {/* Header */}
          <div className="wz-header">
            <div>
              <h2 className="wz-title">Nouveau Drop</h2>
              <p className="wz-subtitle">
                {step === 1 ? 'Produits de la collection' : step === 2 ? 'Identité & teaser' : 'Vérification & lancement'}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(0,0,0,0.3)', letterSpacing:0.2 }}>{step} / 3</span>
              <button type="button" className="wz-close" onClick={handleClose}>
                <Ic d={I.close} size={14} stroke="currentColor" sw={2} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="wz-body">
            {step === 1 && (
              <div>
                <h2 className="wz-section-title">Produits de la collection</h2>
                <p className="wz-section-sub">Ajoute au moins un produit avec ses photos, tailles et couleurs.</p>
                {draft.products.map((p, idx) => (
                  <ProductFormPanel key={idx} product={p} idx={idx}
                    onChange={np => updateProduct(idx, np)}
                    onRemove={draft.products.length > 1 ? () => removeProduct(idx) : undefined}
                  />
                ))}
                <button type="button" onClick={addProduct}
                  style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'13px 16px', borderRadius:14, border:'2px dashed rgba(0,0,0,0.12)', background:'rgba(0,0,0,0.01)', cursor:'pointer', color:'rgba(0,0,0,0.5)', fontSize:13, fontWeight:700, justifyContent:'center', marginTop:4, transition:'border-color 0.15s' }}>
                  <Ic d={I.plus} size={16} stroke="currentColor" sw={2} />
                  Ajouter un produit
                </button>
              </div>
            )}

            {step === 2 && <StepTeaser draft={draft} setDraft={setDraft} />}
            {step === 3 && <StepConfirmation draft={draft} />}

            {error && <div className="wz-error-box" style={{ marginTop:16 }}>{error}</div>}
          </div>

          {/* Footer */}
          <div className="wz-footer">
            <button type="button" className="wz-btn-back"
              onClick={() => step > 1 ? setStep(s => (s-1) as 1|2|3) : handleClose()}
              disabled={submitting}>
              <Ic d={I.left} size={14} sw={2} />
              {step === 1 ? 'Annuler' : 'Précédent'}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(0,0,0,0.3)' }}>{step}/3</span>
              {step < 3 ? (
                <button type="button" className="wz-btn-next" onClick={() => setStep(s => (s+1) as 2|3)}
                  disabled={!canProceed()}>
                  Suivant
                  <Ic d={I.right} size={14} stroke="#fff" sw={2} />
                </button>
              ) : (
                <button type="button" className="wz-btn-launch" onClick={handleLaunch}
                  disabled={submitting}>
                  {submitting ? (
                    <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'wz-spin 0.7s linear infinite' }} />
                  ) : <Ic d={I.rocket} size={15} stroke="#fff" sw={2} />}
                  {submitting ? 'Création en cours...' : 'Lancer le drop'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes wz-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

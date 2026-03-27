/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import type { WizardDraft } from '@/types/drops';
import { Ic, I } from './wizard-icons';
import { DateTimePicker } from './DateTimePicker';

export function StepTeaser({ draft, setDraft }: {
  draft: WizardDraft;
  setDraft: React.Dispatch<React.SetStateAction<WizardDraft>>;
}) {
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
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#FF3B30', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
        Étape 2 sur 3
      </p>
      <h2 className="wz-section-title">
        Donne une{' '}
        <span style={{ color: '#FF3B30' }}>identité</span> à ta collection.
      </h2>
      <p className="wz-section-sub">
        Un nom fort, une description qui donne envie et un visuel teaser — c&apos;est ce qui va créer l&apos;impatience chez ta communauté avant même le lancement.
      </p>

      <div className="wz-field">
        <label className="wz-label">Nom de la collection <span>*</span></label>
        <input className="wz-input" placeholder="Ex: Capsule Dakar 01" value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
      </div>

      <div className="wz-field">
        <label className="wz-label">Description <span>*</span></label>
        <textarea className="wz-textarea" placeholder="L'histoire, l'inspiration, le style..." value={draft.description}
          onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
      </div>

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

      <div className="wz-field">
        <label className="wz-label">Média teaser <span style={{ color:'rgba(0,0,0,0.35)', fontWeight:500 }}>(optionnel)</span></label>
        <div className="wz-info-box">
          <Ic d={I.info} size={16} stroke="#3B82F6" sw={1.8} />
          <span>Optionnel. Ajoute une image ou une vidéo pour habiller ta collection, que ce soit en mode teaser ou disponible immédiatement.</span>
        </div>
        {mediaPreview ? (
          <div className="wz-media-preview">
            {mediaType === 'video'
              ? <video src={mediaPreview} controls muted style={{ width:'100%', height:'100%', objectFit:'cover' }} />
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

      {isTeaser && (
        <div className="wz-field">
          <label className="wz-label">Date & heure de lancement <span>*</span></label>
          <DateTimePicker value={launchDate} onChange={updateLaunchDate} minDate={minDate} />
        </div>
      )}

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

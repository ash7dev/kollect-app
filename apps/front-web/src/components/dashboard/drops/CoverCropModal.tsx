'use client';

import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Ic, I } from './wizard-icons';

async function cropImageToFile(src: string, cropPx: Area, originalFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = cropPx.width;
      canvas.height = cropPx.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        resolve(new File([blob], originalFile.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function CoverCropModal({ src, originalFile, onConfirm, onClose }: {
  src: string;
  originalFile: File;
  onConfirm: (file: File, previewUrl: string) => void;
  onClose: () => void;
}) {
  const [crop, setCrop]       = useState({ x: 0, y: 0 });
  const [zoom, setZoom]       = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_: Area, px: Area) => {
    setCroppedArea(px);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setApplying(true);
    try {
      const file = await cropImageToFile(src, croppedArea, originalFile);
      const preview = URL.createObjectURL(file);
      onConfirm(file, preview);
    } catch { /* ignore */ } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button type="button" onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
        }}>
          <Ic d={I.close} size={16} stroke="currentColor" sw={2} />
          Annuler
        </button>

        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          Ajuster le visuel
        </span>

        <button type="button" onClick={handleConfirm} disabled={applying} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: applying ? 'rgba(255,59,48,0.5)' : '#FF3B30',
          color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}>
          {applying
            ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'crop-spin 0.7s linear infinite' }} />
            : <Ic d={I.check} size={14} stroke="#fff" sw={2.5} />
          }
          {applying ? 'Application…' : 'Appliquer'}
        </button>
      </div>

      {/* Cropper */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: 'transparent' },
            cropAreaStyle: { border: '2px solid #FF3B30', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div style={{
        padding: '20px 24px 32px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
          ZOOM
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 320 }}>
          <Ic d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" size={16} stroke="rgba(255,255,255,0.4)" sw={1.8} />
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#FF3B30', cursor: 'pointer' }}
          />
          <Ic d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 8v6M8 11h6" size={16} stroke="rgba(255,255,255,0.4)" sw={1.8} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
          Glisse pour repositionner · Pinch ou molette pour zoomer
        </p>
      </div>

      <style>{`@keyframes crop-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

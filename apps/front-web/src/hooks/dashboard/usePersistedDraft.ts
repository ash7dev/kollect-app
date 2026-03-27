'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { WizardDraft, WizardProductDraft } from '@/types/drops';

const DRAFT_KEY = 'kollect_wz_draft';
const STEP_KEY  = 'kollect_wz_step';

// ─── Sérialisation ────────────────────────────────────────────────────────────

type SerializedFile = { __f: true; name: string; type: string; data: string };
type SerializedProduct = Omit<WizardProductDraft, 'images'> & { images: SerializedFile[] };
type SerializedDraft   = Omit<WizardDraft, 'collectionMedia' | 'products'> & {
  collectionMedia: SerializedFile | null;
  products: SerializedProduct[];
};

function fileToBase64(file: File): Promise<SerializedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve({ __f: true, name: file.name, type: file.type, data: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToFile(s: SerializedFile): File {
  const [header, b64] = s.data.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? s.type;
  const bytes = atob(b64);
  const u8 = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) u8[i] = bytes.charCodeAt(i);
  return new File([u8], s.name, { type: mime });
}

async function serialize(draft: WizardDraft): Promise<SerializedDraft> {
  const collectionMedia = draft.collectionMedia
    ? await fileToBase64(draft.collectionMedia)
    : null;
  const products = await Promise.all(
    draft.products.map(async (p) => ({
      ...p,
      images: await Promise.all(p.images.map(fileToBase64)),
    }))
  );
  return { ...draft, collectionMedia, products };
}

function deserialize(raw: SerializedDraft): WizardDraft {
  return {
    ...raw,
    collectionMedia: raw.collectionMedia ? base64ToFile(raw.collectionMedia) : null,
    products: raw.products.map((p) => ({
      ...p,
      images: p.images.map(base64ToFile),
    })),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePersistedDraft(init: () => WizardDraft) {
  const restored = useRef(false);

  const [draft, setDraft] = useState<WizardDraft>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = deserialize(JSON.parse(raw) as SerializedDraft);
        restored.current = true;
        return parsed;
      }
    } catch { /* ignore */ }
    return init();
  });

  const [step, setStep] = useState<1 | 2 | 3>(() => {
    try {
      const s = localStorage.getItem(STEP_KEY);
      if (s) return parseInt(s, 10) as 1 | 2 | 3;
    } catch { /* ignore */ }
    return 1;
  });

  // Toast de restauration — une seule fois au montage
  useEffect(() => {
    if (restored.current) {
      toast('Brouillon restauré', {
        description: 'Tu reprends là où tu t\'étais arrêté.',
        icon: '✏️',
        duration: 4000,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarde debounced (800ms) à chaque changement de draft
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSave = useRef(true);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const serialized = await serialize(draft);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(serialized));
        if (!isFirstSave.current) {
          toast.success('Brouillon sauvegardé', { duration: 1500, id: 'draft-save' });
        }
        isFirstSave.current = false;
      } catch {
        toast.warning('Sauvegarde automatique indisponible', {
          description: 'Les fichiers sont trop lourds pour être mis en cache.',
          duration: 5000,
          id: 'draft-quota',
        });
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [draft]);

  // Sauvegarde immédiate du step
  useEffect(() => {
    try { localStorage.setItem(STEP_KEY, String(step)); } catch { /* ignore */ }
  }, [step]);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch { /* ignore */ }
  }, []);

  return { draft, setDraft, step, setStep, clearPersisted };
}

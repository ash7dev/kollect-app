'use client';

import type { CollectionStatus } from '@/types/drops';

// ─── Content per status ──────────────────────────────────────────────────────

const CONTENT: Record<CollectionStatus, {
  label: string;
  accentWord: string;
  titleBefore: string;
  titleAfter: string;
  description: string;
  accentColor: string;
}> = {
  TEASER: {
    label: 'Drop en préparation',
    titleBefore: 'Ta communauté',
    accentWord: 'attend déjà.',
    titleAfter: '',
    description: 'Peaufine chaque détail — visuels, descriptions, prix. Un drop soigné génère plus d\'engagement dès les premières minutes du lancement.',
    accentColor: '#F59E0B',
  },
  DISPONIBLE: {
    label: 'Drop en ligne',
    titleBefore: 'Ton drop est',
    accentWord: 'vivant.',
    titleAfter: '',
    description: 'Ta collection est accessible à l\'achat en ce moment. Partage-la sur tes réseaux, notifie ta communauté — chaque minute compte.',
    accentColor: '#10B981',
  },
  EPUISEE: {
    label: 'Drop épuisé',
    titleBefore: 'Sold',
    accentWord: 'out.',
    titleAfter: '',
    description: 'Toute ta collection est partie — c\'est le meilleur signal possible. Utilise cet élan pour lancer le prochain drop encore plus fort.',
    accentColor: '#FF3B30',
  },
  TERMINE: {
    label: 'Drop archivé',
    titleBefore: 'Un chapitre',
    accentWord: 'fermé.',
    titleAfter: '',
    description: 'Ce drop appartient maintenant à l\'histoire de ta marque. Archive-le avec soin et laisse-le t\'inspirer pour la prochaine collection.',
    accentColor: 'rgba(0,0,0,0.35)',
  },
  BROUILLON: {
    label: 'Brouillon',
    titleBefore: 'Pas encore',
    accentWord: 'lancé.',
    titleAfter: '',
    description: 'Ce drop est en brouillon. Complète les informations manquantes avant de le publier à ta communauté.',
    accentColor: 'rgba(0,0,0,0.35)',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CollectionContextBlock({ status }: { status: CollectionStatus }) {
  const c = CONTENT[status] ?? CONTENT.BROUILLON;

  return (
    <div style={{
      margin: '0 0 28px',
      padding: '20px 24px',
      borderRadius: 16,
      background: 'rgba(255,255,255,0.65)',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: 11, fontWeight: 700,
        color: c.accentColor,
        letterSpacing: '2.5px', textTransform: 'uppercase',
      }}>
        {c.label}
      </p>

      <h2 style={{
        margin: '0 0 8px',
        fontSize: 20, fontWeight: 900,
        color: '#0A0A0A', letterSpacing: '-0.5px', lineHeight: 1.2,
      }}>
        {c.titleBefore}{' '}
        <span style={{ color: c.accentColor }}>{c.accentWord}</span>
        {c.titleAfter && ` ${c.titleAfter}`}
      </h2>

      <p style={{
        margin: 0,
        fontSize: 13, color: 'rgba(0,0,0,0.45)',
        lineHeight: 1.65, maxWidth: 540,
      }}>
        {c.description}
      </p>
    </div>
  );
}

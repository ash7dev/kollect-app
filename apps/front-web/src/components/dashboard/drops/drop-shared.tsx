/**
 * drop-shared.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Source unique de vérité pour les primitives UI partagées dans tous les
 * composants du module "drops" (liste + détail).
 *
 * Remplace :
 *   - 6 copies locales du composant Ic / svg wrapper
 *   - 3 variantes incohérentes du rouge primaire
 *   - 2 fonctions de formatage de prix identiques
 */

// ─── Police ──────────────────────────────────────────────────────────────────

export const FONT = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

// ─── Tokens de couleur ───────────────────────────────────────────────────────

export const DROP_COLORS = {
  /** Rouge primaire — boutons CTA, prix, éléments d'accentuation */
  red: '#E63329',
  /** Rouge teaser / launch button */
  redVibrant: '#FF3B30',
  /** Noir éditorial — fond hero, titres */
  black: '#0A0A0A',
  /** Texte secondaire */
  muted: '#9CA3AF',
  /** Vert live */
  green: '#10B981',
  /** Jaune teaser / urgence */
  amber: '#F59E0B',
  /** Fond page */
  bg: '#FAFAFA',
} as const;

// ─── Composant icône SVG ─────────────────────────────────────────────────────

interface DropIconProps {
  /** Path(s) SVG */
  d: string | readonly string[];
  size?: number;
  stroke?: string;
  sw?: number;
  fill?: string;
}

export function DropIcon({ d, size = 16, stroke = 'currentColor', sw = 1.5, fill = 'none' }: DropIconProps) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

// ─── Icônes partagées ────────────────────────────────────────────────────────

export const DROP_ICONS = {
  plus:      ['M12 5v14', 'M5 12h14'],
  drop:      ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  eye:       ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  rocket:    'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  clock:     ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  cube:      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  check:     'M20 6L9 17l-5-5',
  star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  video:     ['M23 7l-7 5 7 5V7z', 'M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z'],
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  arrowDiag: 'M7 17L17 7M7 7h10v10',
  edit:      ['M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'],
  trash:     ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
  externalLink: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14L21 3'],
  layers:    ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  calendar:  ['M3 9h18', 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z', 'M16 3v4', 'M8 3v4'],
  eyeOff:    ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94', 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19', 'M1 1l22 22'],
  alertTriangle: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
} as const;

// ─── Utilitaires de formatage ────────────────────────────────────────────────

/**
 * Formate un prix en FCFA avec séparateurs de milliers fr-FR.
 * Ex: 15000 → "15 000 FCFA"
 */
export function formatDropPrice(price: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' FCFA'
  );
}

/**
 * Formate une date ISO en date locale fr-FR courte.
 * Ex: "2026-04-08T00:00:00Z" → "8 avr. 2026"
 */
export function formatDropDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Status metadata ──────────────────────────────────────────────────────────

import type { CollectionStatus } from '@/types/drops';

export interface StatusMeta {
  label:  string;
  color:  string;
  bg:     string;
  dot:    string;
  border: string;
  pulse:  boolean;
}

const STATUS_TABLE: Record<CollectionStatus, StatusMeta> = {
  TEASER:     { label: 'Teaser',    color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B', border: '#FDE68A', pulse: false },
  DISPONIBLE: { label: 'Live',      color: '#065F46', bg: '#D1FAE5', dot: '#10B981', border: '#6EE7B7', pulse: true  },
  EPUISEE:    { label: 'Épuisée',   color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444', border: '#FECACA', pulse: false },
  TERMINE:    { label: 'Terminée',  color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF', border: '#E5E7EB', pulse: false },
  BROUILLON:  { label: 'Brouillon', color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF', border: '#E5E7EB', pulse: false },
};

export function getDropStatusMeta(status: CollectionStatus): StatusMeta {
  return STATUS_TABLE[status] ?? STATUS_TABLE.BROUILLON;
}

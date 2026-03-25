/**
 * Generates a deterministic accent color from a brand ID.
 * Uses a simple hash so each brand always gets the same color.
 */

const PALETTE = [
  '#E8552A', // terracotta
  '#C44569', // rose
  '#6C5CE7', // violet
  '#00B894', // emerald
  '#FDCB6E', // amber
  '#0984E3', // blue
  '#D63031', // red
  '#00CEC9', // teal
  '#A29BFE', // lavender
  '#FF7675', // coral
  '#74B9FF', // sky
  '#55EFC4', // mint
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function brandAccentCss(id: string): string {
  return PALETTE[hashId(id) % PALETTE.length];
}

export function brandAccentSoft(id: string, alpha: number): string {
  const hex = brandAccentCss(id);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

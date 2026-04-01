import { env } from '@/config/env';

/**
 * 🖼️ Résout une URL de média en URL absolue
 */
export function getMediaUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  
  // S'assurer que le domaine de l'API est présent
  const baseUrl = env.apiUrl || 'http://localhost:4000/api';
  // Enlever /api si on veut pointer vers le dossier d'uploads statiques (selon ta config backend)
  // Souvent c'est http://localhost:4000/uploads/...
  const domain = baseUrl.replace(/\/api$/, '');
  
  return `${domain}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * 🎯 Logique de fallback pour l'image représentative d'une marque
 * Ordre : Image de couverture (Banner) > Image de collection > Première image de produit
 */
export function resolveBrandImage({
  coverImage,
  collections = [],
  firstProductImage,
}: {
  coverImage?: string | null;
  collections?: { coverImage?: string | null }[];
  firstProductImage?: string | null;
}): string | null {
  // 1. Image de couverture spécifique à la marque
  const mainCover = getMediaUrl(coverImage);
  if (mainCover) return mainCover;

  // 2. Première image de collection disponible
  for (const col of collections) {
    const colCover = getMediaUrl(col.coverImage);
    if (colCover) return colCover;
  }

  // 3. Première image de produit disponible
  const productCover = getMediaUrl(firstProductImage);
  if (productCover) return productCover;

  return null;
}

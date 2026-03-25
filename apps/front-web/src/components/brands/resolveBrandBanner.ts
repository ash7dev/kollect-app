import type { BrandListItem } from '@/components/brands/types';
import { brandMediaUrl } from '@/components/brands/brand-media';

/**
 * Resolves the best available banner image for a brand.
 * Priority: coverImage → first collection coverImage → first collection product image → first product image
 */
export function resolveBrandBanner(brand: BrandListItem): string | null {
  console.log('🎯 [resolveBrandBanner] Processing brand:', brand.name);
  
  // 1. Explicit cover
  const cover = brandMediaUrl(brand.coverImage);
  console.log('📸 [resolveBrandBanner] Step 1 - Cover image:', cover);
  if (cover) return cover;

  // 2. First collection cover
  const collections = brand.collections ?? [];
  console.log('📚 [resolveBrandBanner] Step 2 - Collections count:', collections.length);
  for (const col of collections) {
    const colCover = brandMediaUrl(col.coverImage);
    console.log('🖼️ [resolveBrandBanner] Collection cover:', colCover);
    if (colCover) return colCover;
    const colProduct = col.products?.[0]?.images?.[0];
    console.log('🛍️ [resolveBrandBanner] Collection product image:', colProduct);
    if (colProduct) {
      const url = brandMediaUrl(colProduct);
      if (url) return url;
    }
  }

  // 3. First product image
  const product = brand.products?.[0]?.images?.[0];
  console.log('📦 [resolveBrandBanner] Step 3 - First product image:', product);
  if (product) {
    const url = brandMediaUrl(product);
    if (url) return url;
  }

  console.log('❌ [resolveBrandBanner] No banner found for brand:', brand.name);
  return null;
}

import type { BrandListItem } from '@/components/brands/types';
import { BrandCard } from '@/components/brands/BrandCard';
import { FONT_FAMILY_INTER } from '@/styles/typography';

export function BrandsGrid({ brands }: { brands: BrandListItem[] }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18,
        fontFamily: FONT_FAMILY_INTER,
      }}
    >
      {brands.map((b, i) => (
        <li key={b.id}>
          <BrandCard brand={b} priorityImage={i < 6} />
        </li>
      ))}
    </ul>
  );
}

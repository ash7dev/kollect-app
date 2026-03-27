import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import type { PublicCollection, Paginated } from '@/types/drops';

export async function fetchCollections(): Promise<PublicCollection[]> {
  try {
    const result = await fetchAPI<Paginated<PublicCollection>>(
      API_ENDPOINTS.COLLECTIONS.PUBLIC_LIST({ limit: 50 }),
      { revalidate: 300, tags: ['collections'] },
    );
    return result.data ?? [];
  } catch {
    return [];
  }
}

import { env } from '@/config/env';
import { PublicProduct } from '@/types/product';

export type FetchApiOptions = {
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export function getSiteUrl() {
  return env.siteUrl;
}

export function buildApiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiUrl}${normalized}`;
}

export async function fetchAPI<T>(
  path: string,
  options: FetchApiOptions = {},
): Promise<T> {
  const url = buildApiUrl(path);
  const revalidate = options.revalidate ?? 300;
  const shouldBypassCache = options.cache === 'no-store';

  const res = await fetch(url, {
    cache: options.cache,
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    ...(shouldBypassCache
      ? { next: options.next }
      : {
          next: {
            revalidate,
            tags: options.tags,
            ...options.next,
          },
        }),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${url}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON but got ${contentType} from ${url}`);
  }

  return (await res.json()) as T;
}

// Fonction pour récupérer les produits depuis la base de données
export async function fetchProducts(limit: number = 10): Promise<PublicProduct[]> {
  try {
    const res = await fetchAPI<{ data: PublicProduct[] }>(
      `/produits/public/random?limit=${limit}&page=1`,
      { revalidate: 60 },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
}

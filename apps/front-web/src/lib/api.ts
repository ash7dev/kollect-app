import { env } from '@/config/env';

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

  const res = await fetch(url, {
    cache: options.cache,
    next: {
      revalidate,
      tags: options.tags,
      ...options.next,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${url}`);
  }

  return (await res.json()) as T;
}

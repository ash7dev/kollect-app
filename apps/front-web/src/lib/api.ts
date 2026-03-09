import type { NextFetchRequestConfig } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://kollect.sn/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kollect.sn';

export type FetchApiOptions = {
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export function getSiteUrl() {
  return SITE_URL;
}

export function buildApiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
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

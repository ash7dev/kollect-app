// src/config/env.ts
// Configuration centralisée des variables d'environnement

const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kollect.sn';

const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? `${apiBaseUrl}/api`;

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kollect.sn';

export const env = {
    apiBaseUrl,
    apiUrl,
    siteUrl,
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
} as const;

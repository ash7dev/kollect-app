// src/providers/AppProviders.tsx
// Assemblage de tous les providers — un seul point d'entrée
'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
    );
}

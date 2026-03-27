// src/providers/AppProviders.tsx
// Assemblage de tous les providers — un seul point d'entrée
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { useBrandCartStore } from '@/stores/brandCartStore';

export function AppProviders({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Avec `skipHydration: true` dans `brandCartStore`, le store reste initial
        // au moment du premier rendu. On rehydrate ensuite ici pour éviter les
        // mismatch SSR/CSR (ex: badge <span> du panier).
        void (useBrandCartStore as any).persist?.rehydrate?.();
    }, []);

    return (
        <QueryProvider>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                borderRadius: '14px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: '1px solid rgba(0,0,0,0.07)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
                            },
                        }}
                    />
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}

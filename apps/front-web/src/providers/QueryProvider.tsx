// src/providers/QueryProvider.tsx
// Provider React Query adapté web
'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Cache
                staleTime: 5 * 60 * 1000, // 5 min
                gcTime: 10 * 60 * 1000, // 10 min

                // Retry intelligent — pas de retry sur les erreurs client
                retry: (failureCount, error: unknown) => {
                    const axiosError = error as { response?: { status?: number } };
                    if (
                        axiosError.response?.status &&
                        axiosError.response.status >= 400 &&
                        axiosError.response.status < 500
                    ) {
                        return false;
                    }
                    return failureCount < 3;
                },
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 30_000),

                // Refetch
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                refetchOnMount: true,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export function QueryProvider({ children }: { children: ReactNode }) {
    // Créer un QueryClient par session navigateur (pas de partage entre requêtes serveur)
    const [queryClient] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

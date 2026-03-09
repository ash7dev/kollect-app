// src/providers/ThemeProvider.tsx
// Provider React Context pour dark/light mode
'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

// ============================================
// TYPES
// ============================================

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'kollect-theme';

// ============================================
// PROVIDER
// ============================================

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('light');
    const [mounted, setMounted] = useState(false);

    // Initialiser le thème au montage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;

        if (stored === 'light' || stored === 'dark') {
            setThemeState(stored);
        } else {
            // Détecter la préférence système
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            setThemeState(prefersDark ? 'dark' : 'light');
        }

        setMounted(true);
    }, []);

    // Appliquer le thème sur <html>
    useEffect(() => {
        if (!mounted) return;

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme, mounted]);

    const setTheme = useCallback((mode: ThemeMode) => {
        setThemeState(mode);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const value: ThemeContextValue = {
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}

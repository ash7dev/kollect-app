import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme, colors as baseColors, type Theme } from '@/src/theme';

type ThemeMode = 'light' | 'dark' | 'auto';

// Type pour les couleurs adaptatives (override des couleurs statiques)
type AdaptiveColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  divider: string;
};

// Type du thème avec couleurs adaptatives
type AdaptiveTheme = Omit<Theme, 'colors'> & {
  colors: Omit<typeof baseColors, keyof AdaptiveColors> & AdaptiveColors;
};

interface ThemeContextType {
  theme: AdaptiveTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getAdaptiveColors(isDark: boolean): AdaptiveColors {
  if (isDark) {
    return {
      background: baseColors.backgroundDark,
      surface: baseColors.surfaceDark,
      card: baseColors.cardDark,
      text: baseColors.textDark,
      textSecondary: baseColors.textSecondaryDark,
      textDisabled: baseColors.textDisabledDark,
      border: baseColors.borderDark,
      divider: baseColors.dividerDark,
    };
  }
  
  return {
    background: baseColors.background,
    surface: baseColors.surface,
    card: baseColors.card,
    text: baseColors.text,
    textSecondary: baseColors.textSecondary,
    textDisabled: baseColors.textDisabled,
    border: baseColors.border,
    divider: baseColors.divider,
  };
}

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@kollect_theme_mode';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  useEffect(() => {
    loadThemePreference();
  }, []);

  async function loadThemePreference() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  }

  async function saveThemePreference(mode: ThemeMode) {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    saveThemePreference(mode);
  }

  function toggleTheme() {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }

  const adaptiveColors = getAdaptiveColors(isDark);

  const contextValue: ThemeContextType = {
    theme: {
      ...baseTheme,
      colors: {
        // Copie toutes les couleurs statiques
        primary: baseColors.primary,
        primaryLight: baseColors.primaryLight,
        primaryDark: baseColors.primaryDark,
        accent: baseColors.accent,
        accentLight: baseColors.accentLight,
        accentDark: baseColors.accentDark,
        success: baseColors.success,
        error: baseColors.error,
        warning: baseColors.warning,
        info: baseColors.info,
        teaser: baseColors.teaser,
        live: baseColors.live,
        soldOut: baseColors.soldOut,
        new: baseColors.new,
        exclusive: baseColors.exclusive,
        limitedEdition: baseColors.limitedEdition,
        transparent: baseColors.transparent,
        overlay: baseColors.overlay,
        overlayLight: baseColors.overlayLight,
        gradientPrimary: baseColors.gradientPrimary,
        gradientAccent: baseColors.gradientAccent,
        gradientDark: baseColors.gradientDark,
        backgroundDark: baseColors.backgroundDark,
        surfaceDark: baseColors.surfaceDark,
        cardDark: baseColors.cardDark,
        textDark: baseColors.textDark,
        textSecondaryDark: baseColors.textSecondaryDark,
        textDisabledDark: baseColors.textDisabledDark,
        borderDark: baseColors.borderDark,
        dividerDark: baseColors.dividerDark,
        // Override avec les couleurs adaptatives
        ...adaptiveColors,
      },
    },
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
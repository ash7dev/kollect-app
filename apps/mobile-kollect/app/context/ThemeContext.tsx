import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as baseTheme, colors as baseColors, type Theme } from '../../src/theme';

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
  borderLight: string;
  borderDarkSubtle: string;
  overlay: string;
  overlayLight: string;
  overlayDark: string;
  shadowLight: string;
  shadowDark: string;
  highlight: string;
  highlightDark: string;
};

// Type du thème avec couleurs adaptatives - simplifié pour inclure toutes les couleurs
type AdaptiveTheme = Omit<Theme, 'colors'> & {
  colors: typeof baseColors;
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
      borderLight: baseColors.borderDarkSubtle,
      borderDarkSubtle: baseColors.borderDarkSubtle,
      overlay: baseColors.overlayDark,
      overlayLight: baseColors.overlayDark,
      overlayDark: baseColors.overlayDark,
      shadowLight: baseColors.shadowDark,
      shadowDark: baseColors.shadowDark,
      highlight: baseColors.highlightDark,
      highlightDark: baseColors.highlightDark,
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
    borderLight: baseColors.borderLight,
    borderDarkSubtle: baseColors.borderLight,
    overlay: baseColors.overlay,
    overlayLight: baseColors.overlayLight,
    overlayDark: baseColors.overlay,
    shadowLight: baseColors.shadowLight,
    shadowDark: baseColors.shadowDark,
    highlight: baseColors.highlight,
    highlightDark: baseColors.highlight,
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
        // On garde TOUTES les couleurs de base pour satisfaire le type
        ...baseColors,
        // Et on override avec les couleurs adaptatives
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
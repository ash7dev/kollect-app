import { useTheme } from '@/app/context/ThemeContext';

type ThemeColorProps = {
  light?: string;
  dark?: string;
};

/**
 * Hook pour obtenir une couleur de thème adaptative
 * Utilise les couleurs light/dark personnalisées ou les couleurs par défaut du thème
 */
export function useThemeColor(
  props: ThemeColorProps,
  colorName: keyof {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
  }
): string {
  const { theme, isDark } = useTheme();

  if (props.light && props.dark) {
    return isDark ? props.dark : props.light;
  }

  // Mapping des noms de couleurs vers les propriétés du thème
  const colorMap: Record<string, string> = {
    text: theme.colors.text,
    background: theme.colors.background,
    tint: theme.colors.primary,
    icon: theme.colors.textSecondary,
    tabIconDefault: theme.colors.textSecondary,
    tabIconSelected: theme.colors.primary,
  };

  return colorMap[colorName] || theme.colors.text;
}


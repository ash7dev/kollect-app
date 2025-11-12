import 'react-native';

declare module 'react-native' {
  interface ThemeColors {
    text: string;
    background: string;
    borderLight: string;
    primary: string;
    card: string;
    overlay: string;
    error: string;
    surface: string;
    textSecondary: string;
    accent: string;
    borderDarkSubtle: string;
    shadowDark: string;
    shadowLight: string;
  }

  interface Theme {
    colors: ThemeColors;
    dark: boolean;
  }
}

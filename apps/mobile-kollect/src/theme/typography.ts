// Système de typographie Kollect - Style éditorial moderne
export const typography = {
  // Display - Pour les hero sections
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1,
    lineHeight: 48,
  },
  
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  
  // Subtitles
  subtitle1: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 26,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  
  // Body text
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body2: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  body3: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  
  // Captions
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  captionSmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  
  // Prix - Typographie spéciale pour les prix
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  priceSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
} as const;

// Font weights disponibles
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
} as const;

export type Typography = typeof typography;
export type FontWeights = typeof fontWeights;
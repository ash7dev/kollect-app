// Palette de couleurs Kollect - Identité streetwear premium
export const colors = {
  // Couleurs principales - Noir & Blanc premium
  primary: '#000000',
  primaryLight: '#1A1A1A',
  primaryDark: '#000000',
  
  // Accent - Rouge streetwear (pour drops, nouveautés)
  accent: '#FF3B30',
  accentLight: '#FF6B6B',
  accentDark: '#CC0000',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#000000',
  surface: '#FFFFFF',
  surfaceDark: '#1A1A1A',
  card: '#F8F8F8',
  cardDark: '#242424',
  
  // Textes
  text: '#000000',
  textDark: '#FFFFFF',
  textSecondary: '#666666',
  textSecondaryDark: '#B0B0B0',
  textDisabled: '#CCCCCC',
  textDisabledDark: '#666666',
  
  // États
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Bordures et séparateurs
  border: '#E5E5E5',
  borderDark: '#333333',
  divider: '#F0F0F0',
  dividerDark: '#404040',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Statuts de collection
  teaser: '#FF9500',
  live: '#34C759',
  soldOut: '#FF3B30',
  
  // Badges
  new: '#FF3B30',
  exclusive: '#000000',
  limitedEdition: '#FFD700',
  
  // Transparences
  transparent: 'transparent',
  
  // Gradients
  gradientPrimary: ['#000000', '#1A1A1A'],
  gradientAccent: ['#FF3B30', '#FF6B6B'],
  gradientDark: ['#1A1A1A', '#000000'],
} as const;

export type Colors = typeof colors;
// Design System Kollect — Tokens
// Transposé 1:1 depuis mobile-kollect/src/theme/*
// Identité streetwear premium "BOOM" — Contraste maximal, impact visuel immédiat

// ============================================
// COLORS
// ============================================

export const colors = {
  // Couleurs principales — Noir & Blanc PUR
  primary: '#000000',
  primaryLight: '#1A1A1A',
  primaryDark: '#000000',

  // Accent — Rouge streetwear (SEULEMENT pour actions critiques)
  accent: '#FF3B30',
  accentLight: '#FF6B6B',
  accentDark: '#CC0000',

  // Backgrounds — MODE LIGHT
  background: '#FFFFFF',
  surface: '#F8F8F8',
  card: '#FFFFFF',

  // Backgrounds — MODE DARK
  backgroundDark: '#000000',
  surfaceDark: '#1A1A1A',
  cardDark: '#0A0A0A',

  // Textes — MODE LIGHT
  text: '#000000',
  textSecondary: '#4D4D4D',
  textDisabled: '#B8B8B8',

  // Textes — MODE DARK
  textDark: '#FFFFFF',
  textSecondaryDark: '#B0B0B0',
  textDisabledDark: '#666666',

  // États
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Bordures — MODE LIGHT
  border: '#000000',
  borderLight: '#E5E5E5',
  divider: '#E5E5E5',

  // Bordures — MODE DARK
  borderDark: '#FFFFFF',
  borderDarkSubtle: '#333333',
  dividerDark: '#2A2A2A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',

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

  // Ombres
  shadowLight: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // Highlights pour interactions
  highlight: 'rgba(255, 59, 48, 0.1)',
  highlightDark: 'rgba(255, 59, 48, 0.2)',
} as const;

// Gradients (arrays ne passent pas en CSS vars — usage JS uniquement)
export const gradients = {
  primary: ['#000000', '#1A1A1A'],
  accent: ['#FF3B30', '#FF6B6B'],
  dark: ['#1A1A1A', '#000000'],
} as const;

// ============================================
// TYPOGRAPHY (converti px → rem, base 16px)
// ============================================

export const typography = {
  display:      { fontSize: '2.5rem',   fontWeight: 800, letterSpacing: '-0.0625rem', lineHeight: 1.2 },
  h1:           { fontSize: '2rem',     fontWeight: 700, letterSpacing: '-0.03125rem', lineHeight: 1.25 },
  h2:           { fontSize: '1.75rem',  fontWeight: 700, letterSpacing: '-0.01875rem', lineHeight: 1.286 },
  h3:           { fontSize: '1.5rem',   fontWeight: 600, letterSpacing: '-0.0125rem', lineHeight: 1.333 },
  h4:           { fontSize: '1.25rem',  fontWeight: 600, letterSpacing: '0',          lineHeight: 1.4 },
  subtitle1:    { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '0',          lineHeight: 1.444 },
  subtitle2:    { fontSize: '1rem',     fontWeight: 600, letterSpacing: '0.0125rem',  lineHeight: 1.5 },
  body1:        { fontSize: '1rem',     fontWeight: 400, letterSpacing: '0',          lineHeight: 1.5 },
  body2:        { fontSize: '0.9375rem',fontWeight: 400, letterSpacing: '0',          lineHeight: 1.467 },
  body3:        { fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0',          lineHeight: 1.429 },
  caption:      { fontSize: '0.8125rem',fontWeight: 500, letterSpacing: '0.01875rem', lineHeight: 1.385 },
  captionSmall: { fontSize: '0.75rem',  fontWeight: 400, letterSpacing: '0.01875rem', lineHeight: 1.333 },
  button:       { fontSize: '1rem',     fontWeight: 600, letterSpacing: '0.03125rem', textTransform: 'uppercase' as const },
  buttonSmall:  { fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.025rem',   textTransform: 'uppercase' as const },
  label:        { fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.03125rem', textTransform: 'uppercase' as const },
  labelSmall:   { fontSize: '0.75rem',  fontWeight: 600, letterSpacing: '0.03125rem', textTransform: 'uppercase' as const },
  price:        { fontSize: '1.5rem',   fontWeight: 700, letterSpacing: '-0.03125rem', lineHeight: 1.333 },
  priceSmall:   { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '0',          lineHeight: 1.333 },
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// ============================================
// SPACING (base 4px, converti en rem)
// ============================================

export const spacing = {
  xxs:  '0.125rem',  // 2px
  xs:   '0.25rem',   // 4px
  sm:   '0.5rem',    // 8px
  md:   '1rem',      // 16px
  lg:   '1.5rem',    // 24px
  xl:   '2rem',      // 32px
  xxl:  '3rem',      // 48px
  xxxl: '4rem',      // 64px
  huge: '6rem',      // 96px
} as const;

export const layout = {
  screenPadding: spacing.md,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.md,
  sectionSpacing: spacing.xl,
  itemSpacing: spacing.md,
  cardPadding: spacing.md,
  containerPadding: spacing.lg,
  headerHeight: '3.5rem',  // 56px
} as const;

// ============================================
// RADIUS
// ============================================

export const radius = {
  none: '0',
  xs:   '0.25rem',   // 4px
  sm:   '0.5rem',    // 8px
  md:   '0.75rem',   // 12px
  lg:   '1rem',      // 16px
  xl:   '1.25rem',   // 20px
  xxl:  '1.5rem',    // 24px
  xxxl: '2rem',      // 32px
  full: '9999px',
} as const;

// ============================================
// SHADOWS (CSS box-shadow)
// ============================================

export const shadows = {
  none:   'none',
  xs:     '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm:     '0 2px 4px rgba(0, 0, 0, 0.08)',
  md:     '0 4px 8px rgba(0, 0, 0, 0.12)',
  lg:     '0 8px 16px rgba(0, 0, 0, 0.16)',
  xl:     '0 12px 24px rgba(0, 0, 0, 0.20)',
  accent: '0 4px 12px rgba(255, 59, 48, 0.30)',
  card:   '0 2px 8px rgba(0, 0, 0, 0.10)',
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const animations = {
  duration: {
    instant: '100ms',
    fast:    '200ms',
    normal:  '300ms',
    slow:    '500ms',
    verySlow:'800ms',
  },
  easing: {
    linear:    'linear',
    ease:      'ease',
    easeIn:    'ease-in',
    easeOut:   'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================
// THEME OBJECT (miroir du mobile)
// ============================================

export const theme = {
  colors,
  gradients,
  typography,
  fontWeights,
  spacing,
  layout,
  radius,
  shadows,
  animations,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Animations = typeof animations;

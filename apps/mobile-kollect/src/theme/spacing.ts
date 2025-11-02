// Système d'espacement cohérent (base 4px)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
} as const;

// Marges et paddings prédéfinis
export const layout = {
  // Padding des écrans
  screenPadding: spacing.md,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.md,
  
  // Espacement entre éléments
  sectionSpacing: spacing.xl,
  itemSpacing: spacing.md,
  
  // Cards et containers
  cardPadding: spacing.md,
  containerPadding: spacing.lg,
  
  // Navigation
  tabBarHeight: 60,
  headerHeight: 56,
  
  // Produits
  productCardSpacing: spacing.sm,
  productGridGap: spacing.md,
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
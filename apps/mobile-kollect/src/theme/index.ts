import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';

export { colors };
export type { Colors } from './colors';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
  radius,
  shadows,
  animations,
} as const;

export type Theme = typeof theme;


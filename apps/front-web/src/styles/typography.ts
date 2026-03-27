// Police Inter avec fallback robuste pour tous les composants
export const FONT_FAMILY_INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Hook pour appliquer la police facilement
export const useInterFont = () => ({
  fontFamily: FONT_FAMILY_INTER,
});

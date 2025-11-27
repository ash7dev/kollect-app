// Palette de couleurs Kollect - Identité streetwear premium "BOOM"
// Contraste maximal, impact visuel immédiat, style affirmé
export const colors = {
  // Couleurs principales - Noir & Blanc PUR (contraste maximal)
  primary: '#000000',
  primaryLight: '#1A1A1A',
  primaryDark: '#000000',
  
  // Accent - Rouge streetwear (SEULEMENT pour actions critiques)
  accent: '#FF3B30',
  accentLight: '#FF6B6B',
  accentDark: '#CC0000',
  
  // Backgrounds - MODE LIGHT (Blanc pur)
  background: '#FFFFFF',        // ✨ Blanc pur au lieu de gris
  surface: '#F8F8F8',           // ✨ Blanc cassé pour différenciation subtile
  card: '#FFFFFF',              // ✨ Blanc pur avec ombres fortes
  
  // Backgrounds - MODE DARK (Noir profond)
  backgroundDark: '#000000',    // ✨ Noir pur
  surfaceDark: '#1A1A1A',       // Gris très foncé
  cardDark: '#0A0A0A',              // ✨ Noir profond pour cards avec élévation
  
  // Textes - MODE LIGHT
  text: '#000000',              // ✨ Noir pur (pas de gris)
  textSecondary: '#4D4D4D',     // ✨ Gris foncé au lieu de #666 (plus de contraste)
  textDisabled: '#B8B8B8',      // ✨ Gris moyen au lieu de #CCC
  
  // Textes - MODE DARK
  textDark: '#FFFFFF',          // ✨ Blanc pur
  textSecondaryDark: '#B0B0B0', // Gris clair
  textDisabledDark: '#666666',
  
  // États (gardés identiques - déjà bons)
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Bordures et séparateurs - MODE LIGHT
  border: '#000000',            // ✨ BOOM: Bordures noires fines (1px)
  borderLight: '#E5E5E5',       // ✨ Alternative pour bordures subtiles
  divider: '#E5E5E5',           // ✨ Diviseurs gris clair
  
  // Bordures et séparateurs - MODE DARK
  borderDark: '#FFFFFF',        // ✨ BOOM: Bordures blanches fines
  borderDarkSubtle: '#333333',  // ✨ Alternative pour bordures subtiles
  dividerDark: '#2A2A2A',       // ✨ Diviseurs gris foncé
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.75)',      // ✨ Plus opaque pour plus d'impact
  overlayLight: 'rgba(0, 0, 0, 0.5)',  // ✨ Augmenté de 0.3 à 0.5
  overlayDark: 'rgba(0, 0, 0, 0.85)',  // ✨ Nouveau: pour mode dark
  
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
  
  // ✨ NOUVEAUX: Effets "BOOM"
  // Ombres pour élévation premium
  shadowLight: 'rgba(0, 0, 0, 0.15)',   // Ombre en mode light
  shadowDark: 'rgba(0, 0, 0, 0.5)',     // Ombre en mode dark (plus forte)
  
  // Highlights pour interactions
  highlight: 'rgba(255, 59, 48, 0.1)',  // Rouge transparent pour hover
  highlightDark: 'rgba(255, 59, 48, 0.2)', // Plus visible en dark
} as const;

export type Colors = typeof colors;

// ✨ GUIDE D'UTILISATION "BOOM"
/*
RÈGLES POUR L'EFFET "WOW":

1. CARDS & SURFACES
   - Light: Fond blanc pur (#FFFFFF) + ombre forte (shadowOffset: {0, 6}, opacity: 0.15)
   - Dark: Fond noir profond (#0A0A0A) + ombre très forte (shadowOffset: {0, 8}, opacity: 0.5)
   
2. BORDURES
   - Light: Noires fines (1px, #000000) pour éléments actifs / Gris (#E5E5E5) pour subtil
   - Dark: Blanches fines (1px, #FFFFFF) pour éléments actifs / Gris (#333) pour subtil
   
3. ACCENT ROUGE
   Utiliser SEULEMENT sur:
   - Boutons d'action primaires (CTA)
   - Badges de notification
   - Statuts critiques (nouveau, soldout)
   - États hover/active des boutons
   
4. TYPOGRAPHIE
   - Titres: fontWeight '700' (Bold)
   - Corps: fontWeight '400' ou '500' (Regular/Medium)
   - Pas de demi-mesure
   
5. ESPACEMENT
   - Padding généreux: 16-24px
   - Gap entre éléments: 12-16px
   - Respiration = Premium

EXEMPLE DE CARD "BOOM":
{
  backgroundColor: isDark ? colors.cardDark : colors.card,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: isDark ? colors.borderDarkSubtle : colors.borderLight,
  shadowColor: isDark ? colors.shadowDark : colors.shadowLight,
  shadowOffset: { width: 0, height: isDark ? 8 : 6 },
  shadowOpacity: 1,
  shadowRadius: 12,
  elevation: isDark ? 8 : 4,
}
*/
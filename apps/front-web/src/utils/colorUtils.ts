/**
 * Utilitaire pour convertir les codes couleurs en noms français lisibles
 */

export function formatColorName(colorCode: string): string {
  // Mapping des codes couleurs vers des noms français
  const colorMap: Record<string, string> = {
    // Codes hexadécimaux courants
    '#000000': 'Noir',
    '#FFFFFF': 'Blanc',
    '#FF0000': 'Rouge',
    '#00FF00': 'Vert',
    '#0000FF': 'Bleu',
    '#FFFF00': 'Jaune',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange',
    '#800080': 'Violet',
    '#FFC0CB': 'Rose',
    '#A52A2A': 'Marron',
    '#808080': 'Gris',
    '#C0C0C0': 'Argent',
    '#FFD700': 'Or',
    
    // Noms de couleurs en anglais
    'black': 'Noir',
    'white': 'Blanc',
    'red': 'Rouge',
    'green': 'Vert',
    'blue': 'Bleu',
    'yellow': 'Jaune',
    'orange': 'Orange',
    'purple': 'Violet',
    'pink': 'Rose',
    'brown': 'Marron',
    'gray': 'Gris',
    'grey': 'Gris',
    'silver': 'Argent',
    'gold': 'Or',
    
    // Variations spécifiques au projet
    '#8b4513': 'Brun',
    '#000080': 'Bleu marine',
    '#008080': 'Turquoise',
    '#800000': 'Bordeaux',
    '#808000': 'Olive',
    '#ffa500': 'Orange',
    '#ffc0cb': 'Rose pâle',
  };

  // Si le code existe dans le mapping, retourner le nom français
  if (colorMap[colorCode.toLowerCase()]) {
    return colorMap[colorCode.toLowerCase()];
  }

  // Si c'est un code hexadécimal, essayer de convertir en nom de couleur
  if (colorCode.startsWith('#')) {
    // Mapping étendu pour les codes hexadécimaux courants
    const hexColorMap: Record<string, string> = {
      '#FF0000': 'Rouge',
      '#00FF00': 'Vert', 
      '#0000FF': 'Bleu',
      '#FFFF00': 'Jaune',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#FFA500': 'Orange',
      '#800080': 'Violet',
      '#FFC0CB': 'Rose',
      '#A52A2A': 'Marron',
      '#808080': 'Gris',
      '#000000': 'Noir',
      '#FFFFFF': 'Blanc',
      '#C0C0C0': 'Argent',
      '#FFD700': 'Or',
      '#8B4513': 'Brun',
      '#000080': 'Bleu marine',
      '#008080': 'Turquoise',
      '#800000': 'Bordeaux',
      '#808000': 'Olive',
      '#FFA07A': 'Saumon',
      '#20B2AA': 'Turquoise clair',
      '#FF6347': 'Tomate',
      '#4169E1': 'Bleu roi',
      '#32CD32': 'Vert lime',
      '#F0E68C': 'Kaki',
      '#ADD8E6': 'Bleu clair',
      '#F08080': 'Corail',
      '#E0FFFF': 'Cyan clair',
      '#FAFAD2': 'Blé',
      '#D3D3D3': 'Gris clair',
      '#90EE90': 'Vert clair',
      '#FFB6C1': 'Rose clair',
      '#87CEEB': 'Ciel',
      '#778899': 'Gris ardoise',
      '#B0C4DE': 'Bleu acier',
      '#FFFFE0': 'Jaune clair',
      '#00FF7F': 'Vert printemps',
      '#4682B4': 'Bleu acier',
      '#D2691E': 'Chocolat',
      '#FF7F50': 'Corail',
      '#6495ED': 'Bleu pervenche',
      '#FFF8DC': 'Lin',
      '#DC143C': 'Rouge cramoisi',
      '#00008B': 'Bleu marine foncé',
      '#008B8B': 'Turquoise foncé',
      '#B8860B': 'Or foncé',
      '#A9A9A9': 'Gris foncé',
      '#006400': 'Vert foncé',
      '#BDB76B': 'Kaki foncé',
      '#8B008B': 'Magenta foncé',
      '#556B2F': 'Vert olive',
      '#FF8C00': 'Orange foncé',
      '#9932CC': 'Violet foncé',
      '#8B0000': 'Rouge foncé',
      '#E9967A': 'Saumon foncé',
      '#8FBC8F': 'Vert mer',
      '#483D8B': 'Bleu minuit',
      '#2F4F4F': 'Gris ardoise foncé',
      '#00CED1': 'Turquoise moyen',
      '#9400D3': 'Violet',
      '#FF1493': 'Rose profond',
      '#00BFFF': 'Bleu azur',
      '#696969': 'Gris moyen',
      '#1E90FF': 'Bleu dodger',
      '#B22222': 'Rouge brique',
      '#FFFAF0': 'Blanc alice',
      '#228B22': 'Vert forêt',
      '#DCDCDC': 'Gainsboro',
      '#FFDAB9': 'Pêche',
      '#A0522D': 'Sienna',
      '#FFE4B5': 'Mousse',
      '#F5DEB3': 'Blé',
      '#F5F5F5': 'Blanc fumée',
      '#FFE4C4': 'Bisque',
      '#FFEBCD': 'Blanc ancien',
      '#0000CD': 'Bleu moyen',
      '#4B0082': 'Indigo',
      '#9ACD32': 'Vert jaune',
      '#E6E6FA': 'Lavande',
      '#FFFACD': 'Citron vert',
      '#87CEFA': 'Bleu azur clair',
      '#FAF0E6': 'Lin',
    };
    
    const upperHex = colorCode.toUpperCase();
    if (hexColorMap[upperHex]) {
      return hexColorMap[upperHex];
    }
    
    // Si pas trouvé, essayer de deviner la couleur dominante
    const hex = colorCode.slice(1);
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Deviner la couleur dominante
      if (r > 200 && g < 100 && b < 100) return 'Rouge';
      if (r < 100 && g > 200 && b < 100) return 'Vert';
      if (r < 100 && g < 100 && b > 200) return 'Bleu';
      if (r > 200 && g > 200 && b < 100) return 'Jaune';
      if (r > 200 && g < 100 && b > 200) return 'Magenta';
      if (r < 100 && g > 200 && b > 200) return 'Cyan';
      if (r > 200 && g > 200 && b > 200) return 'Blanc';
      if (r < 50 && g < 50 && b < 50) return 'Noir';
      if (r > 100 && g < 100 && b < 100) return 'Rouge foncé';
      if (r < 100 && g > 100 && b < 100) return 'Vert foncé';
      if (r < 100 && g < 100 && b > 100) return 'Bleu foncé';
      if (r > 150 && g > 150 && b > 150) return 'Gris clair';
      if (r < 150 && g < 150 && b < 150) return 'Gris foncé';
    }
    
    // En dernier recours, retourner le code hexadécimal
    return upperHex;
  }

  // Sinon, retourner le code original formaté (CamelCase ou majuscule)
  return colorCode.replace(/(^|[^a-zA-Z])([a-zA-Z])/g, (match, separator, letter) => 
    separator + letter.toUpperCase()
  ).trim();
}

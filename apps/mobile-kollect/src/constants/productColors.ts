export interface ProductColorOption {
  name: string;
  value: string;
}

// Palette de couleurs standardisée pour les produits.
// ⚠️ Utiliser toujours ces valeurs côté CEO et côté client
// afin que les couleurs restent parfaitement synchronisées.
export const PRODUCT_COLORS: ProductColorOption[] = [
  // Nuances de noir / blanc / gris
  { name: 'Noir', value: '#000000' },
  { name: 'Noir charbon', value: '#1c1c1c' },
  { name: 'Gris très foncé', value: '#2f2f2f' },
  { name: 'Gris', value: '#808080' },
  { name: 'Gris clair', value: '#c0c0c0' },
  { name: 'Gris perle', value: '#d9d9d9' },
  { name: 'Blanc cassé', value: '#f5f5f5' },
  { name: 'Blanc', value: '#ffffff' },

  // Rouges / roses
  { name: 'Rouge', value: '#ff0000' },
  { name: 'Rouge foncé', value: '#8b0000' },
  { name: 'Bordeaux', value: '#800020' },
  { name: 'Rouge corail', value: '#ff4040' },
  { name: 'Rose', value: '#ff69b4' },
  { name: 'Vieux rose', value: '#c08081' },

  // Oranges / jaunes
  { name: 'Orange', value: '#ff8c00' },
  { name: 'Orange brûlé', value: '#cc5500' },
  { name: 'Saumon', value: '#fa8072' },
  { name: 'Jaune', value: '#ffff00' },
  { name: 'Jaune moutarde', value: '#ffdb58' },
  { name: 'Jaune pâle', value: '#fffacd' },

  // Verts
  { name: 'Vert', value: '#008000' },
  { name: 'Vert foncé', value: '#006400' },
  { name: 'Vert clair', value: '#90ee90' },
  { name: 'Vert menthe', value: '#98ff98' },
  { name: 'Kaki', value: '#78866b' },
  { name: 'Olive', value: '#808000' },

  // Bleus
  { name: 'Bleu', value: '#0000ff' },
  { name: 'Bleu ciel', value: '#87ceeb' },
  { name: 'Bleu clair', value: '#add8e6' },
  { name: 'Bleu marine', value: '#000080' },
  { name: 'Bleu pétrole', value: '#004f59' },
  { name: 'Turquoise', value: '#40e0d0' },

  // Violets
  { name: 'Violet', value: '#800080' },
  { name: 'Lavande', value: '#e6e6fa' },
  { name: 'Prune', value: '#6a0dad' },

  // Marrons / beiges
  { name: 'Marron', value: '#8b4513' },
  { name: 'Chocolat', value: '#5c3317' },
  { name: 'Beige', value: '#f5f5dc' },
  { name: 'Sable', value: '#f4a460' },

  // Métallisés
  { name: 'Doré', value: '#d4af37' },
  { name: 'Or rose', value: '#b76e79' },
  { name: 'Argent', value: '#c0c0c0' },
];


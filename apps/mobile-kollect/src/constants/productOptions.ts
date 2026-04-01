export interface ProductTypeOption {
  id: string;
  label: string;
  icon: string;
}

export interface GenderOption {
  id: string;
  label: string;
  icon: string;
}

export const PRODUCT_TYPES: ProductTypeOption[] = [
  { id: 'TSHIRT', label: 'T-shirt', icon: 'shirt-outline' },
  { id: 'BONNET', label: 'Bonnet', icon: 'ribbon-outline' },
  { id: 'SAC', label: 'Sac', icon: 'briefcase-outline' },
  { id: 'ENSEMBLE', label: 'Ensemble', icon: 'layers-outline' },
  { id: 'ACCESSOIRE', label: 'Accessoire', icon: 'watch-outline' },
];

export const GENDER_OPTIONS: GenderOption[] = [
  { id: 'HOMME', label: 'Homme', icon: 'man' },
  { id: 'FEMME', label: 'Femme', icon: 'woman' },
  { id: 'UNISEXE', label: 'Unisexe', icon: 'people' },
];

export interface ProductTypeConfig {
  showSizes: boolean;
  showColors: boolean;
  showWeight: boolean;
  sizeLabel: string;
  colorLabel: string;
}

export const PRODUCT_TYPE_CONFIG: Record<string, ProductTypeConfig> = {
  TSHIRT: {
    showSizes: true,
    showColors: true,
    showWeight: false,
    sizeLabel: 'Tailles disponibles',
    colorLabel: 'Couleurs disponibles',
  },
  BONNET: {
    showSizes: false,
    showColors: true,
    showWeight: false,
    sizeLabel: 'Taille unique',
    colorLabel: 'Couleur principale',
  },
  SAC: {
    showSizes: false,
    showColors: true,
    showWeight: true,
    sizeLabel: 'Dimensions',
    colorLabel: 'Couleurs',
  },
  ENSEMBLE: {
    showSizes: true,
    showColors: true,
    showWeight: false,
    sizeLabel: 'Tailles (ex: Haut S + Bas M)',
    colorLabel: 'Couleurs dominantes',
  },
  ACCESSOIRE: {
    showSizes: false,
    showColors: true,
    showWeight: false,
    sizeLabel: 'Taille',
    colorLabel: 'Couleurs',
  },
};

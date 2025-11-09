/* eslint-disable @typescript-eslint/array-type */
// src/features/commandes/types/commande.types.ts

/**
 * Types utilitaires et constants pour le module commandes
 */

// ============================================
// CONSTANTS
// ============================================

export const COMMANDE_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  CONFIRMEE: 'CONFIRMEE',
  ANNULEE: 'ANNULEE',
} as const;

export const STATUS_LABELS = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
} as const;

export const STATUS_COLORS = {
  EN_ATTENTE: {
    bg: '#FFF4E6',
    text: '#F57C00',
    border: '#FFB74D',
  },
  CONFIRMEE: {
    bg: '#E3F2FD',
    text: '#1976D2',
    border: '#64B5F6',
  },
  ANNULEE: {
    bg: '#FFEBEE',
    text: '#D32F2F',
    border: '#E57373',
  },
} as const;

export const STATUS_ICONS = {
  EN_ATTENTE: '⏳',
  CONFIRMEE: '✅',
  ANNULEE: '❌',
} as const;

// ============================================
// VALIDATION
// ============================================

export const COMMANDE_VALIDATION = {
  MIN_ITEMS: 1,
  MAX_ITEMS: 20,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  SHIPPING_FEE: 0, // MVP: gratuit
  AUTO_CANCEL_HOURS: 48,
} as const;

// ============================================
// FORMATTERS
// ============================================

/**
 * 💰 Formater un montant en FCFA
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 📅 Formater une date de commande
 */
export function formatCommandeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * 📅 Formater une date complète
 */
export function formatFullDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * 🔢 Formater un numéro de commande court
 */
export function formatShortOrderNumber(orderNumber: string): string {
  // CMD-202411-000001 -> #000001
  return `#${orderNumber.split('-')[2]}`;
}

// ============================================
// VALIDATORS
// ============================================

/**
 * ✅ Valider une adresse de livraison
 */
export function validateShippingAddress(address: {
  adresse: string;
  ville: string;
  telephone: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.adresse || address.adresse.trim().length < 10) {
    errors.push('L\'adresse doit contenir au moins 10 caractères');
  }

  if (!address.ville || address.ville.trim().length < 2) {
    errors.push('La ville est requise');
  }

  const phoneRegex = /^(77|78|76|75|70)[0-9]{7}$/;
  if (!address.telephone || !phoneRegex.test(address.telephone.replace(/\s/g, ''))) {
    errors.push('Numéro de téléphone invalide (ex: 77 123 45 67)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * ✅ Valider les items d'une commande
 */
export function validateCommandeItems(items: Array<{
  variantId: string;
  quantity: number;
}>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!items || items.length < COMMANDE_VALIDATION.MIN_ITEMS) {
    errors.push('La commande doit contenir au moins un article');
  }

  if (items.length > COMMANDE_VALIDATION.MAX_ITEMS) {
    errors.push(`Maximum ${COMMANDE_VALIDATION.MAX_ITEMS} articles par commande`);
  }

  items.forEach((item, index) => {
    if (!item.variantId) {
      errors.push(`Article ${index + 1}: Variante manquante`);
    }
    if (item.quantity < COMMANDE_VALIDATION.MIN_QUANTITY) {
      errors.push(`Article ${index + 1}: Quantité minimale est ${COMMANDE_VALIDATION.MIN_QUANTITY}`);
    }
    if (item.quantity > COMMANDE_VALIDATION.MAX_QUANTITY) {
      errors.push(`Article ${index + 1}: Quantité maximale est ${COMMANDE_VALIDATION.MAX_QUANTITY}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// UTILS
// ============================================

/**
 * ⏰ Calculer le temps restant avant auto-annulation
 */
export function getTimeUntilAutoCancel(createdAt: Date | string): {
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const created = new Date(createdAt);
  const expiresAt = new Date(created.getTime() + COMMANDE_VALIDATION.AUTO_CANCEL_HOURS * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  return { hours, minutes, expired: false };
}

/**
 * 📊 Calculer le récapitulatif d'une commande
 */
export function calculateOrderSummary(items: Array<{
  price: number;
  quantity: number;
}>, discount: number = 0): {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = COMMANDE_VALIDATION.SHIPPING_FEE;
  const total = subtotal + shippingFee - discount;

  return {
    subtotal,
    shippingFee,
    discount,
    total,
  };
}

/**
 * 🎨 Obtenir les couleurs d'un statut
 */
export function getStatusColors(status: keyof typeof STATUS_COLORS) {
  return STATUS_COLORS[status] || STATUS_COLORS.EN_ATTENTE;
}

/**
 * 🏷️ Vérifier si une commande peut être annulée
 */
export function canCancelCommande(status: string): boolean {
  return status === COMMANDE_STATUS.EN_ATTENTE;
}

/**
 * 🏷️ Vérifier si une commande peut être confirmée
 */
export function canConfirmCommande(status: string): boolean {
  return status === COMMANDE_STATUS.EN_ATTENTE;
}

/**
 * 📱 Formater un numéro de téléphone
 */
export function formatPhoneNumber(phone: string): string {
  // 77 123 45 67 -> 77 123 45 67
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
/**
 * Deterministic price formatting to avoid Next.js hydration mismatches.
 * We use a fixed locale ('fr-FR') to ensure both server and client render the same string.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price);
}

/**
 * Formats a price with the FCFA currency suffix.
 */
export function formatPriceWithCurrency(price: number): string {
  return `${formatPrice(price)} FCFA`;
}

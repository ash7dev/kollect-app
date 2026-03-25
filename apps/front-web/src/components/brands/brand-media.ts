/**
 * Returns a usable media URL from a stored value.
 * The API stores full URLs after upload, so this is mostly a null-safety helper.
 */
export function brandMediaUrl(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string' || value.trim() === '') return null;
  return value.trim();
}

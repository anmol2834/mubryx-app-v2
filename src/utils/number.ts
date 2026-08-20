/**
 * Safely parses numbers from API responses.
 * Logs a warning in development mode if an invalid/NaN number string is encountered.
 */
export function safeNumber(value: any, fallback = 0, fieldName?: string): number {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(num)) {
    if (__DEV__ || process.env.NODE_ENV !== 'production') {
      const fieldMsg = fieldName ? ` for field '${fieldName}'` : '';
      console.warn(`[Data Layer Warning] Received invalid numeric value${fieldMsg}:`, value);
    }
    return fallback;
  }

  return num;
}

/**
 * Formats a currency/price number, eliminating binary floating-point precision artifacts (e.g. 706.8199999999999 -> 706.82 or 707).
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0';
  const num = Number(amount);
  const rounded = Math.round(num * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

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

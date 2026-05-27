/**
 * Parse a timestamp coming from the backend.
 *
 * The data-service emits ISO 8601 with a UTC offset (`...+00:00`), but as a
 * safety net for any legacy / naive value that slips through, we append `Z`
 * when no offset is present so the browser doesn't reinterpret a UTC moment
 * as local time. Returns `null` on missing or invalid input.
 */
export function parseServerDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasOffset ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

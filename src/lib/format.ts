import { format, parseISO } from 'date-fns';

const NON_APPLICABLE = 'Non applicable';

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return NON_APPLICABLE;
  return new Intl.NumberFormat('en-US').format(value);
}

/** Score with its scale kept visible next to it, e.g. "8.7 / 10". */
export function formatScore(value: number | null | undefined, scale: string): string {
  if (value === null || value === undefined) return NON_APPLICABLE;
  return `${value.toFixed(1)} / ${scale}`;
}

/** NPS rounded to one decimal, with an explicit sign. */
export function formatNps(value: number | null | undefined): string {
  if (value === null || value === undefined) return NON_APPLICABLE;
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(1)}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return NON_APPLICABLE;
  return `${value.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM yyyy');
  } catch {
    return 'Unknown';
  }
}

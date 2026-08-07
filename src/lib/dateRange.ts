import { isAfter, isBefore, parseISO, subDays } from 'date-fns';

export type DatePreset = '7d' | '30d' | '90d';

const PRESET_DAYS: Record<DatePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function presetRange(preset: DatePreset, anchor: Date = new Date()) {
  return { start: subDays(anchor, PRESET_DAYS[preset]), end: anchor };
}

/**
 * True when `dateIso` falls within [start, end] (inclusive). Missing
 * start/end bounds are treated as open - no default range is guessed.
 */
export function isWithinDateRange(dateIso: string, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const date = parseISO(dateIso);
  if (start && isBefore(date, parseISO(start))) return false;
  if (end && isAfter(date, parseISO(end))) return false;
  return true;
}

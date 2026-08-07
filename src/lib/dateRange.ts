import { addDays, format, isAfter, isBefore, parseISO, startOfWeek, subDays } from 'date-fns';

export type DatePreset = '7d' | '30d' | '90d';

const PRESET_DAYS: Record<DatePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

/**
 * "Today" for preset ranges is anchored to the most recent date present in
 * the fixtures, not the real calendar date. The fixtures are a fixed
 * April 2026 snapshot - anchoring on the wall clock would make every
 * "last 7 days" preset match zero rows. Anchoring on the data itself
 * mirrors what "last 7 days of data" means for a real, live dataset.
 */
export function latestDate(dates: string[]): Date {
  const sorted = dates.slice().sort();
  const last = sorted.at(-1);
  return last ? parseISO(last) : new Date();
}

export function presetRange(preset: DatePreset, anchor: Date) {
  return { start: subDays(anchor, PRESET_DAYS[preset]), end: anchor };
}

/** ISO week label (e.g. "W16") for a date, used to group rows by week. */
export function isoWeekLabel(dateIso: string): string {
  return format(parseISO(dateIso), "'W'II");
}

/**
 * Week buckets (Monday-start) spanning [start, end], inclusive, in order.
 * Used so an empty week still shows up as a zero bar rather than a gap.
 */
export function weekBucketsBetween(start: Date, end: Date): Array<{ label: string; start: Date; end: Date }> {
  const buckets: Array<{ label: string; start: Date; end: Date }> = [];
  let cursor = startOfWeek(start, { weekStartsOn: 1 });
  while (!isAfter(cursor, end)) {
    const bucketEnd = addDays(cursor, 6);
    buckets.push({ label: format(cursor, "'W'II"), start: cursor, end: bucketEnd });
    cursor = addDays(cursor, 7);
  }
  return buckets;
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

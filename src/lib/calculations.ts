import type { Category, CRMRow, HotjarRow, Market, MyCpBaseline, MyCpMarketStats, MyCpRow } from '../types';
import { MARKETS } from '../constants/markets';
import { isWithinDateRange, isoWeekLabel } from './dateRange';

/**
 * Pure calculation functions. Kept separate from rendering and data
 * loading per CLAUDE.md. Do not mix Hotjar (1-5) and MyCP (0-10) scores in
 * a single calculation - each scale has its own function below.
 */

export type MyCpBucket = 'promoter' | 'passive' | 'detractor';

/** MyCP bucket for a single 0-10 score. Score 0 is a valid detractor. */
export function getMyCpBucket(score: number): MyCpBucket {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

/**
 * NPS for MyCP (0-10 scale) scores only. Never pass Hotjar (1-5) scores
 * here - there is no defined NPS for the Hotjar scale in this data model.
 * Returns null for an empty input (no silent zero).
 */
export function calculateMyCpNps(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const promoters = scores.filter((score) => score >= 9).length;
  const detractors = scores.filter((score) => score <= 6).length;
  return ((promoters - detractors) / scores.length) * 100;
}

/** Plain average of a set of numbers. Scale-agnostic - callers decide what scale they're passing. */
export function calculateAverageScore(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Average Hotjar score (1-5 scale). Unanswered scores (null/undefined) are
 * excluded from the calculation, not treated as zero. Returns null when no
 * score was answered. Deliberately a separate function from any MyCP
 * average - never pass Hotjar (1-5) and MyCP (0-10) scores through the
 * same calculation (mixed-scale protection, docs/BACKLOG.md Phase 7).
 */
export function calculateHotjarAverage(scores: Array<number | null | undefined>): number | null {
  const answered = scores.filter((score): score is number => score !== null && score !== undefined);
  return calculateAverageScore(answered);
}

/**
 * Builds a live MyCpBaseline from real, uploaded MyCP rows (docs/BACKLOG.md
 * Phase 6) - the same shape as the validated static baseline
 * (lib/mycpBaseline.ts), but computed. Only meant to be used once all six
 * markets are loaded (see isMyCpDataCoherent) - the caller is responsible
 * for that gating, per CLAUDE.md's "Data loading" rules.
 */
export function computeMyCpBaselineFromRows(rowsByMarket: Partial<Record<Market, MyCpRow[]>>): MyCpBaseline {
  const markets = {} as Record<Market, MyCpMarketStats>;
  const allScores: number[] = [];
  for (const market of MARKETS) {
    const scores = (rowsByMarket[market] ?? []).map((row) => row.score);
    allScores.push(...scores);
    markets[market] = {
      responses: scores.length,
      average: calculateAverageScore(scores) ?? 0,
      nps: calculateMyCpNps(scores) ?? 0,
    };
  }
  return {
    global: {
      responses: allScores.length,
      average: calculateAverageScore(allScores) ?? 0,
      nps: calculateMyCpNps(allScores) ?? 0,
    },
    markets,
  };
}

/**
 * CLAUDE.md "Data loading": replace static MyCP data only when all six
 * market files are loaded and the combined row count is coherent. This
 * prototype defines "coherent" as: all six markets present, each with at
 * least one row.
 */
export function isMyCpDataCoherent(rowsByMarket: Partial<Record<Market, MyCpRow[]>>): boolean {
  return MARKETS.every((market) => (rowsByMarket[market]?.length ?? 0) > 0);
}

export type CrmRates = {
  total: number;
  positiveRate: number | null;
  negativeRate: number | null;
  neutralRate: number | null;
};

/** CRM sentiment split as percentages. Returns nulls (not zero) for an empty set. */
export function calculateCrmRates(rows: Array<Pick<CRMRow, 'sentiment'>>): CrmRates {
  const total = rows.length;
  if (total === 0) {
    return { total: 0, positiveRate: null, negativeRate: null, neutralRate: null };
  }
  const countOf = (sentiment: CRMRow['sentiment']) =>
    rows.filter((row) => row.sentiment === sentiment).length;
  return {
    total,
    positiveRate: (countOf('positive') / total) * 100,
    negativeRate: (countOf('negative') / total) * 100,
    neutralRate: (countOf('neutral') / total) * 100,
  };
}

export type WeeklyCrmRate = { week: string; positiveRate: number | null; negativeRate: number | null; total: number };

/** Weekly positive/negative rate, grouped by ISO week of `date`. */
export function calculateWeeklyCrmRates(rows: CRMRow[]): WeeklyCrmRate[] {
  const byWeek = new Map<string, CRMRow[]>();
  for (const row of rows) {
    const week = isoWeekLabel(row.date);
    byWeek.set(week, [...(byWeek.get(week) ?? []), row]);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, weekRows]) => {
      const rates = calculateCrmRates(weekRows);
      return { week, positiveRate: rates.positiveRate, negativeRate: rates.negativeRate, total: rates.total };
    });
}

/**
 * The most frequently repeated negative comment in a set of CRM rows -
 * used as a real, derived "root cause" signal instead of an invented one.
 * Returns null when there are no negative comments to summarize.
 */
export function mostFrequentNegativeText(rows: CRMRow[]): string | null {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.sentiment !== 'negative' || !row.negativeText) continue;
    counts.set(row.negativeText, (counts.get(row.negativeText) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [text, count] of counts) {
    if (count > bestCount) {
      best = text;
      bestCount = count;
    }
  }
  return best;
}

export type WeeklyHotjarAverage = { week: string; average: number | null; scoredCount: number };

/** Weekly Hotjar average (1-5 scale), grouped by ISO week of `date`. */
export function calculateWeeklyHotjarAverage(rows: HotjarRow[]): WeeklyHotjarAverage[] {
  const byWeek = new Map<string, HotjarRow[]>();
  for (const row of rows) {
    const week = isoWeekLabel(row.date);
    byWeek.set(week, [...(byWeek.get(week) ?? []), row]);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, weekRows]) => {
      const average = calculateHotjarAverage(weekRows.map((row) => row.score));
      const scoredCount = weekRows.filter((row) => row.score !== null && row.score !== undefined).length;
      return { week, average, scoredCount };
    });
}

export type HotjarScoreDistribution = {
  scoredCount: number;
  /** Percentage of scored responses at each 1-5 score. Empty distribution -> all zero. */
  byScore: Record<1 | 2 | 3 | 4 | 5, number>;
};

/**
 * Distribution of Hotjar 1-5 scores as percentages of answered responses.
 * Unanswered (null/undefined) scores are excluded, mirroring
 * calculateHotjarAverage - never counted as a score bucket.
 */
export function calculateHotjarScoreDistribution(scores: Array<number | null | undefined>): HotjarScoreDistribution {
  const answered = scores.filter((score): score is number => score !== null && score !== undefined);
  const byScore = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  if (answered.length === 0) return { scoredCount: 0, byScore };
  for (const score of answered) {
    const bucket = Math.round(score) as 1 | 2 | 3 | 4 | 5;
    if (bucket >= 1 && bucket <= 5) byScore[bucket] += 1;
  }
  for (const bucket of [1, 2, 3, 4, 5] as const) {
    byScore[bucket] = (byScore[bucket] / answered.length) * 100;
  }
  return { scoredCount: answered.length, byScore };
}

/** Category counts for Hotjar rows falling within [start, end]. */
export function countHotjarByCategory(
  rows: HotjarRow[],
  start?: string,
  end?: string,
): Array<{ category: Category; count: number }> {
  const counts = new Map<Category, number>();
  for (const row of rows) {
    if (!row.category) continue;
    if (!isWithinDateRange(row.date, start, end)) continue;
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

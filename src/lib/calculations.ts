import type { CRMRow } from '../types';

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

/**
 * Average Hotjar score (1-5 scale). Unanswered scores (null/undefined) are
 * excluded from the calculation, not treated as zero. Returns null when no
 * score was answered.
 */
export function calculateHotjarAverage(scores: Array<number | null | undefined>): number | null {
  const answered = scores.filter((score): score is number => score !== null && score !== undefined);
  if (answered.length === 0) return null;
  return answered.reduce((sum, score) => sum + score, 0) / answered.length;
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

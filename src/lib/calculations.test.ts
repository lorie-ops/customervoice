import { describe, expect, it } from 'vitest';
import {
  calculateCrmRates,
  calculateHotjarAverage,
  calculateMyCpNps,
  calculateWeeklyCrmRates,
  calculateWeeklyHotjarAverage,
  countHotjarByCategory,
  getMyCpBucket,
  mostFrequentNegativeText,
} from './calculations';
import type { CRMRow, HotjarRow } from '../types';

describe('getMyCpBucket', () => {
  it('classifies 9 and 10 as promoters', () => {
    expect(getMyCpBucket(9)).toBe('promoter');
    expect(getMyCpBucket(10)).toBe('promoter');
  });

  it('classifies 7 and 8 as passives', () => {
    expect(getMyCpBucket(7)).toBe('passive');
    expect(getMyCpBucket(8)).toBe('passive');
  });

  it('classifies 0 through 6 as detractors, including score 0', () => {
    expect(getMyCpBucket(0)).toBe('detractor');
    expect(getMyCpBucket(6)).toBe('detractor');
  });
});

describe('calculateMyCpNps', () => {
  it('returns null for an empty input instead of zero', () => {
    expect(calculateMyCpNps([])).toBeNull();
  });

  it('does not drop score 0 from the detractor count', () => {
    // 1 promoter (10), 1 detractor (0) -> NPS = 0
    expect(calculateMyCpNps([10, 0])).toBe(0);
  });

  it('matches the validated global April 2026 baseline shape (all promoters)', () => {
    expect(calculateMyCpNps([9, 9, 10, 10])).toBe(100);
  });

  it('computes a negative NPS when detractors dominate', () => {
    expect(calculateMyCpNps([0, 1, 2, 9])).toBe(-50);
  });
});

describe('calculateHotjarAverage', () => {
  it('returns null when no score was answered', () => {
    expect(calculateHotjarAverage([null, undefined])).toBeNull();
  });

  it('excludes unanswered scores rather than treating them as zero', () => {
    expect(calculateHotjarAverage([4, null, 2, undefined])).toBe(3);
  });

  it('stays on the 1-5 scale', () => {
    expect(calculateHotjarAverage([1, 5])).toBe(3);
  });
});

describe('calculateCrmRates', () => {
  it('returns nulls (not zero) for an empty set', () => {
    expect(calculateCrmRates([])).toEqual({
      total: 0,
      positiveRate: null,
      negativeRate: null,
      neutralRate: null,
    });
  });

  it('computes percentages that add up to 100', () => {
    const rows = [
      { sentiment: 'positive' as const },
      { sentiment: 'positive' as const },
      { sentiment: 'negative' as const },
      { sentiment: 'neutral' as const },
    ];
    const rates = calculateCrmRates(rows);
    expect(rates.total).toBe(4);
    expect(rates.positiveRate).toBe(50);
    expect(rates.negativeRate).toBe(25);
    expect(rates.neutralRate).toBe(25);
  });
});

describe('calculateWeeklyCrmRates', () => {
  it('groups rows by ISO week and computes each week independently', () => {
    const rows: CRMRow[] = [
      { id: '1', date: '2026-04-01', market: 'FR', sentiment: 'positive' },
      { id: '2', date: '2026-04-02', market: 'FR', sentiment: 'negative' },
      { id: '3', date: '2026-04-15', market: 'FR', sentiment: 'positive' },
    ];
    const weekly = calculateWeeklyCrmRates(rows);
    expect(weekly.length).toBe(2);
    expect(weekly[0].total).toBe(2);
    expect(weekly[1].total).toBe(1);
  });
});

describe('mostFrequentNegativeText', () => {
  it('returns null when there are no negative comments', () => {
    const rows: CRMRow[] = [{ id: '1', date: '2026-04-01', market: 'FR', sentiment: 'positive' }];
    expect(mostFrequentNegativeText(rows)).toBeNull();
  });

  it('returns the most repeated negative comment', () => {
    const rows: CRMRow[] = [
      { id: '1', date: '2026-04-01', market: 'FR', sentiment: 'negative', negativeText: 'A' },
      { id: '2', date: '2026-04-02', market: 'FR', sentiment: 'negative', negativeText: 'B' },
      { id: '3', date: '2026-04-03', market: 'FR', sentiment: 'negative', negativeText: 'A' },
    ];
    expect(mostFrequentNegativeText(rows)).toBe('A');
  });
});

describe('calculateWeeklyHotjarAverage', () => {
  it('groups by ISO week and excludes unanswered scores per week', () => {
    const rows: HotjarRow[] = [
      { id: '1', date: '2026-04-01', country: 'FR', message: 'a', scope: 'Web', score: 4 },
      { id: '2', date: '2026-04-02', country: 'FR', message: 'b', scope: 'Web', score: null },
      { id: '3', date: '2026-04-15', country: 'FR', message: 'c', scope: 'Web', score: 2 },
    ];
    const weekly = calculateWeeklyHotjarAverage(rows);
    expect(weekly.length).toBe(2);
    expect(weekly[0].average).toBe(4);
    expect(weekly[0].scoredCount).toBe(1);
  });
});

describe('countHotjarByCategory', () => {
  it('counts categories within the date range, sorted descending', () => {
    const rows: HotjarRow[] = [
      { id: '1', date: '2026-04-01', country: 'FR', message: 'a', scope: 'Web', category: 'Payment / Price' },
      { id: '2', date: '2026-04-02', country: 'FR', message: 'b', scope: 'Web', category: 'Payment / Price' },
      { id: '3', date: '2026-04-03', country: 'FR', message: 'c', scope: 'Web', category: 'Other' },
      { id: '4', date: '2026-05-01', country: 'FR', message: 'd', scope: 'Web', category: 'Payment / Price' },
    ];
    const counts = countHotjarByCategory(rows, '2026-04-01', '2026-04-30');
    expect(counts).toEqual([
      { category: 'Payment / Price', count: 2 },
      { category: 'Other', count: 1 },
    ]);
  });
});

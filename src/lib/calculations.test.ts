import { describe, expect, it } from 'vitest';
import { calculateCrmRates, calculateHotjarAverage, calculateMyCpNps, getMyCpBucket } from './calculations';

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

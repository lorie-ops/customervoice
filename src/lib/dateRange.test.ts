import { describe, expect, it } from 'vitest';
import { isWithinDateRange } from './dateRange';

describe('isWithinDateRange', () => {
  it('is true for any date when no bounds are given', () => {
    expect(isWithinDateRange('2026-04-15')).toBe(true);
  });

  it('excludes dates before the start bound', () => {
    expect(isWithinDateRange('2026-04-01', '2026-04-02')).toBe(false);
  });

  it('excludes dates after the end bound', () => {
    expect(isWithinDateRange('2026-04-30', undefined, '2026-04-29')).toBe(false);
  });

  it('includes boundary dates (inclusive range)', () => {
    expect(isWithinDateRange('2026-04-02', '2026-04-02', '2026-04-02')).toBe(true);
  });
});

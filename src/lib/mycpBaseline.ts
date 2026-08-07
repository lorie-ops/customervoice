import type { Market, MyCpBaseline } from '../types';

/**
 * Validated MyCP April 2026 baseline (CLAUDE.md / docs/DATA_MODEL.md).
 * Static and authoritative - never derive these numbers from a fixture,
 * and never replace them until all six market XLSX files are loaded and
 * coherent (CLAUDE.md "Data loading" rules - Phase 6).
 */
export const MYCP_BASELINE_APRIL_2026: MyCpBaseline = {
  global: { responses: 1124, average: 8.7, nps: 60 },
  markets: {
    DK: { responses: 18, average: 7.9, nps: 38.9 },
    BEFR: { responses: 28, average: 9.2, nps: 67.9 },
    BENL: { responses: 133, average: 8.6, nps: 57.1 },
    NL: { responses: 256, average: 8.9, nps: 62.9 },
    FR: { responses: 352, average: 8.7, nps: 61.1 },
    DE: { responses: 337, average: 8.7, nps: 57.6 },
  },
};

/** April 2025 NPS comparison values - DK intentionally absent ("not available"). */
export const MYCP_APRIL_2025_NPS_COMPARISON: Partial<Record<Market, number>> = {
  FR: 60.6,
  DE: 51.8,
  NL: 58.3,
  BEFR: 73.7,
  BENL: 52.1,
};

/**
 * SYNTHETIC illustrative example target, not a validated OKR - shown on
 * the Monthly Report slide to demonstrate the layout. Marketing should
 * confirm the real committed target before this is treated as real.
 */
export const MYCP_NPS_TARGET_OKR_EXAMPLE = 65;

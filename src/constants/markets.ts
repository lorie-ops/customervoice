import type { Market } from '../types';

/** The six validated markets (docs/DATA_MODEL.md, DATA_MODEL_ADDENDUM.md §2). */
export const MARKETS: Market[] = ['FR', 'NL', 'DE', 'BEFR', 'BENL', 'DK'];

export const MARKET_LABELS: Record<Market, string> = {
  FR: 'France',
  NL: 'Netherlands',
  DE: 'Germany',
  BEFR: 'Belgium (FR)',
  BENL: 'Belgium (NL)',
  DK: 'Denmark',
};

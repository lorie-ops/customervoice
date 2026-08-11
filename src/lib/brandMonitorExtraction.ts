import { MARKETS } from '../constants/markets';
import type { BrandMonitoringRow, Market } from '../types';

/**
 * Validated static extraction from Brand_Monitor_2026_Analysis_1.pdf
 * (Marketing CPE, Didi Looij, 22/06/2026 - confidential), manually
 * transcribed from the deck's clearly labeled Brand Health bar charts
 * (Awareness / Consideration / Preference, May 2024 / 2025 / 2026, one
 * page per market). Displayed immediately per CLAUDE.md's "display
 * validated static data immediately" pattern (same approach as
 * lib/mycpBaseline.ts for MyCP) - replaced only once a real Brand
 * Monitor 2026.xls is uploaded (Data Sources panel).
 *
 * What is NOT included here: the PDF's Brand Image (association) and
 * Center Parcs Image (perception) charts show ~20-24 attributes each as
 * bars with dense, overlapping labels that cannot be transcribed
 * precisely enough to treat as validated data - those sections stay
 * empty (an honest "Non applicable") until the real .xls is uploaded,
 * rather than risk presenting an imprecise transcription as real
 * numbers (CLAUDE.md: "do not silently change business rules" / never
 * fabricate data).
 */

export type BrandHealthPoint = {
  awareness: number;
  consideration: number;
  preference: number;
};

export type CompetitorBrandHealth = BrandHealthPoint & { brand: string };

export type MarketBrandHealth = {
  year: number;
  centerParcs: BrandHealthPoint;
  competitors: CompetitorBrandHealth[];
};

/** Three years (May 2024 / 2025 / 2026) per market, in that order. */
export const BRAND_MONITOR_HEALTH: Record<Market, MarketBrandHealth[]> = {
  NL: [
    { year: 2024, centerParcs: { awareness: 84, consideration: 35, preference: 10 }, competitors: [
      { brand: 'Landal', awareness: 72, consideration: 33, preference: 10 },
      { brand: 'Roompot', awareness: 74, consideration: 25, preference: 3 },
    ] },
    { year: 2025, centerParcs: { awareness: 86, consideration: 38, preference: 12 }, competitors: [
      { brand: 'Landal', awareness: 71, consideration: 32, preference: 8 },
      { brand: 'Roompot', awareness: 72, consideration: 27, preference: 5 },
    ] },
    { year: 2026, centerParcs: { awareness: 90, consideration: 38, preference: 11 }, competitors: [
      { brand: 'Landal', awareness: 77, consideration: 39, preference: 11 },
      { brand: 'Roompot', awareness: 75, consideration: 24, preference: 2 },
    ] },
  ],
  BENL: [
    { year: 2024, centerParcs: { awareness: 81, consideration: 35, preference: 9 }, competitors: [
      { brand: 'Landal', awareness: 37, consideration: 13, preference: 4 },
      { brand: 'Roompot', awareness: 42, consideration: 15, preference: 2 },
    ] },
    { year: 2025, centerParcs: { awareness: 81, consideration: 33, preference: 11 }, competitors: [
      { brand: 'Landal', awareness: 35, consideration: 10, preference: 2 },
      { brand: 'Roompot', awareness: 35, consideration: 10, preference: 3 },
    ] },
    { year: 2026, centerParcs: { awareness: 78, consideration: 33, preference: 10 }, competitors: [
      { brand: 'Landal', awareness: 30, consideration: 10, preference: 2 },
      { brand: 'Roompot', awareness: 29, consideration: 10, preference: 1 },
    ] },
  ],
  BEFR: [
    { year: 2024, centerParcs: { awareness: 62, consideration: 20, preference: 4 }, competitors: [
      { brand: 'Landal', awareness: 8, consideration: 3, preference: 0 },
      { brand: 'Disneyland Paris', awareness: 66, consideration: 28, preference: 11 },
    ] },
    { year: 2025, centerParcs: { awareness: 69, consideration: 26, preference: 5 }, competitors: [
      { brand: 'Landal', awareness: 17, consideration: 5, preference: 1 },
      { brand: 'Disneyland Paris', awareness: 70, consideration: 20, preference: 6 },
    ] },
    { year: 2026, centerParcs: { awareness: 66, consideration: 24, preference: 4 }, competitors: [
      { brand: 'Landal', awareness: 14, consideration: 5, preference: 1 },
      { brand: 'Disneyland Paris', awareness: 64, consideration: 23, preference: 8 },
    ] },
  ],
  FR: [
    { year: 2024, centerParcs: { awareness: 58, consideration: 13, preference: 3 }, competitors: [
      { brand: 'Club Med', awareness: 59, consideration: 7, preference: 2 },
      { brand: 'Futuroscope', awareness: 55, consideration: 10, preference: 0 },
    ] },
    { year: 2025, centerParcs: { awareness: 65, consideration: 16, preference: 3 }, competitors: [
      { brand: 'Club Med', awareness: 66, consideration: 10, preference: 2 },
      { brand: 'Futuroscope', awareness: 64, consideration: 14, preference: 1 },
    ] },
    { year: 2026, centerParcs: { awareness: 64, consideration: 11, preference: 2 }, competitors: [
      { brand: 'Club Med', awareness: 63, consideration: 9, preference: 2 },
      { brand: 'Futuroscope', awareness: 62, consideration: 12, preference: 1 },
    ] },
  ],
  DE: [
    { year: 2024, centerParcs: { awareness: 48, consideration: 13, preference: 3 }, competitors: [
      { brand: 'Europa Park', awareness: 34, consideration: 8, preference: 1 },
      { brand: 'AIDA', awareness: 29, consideration: 7, preference: 2 },
    ] },
    { year: 2025, centerParcs: { awareness: 46, consideration: 11, preference: 3 }, competitors: [
      { brand: 'Europa Park', awareness: 39, consideration: 9, preference: 1 },
      { brand: 'AIDA', awareness: 34, consideration: 10, preference: 2 },
    ] },
    { year: 2026, centerParcs: { awareness: 52, consideration: 11, preference: 2 }, competitors: [
      { brand: 'Europa Park', awareness: 38, consideration: 8, preference: 1 },
      { brand: 'AIDA', awareness: 38, consideration: 11, preference: 3 },
    ] },
  ],
  DK: [
    { year: 2024, centerParcs: { awareness: 7, consideration: 5, preference: 1 }, competitors: [
      { brand: 'Center Parcs Nordborg Resort', awareness: 0, consideration: 0, preference: 0 },
      { brand: 'Landal', awareness: 23, consideration: 11, preference: 2 },
      { brand: 'Lalandia', awareness: 84, consideration: 35, preference: 9 },
    ] },
    { year: 2025, centerParcs: { awareness: 12, consideration: 7, preference: 1 }, competitors: [
      { brand: 'Center Parcs Nordborg Resort', awareness: 12, consideration: 9, preference: 1 },
      { brand: 'Landal', awareness: 20, consideration: 9, preference: 2 },
      { brand: 'Lalandia', awareness: 73, consideration: 29, preference: 9 },
    ] },
    { year: 2026, centerParcs: { awareness: 14, consideration: 7, preference: 2 }, competitors: [
      { brand: 'Center Parcs Nordborg Resort', awareness: 12, consideration: 6, preference: 1 },
      { brand: 'Landal', awareness: 26, consideration: 10, preference: 2 },
      { brand: 'Lalandia', awareness: 82, consideration: 33, preference: 8 },
    ] },
  ],
};

/** Verbatim from the deck's "Brand Monitor 2026 – Key insights" slide (Europe-wide). */
export const BRAND_MONITOR_INSIGHTS_EUROPE: string[] = [
  "Increase in awareness for NL/GE/DK, stable performance for FR and slight decrease for BE",
  "Consideration & Preference stable for all markets except FR; decrease in Consideration",
  "Conversion ratio short list to user decreases for all markets except BE",
  "Stable brand image (width: positioning, association) for all markets except FR: focus needed on positioning",
  "Stable CP image (depth: perception, strength, proof) for NL/BE, weakened for FR/GR/DK: focus needed on proof",
];

export const BRAND_MONITOR_GOAL_EUROPE: string[] = [
  "Strengthen Brand Awareness & Attractiveness, especially in growth markets",
  "Build Value & Relevance in all markets, proof needed in growth markets",
];

/** Verbatim from the deck's "Brand Monitor 2026 – Key insights per market" slide. */
export const BRAND_MONITOR_INSIGHTS_BY_MARKET: Record<Market, { headline: string; bullets: string[] }> = {
  NL: {
    headline: "Sustained LY's improvement – increase awareness & purpose – Landal grows",
    bullets: [
      'Increase in awareness',
      "Stable mid-funnel, kept increase of LY",
      'Challenge remains conversion after short list',
      'Leading the funnel but Landal is growing and has higher conversion to user',
      'Stable brand image, more linked to purpose, association crowded increased',
      'Stable CP image, stronger perception nature exp., proof needed premium accommodation',
    ],
  },
  BENL: {
    headline: "Stabilization – slight decrease awareness – sustained LY's improved CP image",
    bullets: [
      'Slight decrease in awareness (market pattern)',
      'Stable mid-funnel',
      'Conversion after short list slightly increased but still main challenge',
      'Stable brand image, nature association slightly weakened',
      "Stable CP image, stronger perception quality time, overall sustained LY's improvement",
    ],
  },
  BEFR: {
    headline: 'Stabilization – slight decrease awareness – stronger CP image',
    bullets: [
      'Slight decrease in awareness (market pattern)',
      'Stable mid-funnel',
      'Conversion after short list slightly increased but still main challenge',
      'Stable brand image',
      'CP image shows a stronger perception on multiple attributes',
    ],
  },
  FR: {
    headline: 'Stabilization – slight decrease consideration – weakened brand image & CP image',
    bullets: [
      "Stable awareness, sustained LY's improvement",
      'Slight decrease consideration (market pattern)',
      'Challenge remains to drive awareness, consideration and conversion after short list',
      'Brand image weakened, back on 2024 level, focus needed on positioning',
      'CP image perception overall weakened, focus needed on proof',
    ],
  },
  DE: {
    headline: 'Increase awareness – stable funnel – stable brand image, weakened CP image',
    bullets: [
      'Increase in awareness',
      'Stable mid-funnel',
      'Challenge remains to drive awareness, consideration and conversion after short list',
      'Stable brand image, high & stronger association with families',
      'CP image perception overall weakened, focus needed on proof',
    ],
  },
  DK: {
    headline: "Slight increase awareness – sustained LY's improved position – focus on building brand",
    bullets: [
      "Slight increase awareness Center Parcs, stable for Nordborg Resort: sustained LY's improved position in introduction market with strong competition of Lalandia",
      'Challenge remains to drive awareness, consideration and conversion after short list',
      "Stable brand image, sustained LY's improved position",
      'Brand Image Center Parcs Nordborg Resort equal to CP - consistent brand positioning',
      'CP image perception overall weakened, focus needed on proof',
    ],
  },
};

/**
 * Builds the static BrandMonitoringRow[] baseline from BRAND_MONITOR_HEALTH
 * above - one row per (market, brand, year). brandImage/cpImage are left
 * empty (see this file's top comment on what was not transcribed); real
 * charts for those stay an honest empty state until a real upload.
 */
export function buildStaticBrandMonitoringRows(): BrandMonitoringRow[] {
  const rows: BrandMonitoringRow[] = [];
  for (const market of MARKETS) {
    for (const point of BRAND_MONITOR_HEALTH[market]) {
      rows.push({
        id: `brandmonitor-static-${market}-CenterParcs-${point.year}`,
        market,
        year: point.year,
        brand: 'Center Parcs',
        awarenessTotal: point.centerParcs.awareness,
        consideration: point.centerParcs.consideration,
        preference: point.centerParcs.preference,
        brandImage: {},
        cpImage: {},
        source: 'BrandMonitoring',
      });
      for (const competitor of point.competitors) {
        rows.push({
          id: `brandmonitor-static-${market}-${competitor.brand.replace(/\s+/g, '')}-${point.year}`,
          market,
          year: point.year,
          brand: competitor.brand,
          awarenessTotal: competitor.awareness,
          consideration: competitor.consideration,
          preference: competitor.preference,
          brandImage: {},
          cpImage: {},
          source: 'BrandMonitoring',
        });
      }
    }
  }
  return rows;
}

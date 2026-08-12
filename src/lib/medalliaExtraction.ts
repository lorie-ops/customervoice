import type { Market } from '../types';

/**
 * Validated static extraction, computed directly from a real Medallia
 * EQS export (EQS_extract_April_26_1.xlsx - 21,707 responses, 2 Apr -
 * 12 May 2026, the same file referenced elsewhere in this app as
 * "medallia_aggregated.json"). Filtered to Brand = "CP" (excludes 787
 * "SP" sub-brand rows) so every number below is Center Parcs only.
 * Displayed immediately, same "display validated static data
 * immediately" pattern as MyCP/Brand Monitoring - replaced only once a
 * real file is uploaded (Data Sources panel). The BEFR/BENL split is
 * derived from which specific resort each response is about (see
 * constants/medalliaProperties.ts) - the export has no market column of
 * its own.
 *
 * Category scores use "Cottage comfort" as the cottage figure - the
 * export's own "Cottage general" column is entirely empty for every
 * response, so comfort is the closest real substitute.
 */

export type MedalliaMarketStats = {
  responses: number;
  average: number;
  nps: number;
  overallSatisfaction: number;
  returnIntent: { yes: number; probably: number; probablyNot: number; no: number };
};

export type MedalliaCategoryScores = {
  checkin: number;
  village: number;
  cottage: number;
  aquamundo: number;
  catering: number;
};

export type MedalliaBaseline = {
  global: MedalliaMarketStats;
  markets: Record<Market, MedalliaMarketStats>;
  categoriesGlobal: MedalliaCategoryScores;
  categoriesByMarket: Record<Market, MedalliaCategoryScores>;
};

export const MEDALLIA_BASELINE_APRIL_2026: MedalliaBaseline = {
  global: {
    responses: 20894,
    average: 7.95,
    nps: 28.2,
    overallSatisfaction: 7.88,
    returnIntent: { yes: 47.5, probably: 40.9, probablyNot: 10.0, no: 1.7 },
  },
  markets: {
    FR: { responses: 6083, average: 7.99, nps: 30.5, overallSatisfaction: 7.84, returnIntent: { yes: 46.4, probably: 40.7, probablyNot: 11.0, no: 1.9 } },
    NL: { responses: 6297, average: 7.80, nps: 21.5, overallSatisfaction: 7.77, returnIntent: { yes: 47.8, probably: 40.4, probablyNot: 10.3, no: 1.6 } },
    DE: { responses: 5148, average: 7.89, nps: 27.3, overallSatisfaction: 7.88, returnIntent: { yes: 43.9, probably: 43.2, probablyNot: 11.2, no: 1.7 } },
    BEFR: { responses: 328, average: 7.66, nps: 17.7, overallSatisfaction: 7.58, returnIntent: { yes: 46.4, probably: 43.5, probablyNot: 8.5, no: 1.6 } },
    BENL: { responses: 2622, average: 8.26, nps: 38.3, overallSatisfaction: 8.17, returnIntent: { yes: 55.5, probably: 37.7, probablyNot: 5.4, no: 1.4 } },
    DK: { responses: 442, average: 8.63, nps: 51.8, overallSatisfaction: 8.59, returnIntent: { yes: 52.7, probably: 41.0, probablyNot: 5.7, no: 0.6 } },
  },
  categoriesGlobal: { checkin: 8.96, village: 8.51, cottage: 7.73, aquamundo: 8.26, catering: 7.52 },
  categoriesByMarket: {
    FR: { checkin: 8.93, village: 8.56, cottage: 7.85, aquamundo: 8.40, catering: 7.48 },
    NL: { checkin: 8.90, village: 8.34, cottage: 7.48, aquamundo: 7.96, catering: 7.39 },
    DE: { checkin: 9.03, village: 8.58, cottage: 7.76, aquamundo: 8.37, catering: 7.59 },
    BEFR: { checkin: 8.88, village: 8.34, cottage: 7.40, aquamundo: 7.80, catering: 7.14 },
    BENL: { checkin: 9.05, village: 8.68, cottage: 7.90, aquamundo: 8.34, catering: 7.79 },
    DK: { checkin: 9.19, village: 8.64, cottage: 8.68, aquamundo: 9.04, catering: 7.81 },
  },
};

export type MedalliaWeekPoint = { week: string; average: number; nps: number; count: number };

/** Real weekly NPS/average trend, global (all markets), computed from the same extract. */
export const MEDALLIA_WEEKLY_TREND: MedalliaWeekPoint[] = [
  { week: 'W14', average: 7.76, nps: 24.9, count: 1167 },
  { week: 'W15', average: 7.94, nps: 27.9, count: 3980 },
  { week: 'W16', average: 8.06, nps: 32.1, count: 3946 },
  { week: 'W17', average: 8.03, nps: 29.5, count: 3486 },
  { week: 'W18', average: 7.90, nps: 26.4, count: 5937 },
  { week: 'W19', average: 7.87, nps: 26.7, count: 2378 },
];

/**
 * Verbatim excerpts from CPE_NPS_Program_Full_Quality_review_FY25.pptx
 * (Product Intelligence, 27/11/2025) - a different, earlier reporting
 * period (FY25 annual) than the April 2026 extract above, kept clearly
 * separate rather than blended into one "current" number.
 */
export const MEDALLIA_FY25_EXECUTIVE_SUMMARY: string[] = [
  '985,715 invitations sent (+30,364 vs LY). Email opening rate +6pts (69%), click-through rate -2.8pts (34%).',
  'Survey return rate -2.5pts (30%) = 296K respondents, -3% vs LY. Abandonment rate flat at 11.7%.',
  'NPS CPSP FY25 = 20.5, improved +6pts vs LY - up in all countries, all parks, all guest segments (only Sunparks decreased, still <0).',
  'Net Satisfaction Scores of village, staff, cottage, Aqua Mundo, leisure and catering are the highest contributors to NPS. Key attributes: village safety, cottage maintenance and cleanliness, offer and value for money.',
  '26% of records include at least one negative accommodation-related comment (cleanliness, maintenance, upkeep, inventory, comfort) - down 6pts vs FY24 (32%), improving NPS.',
  '60-80% of comments are positive on staff, reception, check-in/out, village location/design, spa and Aqua Mundo.',
];

export const MEDALLIA_FY25_COUNTRY_RANKING: Array<{ market: Market; nps: number; deltaVsLastYear: number }> = [
  { market: 'DK', nps: 30.3, deltaVsLastYear: 0 },
  { market: 'BEFR', nps: 30.2, deltaVsLastYear: 5.3 },
  { market: 'FR', nps: 22.0, deltaVsLastYear: 6.6 },
  { market: 'DE', nps: 20.7, deltaVsLastYear: 6.0 },
  { market: 'NL', nps: 18.1, deltaVsLastYear: 6.8 },
];

export const MEDALLIA_FY25_TOP_PARKS: Array<{ property: string; market: Market; nps: number }> = [
  { property: 'Terhills Resort', market: 'BENL', nps: 57.4 },
  { property: 'Les Landes de Gascogne', market: 'FR', nps: 48.5 },
  { property: 'Park Hochsauerland', market: 'DE', nps: 35.6 },
  { property: 'Het Meerdal', market: 'NL', nps: 31.7 },
];

export const MEDALLIA_FY25_BIGGEST_IMPROVERS: Array<{ property: string; market: Market; deltaVsLastYear: number }> = [
  { property: 'Park Bostalsee', market: 'DE', deltaVsLastYear: 11.7 },
  { property: 'Bispinger Heide', market: 'DE', deltaVsLastYear: 10.2 },
  { property: 'Le Bois aux Daims', market: 'FR', deltaVsLastYear: 10.7 },
  { property: 'Les Bois-Francs', market: 'FR', deltaVsLastYear: 10.3 },
  { property: 'Parc Sandur', market: 'NL', deltaVsLastYear: 9.6 },
  { property: 'Limburgse Peel', market: 'NL', deltaVsLastYear: 9.3 },
  { property: 'Park De Haan', market: 'BENL', deltaVsLastYear: 8.6 },
  { property: 'Les Ardennes', market: 'BEFR', deltaVsLastYear: 5.4 },
];

export const MEDALLIA_FY25_MARKET_FOCUS: Record<Market, string> = {
  DK: 'Trialist and ReActivated guests, 3-4 and 12-17 yo, French and Dutch origin, quality/diversity of leisure and catering, cottage temperature, summer bugs.',
  BENL: 'Trialist and ReActivated guests, 0-2 and 12-17 yo, French/Swiss/Dutch origin, VIP cottages, cottage cleanliness, Les Ardennes and Parc De Haan.',
  BEFR: 'Trialist and ReActivated guests, 0-2 and 12-17 yo, French/Swiss/Dutch origin, VIP cottages, cottage cleanliness, Les Ardennes and Parc De Haan.',
  FR: "June-July, ReActivated guests, teens 12-17 yo, foreign origin, VIP cottages, catering, value for money, Lac d'Ailette and Villages Nature Paris.",
  DE: 'Trialist and ReActivated guests, 0-2 and 12-17 yo, Austrian/Dutch/Swiss/Danish origin, VIP and wellness cottages, cottage cleanliness (Park Allgäu, Bispinger Heide, Nordseeküste).',
  NL: 'Trialist and ReActivated guests, 0-2 and 12-17 yo, Dutch and Swiss origin, VIP and kids cottages, cottage cleanliness and maintenance, Limburgse Peel and Port Zélande.',
};

/**
 * Verbatim excerpts from Ask_Now__Aqua_Mundo_behaviours.pptx (Product
 * Intelligence, 24/07/2026 - EQS mini-questionnaire, 5 countries,
 * >10,500 respondents, Nov 2025-Apr 2026).
 */
export const AQUA_MUNDO_VISIT_FREQUENCY: Array<{
  market: Market | 'Total';
  neverVisited: number;
  onceDuringStay: number;
  onceADay: number;
  severalTimesADay: number;
  n: number;
}> = [
  { market: 'BENL', neverVisited: 10, onceDuringStay: 19, onceADay: 61, severalTimesADay: 10, n: 1842 },
  { market: 'DK', neverVisited: 1, onceDuringStay: 18, onceADay: 68, severalTimesADay: 13, n: 171 },
  { market: 'FR', neverVisited: 3, onceDuringStay: 11, onceADay: 54, severalTimesADay: 33, n: 2584 },
  { market: 'NL', neverVisited: 13, onceDuringStay: 22, onceADay: 58, severalTimesADay: 7, n: 3085 },
  { market: 'DE', neverVisited: 7, onceDuringStay: 22, onceADay: 64, severalTimesADay: 6, n: 2833 },
  { market: 'Total', neverVisited: 8, onceDuringStay: 19, onceADay: 60, severalTimesADay: 14, n: 10515 },
];

export const AQUA_MUNDO_WHAT_GUESTS_LOVE: Array<{ theme: string; pct: number; detail: string }> = [
  { theme: 'Attractions', pct: 48, detail: 'River rapids (Wildwaterbaan), slides, wave pool, children\'s games' },
  { theme: 'Family orientation', pct: 28, detail: "Children's areas, baby equipment, \"for all ages\"" },
  { theme: 'Overall experience', pct: 19, detail: 'Tropical atmosphere, vegetation, cleanliness, immersion / "change of scenery"' },
  { theme: 'Relaxation & wellness', pct: 3, detail: 'Relaxation, jacuzzi, well-being' },
  { theme: 'Security / personnel', pct: 2, detail: 'Numerous lifeguards, vigilance, safety' },
];

export const AQUA_MUNDO_MAIN_IRRITANTS: string[] = [
  'Temperature issues - water and air often too cold, especially for children.',
  'Overcrowding and queues - noise, long queues and lack of seats during peak periods.',
  'Lack of comfort - quiet/relaxation areas insufficient, changing rooms often saturated.',
  'Maintenance and cleanliness - dilapidated or closed equipment, shower/toilet cleanliness sometimes criticized.',
  'Insufficient adult offering - lack of spa/jacuzzi/sauna/hammam and quiet areas for guests without children.',
];

/**
 * Source documents available for download from the After Stay tab.
 * `path` is the full literal path (not just a filename) so it appears
 * verbatim in the built JS - the same convention as the Brand Monitor
 * PDF link on the Brand Monitoring tab.
 */
export const AFTER_STAY_SOURCE_DOCS: Array<{ label: string; path: string }> = [
  { label: 'NPS Program - Full Quality Review FY25 (PPTX)', path: '/docs/CPE_NPS_Program_Full_Quality_review_FY25.pptx' },
  { label: 'Quality Chapter - July 2026 (PPTX)', path: '/docs/CPE_Quality_Chapter_July_26.pptx' },
  { label: 'Aqua Mundo Behaviours (PPTX)', path: '/docs/Ask_Now__Aqua_Mundo_behaviours.pptx' },
];

/**
 * Shared TypeScript types for the Customer Voice Dashboard.
 * Source of truth: docs/DATA_MODEL.md, extended per docs/DATA_MODEL_ADDENDUM.md.
 *
 * Addendum fields (journeyStage, owner_role) are marked optional and never
 * required, so this layer can be rolled back without breaking the
 * validated baseline (see DATA_MODEL_ADDENDUM.md intro).
 */

export type Market = 'FR' | 'NL' | 'DE' | 'BEFR' | 'BENL' | 'DK';

export type Category =
  | 'Reservation / Booking'
  | 'Payment / Price'
  | 'Cottage & Equipment'
  | 'Bug / Technical Error'
  | 'Missing Information'
  | 'Activities & Leisure'
  | 'Customer Service'
  | 'Account / Login'
  | 'Other';

/**
 * Transversal, optional journey-stage filter (DATA_MODEL_ADDENDUM.md §1).
 * If absent on a row, the UI must show "Unknown" - never infer a default.
 */
export type JourneyStage = 'before' | 'during' | 'after';

/** Business role that owns a recommendation (DATA_MODEL_ADDENDUM.md §4). */
export type OwnerRole = 'CRM' | 'Product' | 'Design' | 'Marketing';

export type HotjarRow = {
  id: string;
  date: string;
  country: Market;
  device?: string;
  /** 1-5 scale. null/undefined = unanswered, excluded from calculations. */
  score?: number | null;
  message: string;
  tags?: string[];
  scope: 'Web';
  surveyType?: string;
  sourceUrl?: string | null;
  category?: Category;
  journeyStage?: JourneyStage;
};

export type CRMRow = {
  id: string;
  date: string;
  market: Market;
  campaign?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveText?: string | null;
  negativeText?: string | null;
  device?: string;
  journeyStage?: JourneyStage;
};

/** A single row from a real MyCP XLSX export (docs/DATA_MODEL.md). */
export type MyCpRow = {
  id: string;
  date: string;
  market: Market;
  /** 0-10 scale. 0 is a valid detractor score, never dropped. */
  score: number;
  sorryVerbatim?: string;
  improveVerbatim?: string;
  optimizeVerbatim?: string;
  source: 'MyCP';
  journeyStage?: JourneyStage;
};

/**
 * A single row from a real Medallia XLSX export - the after-stay survey
 * (docs/DATA_MODEL_ADDENDUM.md §3). Deliberately its own type, never
 * merged with MyCpRow: different population and collection timing
 * (non-merge rule).
 */
export type MedalliaRow = {
  id: string;
  date: string;
  market: Market;
  /** 0-10 scale, same convention as MyCP, but never combined with MyCP's NPS/average. */
  score: number;
  returnIntent?: 'yes' | 'no' | 'unsure';
  comment?: string;
  source: 'Medallia';
};

/**
 * A single market/year row from a real Brand Monitor XLSX export. Brand
 * image / CP image attributes are open-ended score maps (attribute label
 * -> score) since the exact attribute list is confirmed against the real
 * export's headers, not hardcoded here (see constants/brandMonitoring.ts
 * for the reference attribute lists used for column matching).
 */
export type BrandMonitoringRow = {
  id: string;
  market: Market;
  year: number;
  brand: string;
  awarenessTotal?: number;
  awarenessSpontaneous?: number;
  awarenessAided?: number;
  awarenessTopOfMind?: number;
  consideration?: number;
  preference?: number;
  shortList?: number;
  user?: number;
  repeater?: number;
  loyal?: number;
  /** Attribute label -> score (%). Only attributes present in the source file are included. */
  brandImage: Record<string, number>;
  /** Perception statement -> score (%). Only statements present in the source file are included. */
  cpImage: Record<string, number>;
  source: 'BrandMonitoring';
};

export type MyCpMarketStats = {
  responses: number;
  average: number;
  nps: number;
};

export type MyCpBaseline = {
  global: MyCpMarketStats;
  markets: Record<Market, MyCpMarketStats>;
};

export type ThemeTrend = 'up' | 'down' | 'flat' | 'Unknown';

export type ThemeEntry = {
  theme: string;
  /** null when the market's themes are still "To verify" - never render as zero. */
  mentions: number | null;
  trend: ThemeTrend;
};

export type Recommendation = {
  priority: number;
  title: string;
  owner_role: OwnerRole;
  impacted_stage?: JourneyStage;
  evidence: string;
};

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

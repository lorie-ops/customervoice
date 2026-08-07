import hotjarFixture from '../data/hotjar_fixture.json';
import crmFixture from '../data/crm_fixture.json';
import themeAnalysisFixture from '../data/theme_analysis_fixture.json';
import recommendationsFixture from '../data/recommendations_fixture.json';
import themeEnrichmentFixture from '../data/theme_enrichment_fixture.json';
import mycpPdBreakdownFixture from '../data/mycp_pd_breakdown_fixture.json';
import journeyTouchpointsFixture from '../data/journey_touchpoints_fixture.json';
import crmActionPlanFixture from '../data/crm_action_plan_fixture.json';
import type { CRMRow, HotjarRow, Recommendation, ThemeEntry } from '../types';

/**
 * Local fixture data (Phase 1, CLAUDE.md "Start with local fixtures").
 * All fixtures are synthetic except where explicitly noted - see each
 * fixture file's own "note" field. MyCP is intentionally not loaded from
 * a fixture here; it uses the validated static baseline (lib/mycpBaseline.ts).
 */

export const hotjarRows = hotjarFixture.rows as HotjarRow[];
export const crmRows = crmFixture.rows as CRMRow[];

export const themeAnalysisByMarket = themeAnalysisFixture.byMarket as Record<string, ThemeEntry[]>;

export const recommendations = recommendationsFixture.recommendations as Recommendation[];

/**
 * SYNTHETIC illustrative layers, clearly marked in their own fixture
 * files (see each file's "note" field) - never presented as validated
 * data. See lib/mycpBaseline.ts and DATA_MODEL.md for what IS validated.
 */
export type ThemeEnrichment = {
  marketImpactPct: number;
  csatImpact: 'Low' | 'Medium' | 'High';
  confidence: 'Low' | 'Medium' | 'High';
  exampleVerbatim: string;
};
export const themeEnrichmentByMarket = themeEnrichmentFixture.byMarket as Record<
  string,
  Record<string, ThemeEnrichment>
>;

export type PdBreakdown = { promoterPct: number; passivePct: number; detractorPct: number };
export const mycpPdBreakdownByMarket = mycpPdBreakdownFixture.byMarket as Record<string, PdBreakdown>;

export type JourneyTouchpoint = { touchpoint: string; objective: string; sources: string[] };
export const journeyTouchpointsByStage = journeyTouchpointsFixture.byStage as Record<string, JourneyTouchpoint[]>;

export type CrmActionItem = { priority: 'P1' | 'P2'; title: string; detail: string };
export const crmActionPlanItems = crmActionPlanFixture.items as CrmActionItem[];

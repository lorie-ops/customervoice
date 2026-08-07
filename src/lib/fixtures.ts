import hotjarFixture from '../data/hotjar_fixture.json';
import crmFixture from '../data/crm_fixture.json';
import themeAnalysisFixture from '../data/theme_analysis_fixture.json';
import recommendationsFixture from '../data/recommendations_fixture.json';
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

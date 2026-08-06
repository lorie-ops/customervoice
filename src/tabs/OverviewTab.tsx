import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';

/**
 * Overview tab - owned by the Marketing project lead (cross-tab reporting
 * view for leadership). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function OverviewTab() {
  return (
    <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
      <TabHeader tabId="overview" />

      <SectionPlaceholder
        title="Last Month Trends"
        description="Rolling trend line across Hotjar Web, MyCP and CRM signals for the most recent month. Wired to fixtures in Phase 2."
      />

      <SectionPlaceholder
        title="KPI Cards - Web, MyCP, CRM, Post-stay"
        description="One KPI card per source. MyCP will use the validated static April 2026 baseline, never a fixture-derived number."
      />

      <SectionPlaceholder
        title="Global Filters"
        description="Source, Market, Scope, Survey filters that apply across the whole tab."
      />

      <SectionPlaceholder
        title="Period A / Period B Filters"
        description="Start/end date pickers for both comparison periods, plus 7d / 30d / 90d / vs LY presets."
      />

      <SectionPlaceholder
        title="Theme Distribution - Period A vs B"
        description="Chart comparing theme mentions between the two selected periods, from theme_analysis_fixture.json."
      >
        <InfoNote>
          DE / FR / NL are the validated theme sets. BEFR / BENL / DK are marked "To verify" in
          the fixture and will render as an explicit unknown state, never as zero.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Top 3 Categories - Verbatim Summary"
        description="Top three verbatim categories with a short summary, derived from Hotjar and CRM fixtures."
      />

      <SectionPlaceholder
        title="Frustration Focus - Top 3 Pain Points"
        description="The three most frequent negative themes across sources for the selected period."
      />

      <SectionPlaceholder
        title="Key Movements - Period A to B"
        description="Notable increases or decreases in volume, sentiment, or score between Period A and Period B."
      />

      <SectionPlaceholder
        title="Top 5 Recommendations"
        description="From recommendations_fixture.json, each recommendation tagged with its owner_role (CRM, Product, Marketing, Design) per docs/DATA_MODEL_ADDENDUM.md §4 and docs/OWNERSHIP_MATRIX.md."
      >
        <InfoNote>
          Future candidate source: Medallia (21,707 responses, April 2026 export) may eventually
          appear here as an explicitly-labeled, separate metric (e.g. "NPS - Medallia") - pending
          Marketing sign-off. It will never be merged with the MyCP NPS shown on the CSAT tab
          (docs/DATA_MODEL_ADDENDUM.md §3).
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

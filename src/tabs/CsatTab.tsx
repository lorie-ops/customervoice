import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';

/**
 * CSAT tab - owned by Marketing / Customer insight lead (monthly
 * satisfaction reporting). Section order follows docs/PROJECT_SPEC.md §2.
 * Default scope is MyCP only (CLAUDE.md, PROJECT_SPEC.md).
 */
export function CsatTab() {
  return (
    <div role="tabpanel" id="tabpanel-csat" aria-labelledby="tab-csat">
      <TabHeader tabId="csat" />

      <SectionPlaceholder
        title="Filters"
        description="Start/end date (30d/60d/90d presets), market, and scope (MyCP only / Web only / Web + MyCP). Default scope: MyCP only."
        tag="Default: MyCP"
      />

      <SectionPlaceholder
        title="Global CSAT Scores"
        description="Validated static MyCP baseline (April 2026): 1,124 responses, average 8.7/10, NPS +60. Displayed immediately, not derived from a fixture (CLAUDE.md / DATA_MODEL.md)."
      >
        <InfoNote>
          Some values shown in the old CSAT screenshot are not this validated baseline - the
          historical screenshot is a layout reference only (docs/PROJECT_SPEC.md §5).
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="MyCP NPS by Country"
        description="Per-market NPS from the validated baseline: DK +38.9, BEFR +67.9, BENL +57.1, NL +62.9, FR +61.1, DE +57.6."
      />

      <SectionPlaceholder
        title="Theme Analysis - Summary"
        description="Validated theme sets for DE, FR, NL from DATA_MODEL.md."
      >
        <InfoNote tone="warning">
          BEFR, BENL and DK are marked "To verify" in theme_analysis_fixture.json - rendered as an
          explicit unknown state, never as zero or an invented number.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Deep Dive"
        description="Drill-down into a single theme's mentions and trend, used by Product to cross-check satisfaction against friction points."
      />

      <SectionPlaceholder
        title="Monthly Report - Slide Format"
        description="Exportable slide-style summary for committee reporting, owned by Marketing."
      >
        <InfoNote>
          Medallia (real aggregated data, 21,707 responses, April 2026 export) is a separate
          post-stay survey - different population and collection timing than MyCP. Per the
          non-merge rule (docs/DATA_MODEL_ADDENDUM.md §3), it is never combined with the MyCP NPS
          shown above and, if surfaced later, will always be labeled explicitly (e.g.
          "NPS - Medallia" vs "NPS - MyCP"). Not used yet in this phase.
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';

/**
 * Verbatims tab - cross-team investigation tool, no single owner
 * (docs/OWNERSHIP_MATRIX.md). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function VerbatimsTab() {
  return (
    <div role="tabpanel" id="tabpanel-verbatims" aria-labelledby="tab-verbatims">
      <TabHeader tabId="verbatims" />

      <SectionPlaceholder
        title="Hotjar Raw Verbatims"
        description="Row-level table from hotjar_fixture.json (message, score, market, category, journeyStage when present)."
      />

      <SectionPlaceholder
        title="CRM Verbatims"
        description="Row-level table from crm_fixture.json (positiveText / negativeText, sentiment, market, campaign, journeyStage when present)."
      />

      <SectionPlaceholder
        title="Search, Source, Market, Sentiment, Date Filters"
        description="Free-text search plus Source (Hotjar/CRM), Market, Sentiment, and Date filters, shared across both tables above."
      />
    </div>
  );
}

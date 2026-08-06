import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';

/**
 * CRM tab - owned by the CRM project lead (daily/weekly operational pulse
 * and Action Plan). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function CrmTab() {
  return (
    <div role="tabpanel" id="tabpanel-crm" aria-labelledby="tab-crm">
      <TabHeader tabId="crm" />

      <SectionPlaceholder
        title="Global Overview - Last 7 Days"
        description="Rolling 7-day summary of CRM volume and sentiment split."
      />

      <SectionPlaceholder
        title="KPI Cards - Total Responses, Positive Rate, Negative Rate"
        description="Computed from crm_fixture.json sentiment field once wired in Phase 4."
      />

      <SectionPlaceholder
        title="Positive vs Negative Rate - Last 30 Days by Week"
        description="Weekly breakdown chart of the positive/negative rate over the last 30 days."
      />

      <SectionPlaceholder
        title="Filtered View"
        description="Table and charts below react to the filters selected here."
      />

      <SectionPlaceholder
        title="Filters"
        description="Date range (with 7d / 30d / 90d presets), market, and campaign filters. Optional journeyStage (before/during/after) filter per docs/DATA_MODEL_ADDENDUM.md §1 - shows 'Unknown' when absent, never a default guess."
      />

      <SectionPlaceholder
        title="Market Health Snapshot"
        description="Per-market view of CRM sentiment, used by the CRM lead to arbitrate priorities."
      />

      <SectionPlaceholder
        title="Positive Signals"
        description="Positive verbatims (positiveText) surfaced from the current filter."
      />

      <SectionPlaceholder
        title="Negative Signals"
        description="Negative verbatims (negativeText) surfaced from the current filter."
      />

      <SectionPlaceholder
        title="Root Cause"
        description="Grouping of negative signals by underlying cause, feeding the Action Plan below."
      />

      <SectionPlaceholder
        title="Action Plan - P1 / P2"
        description="CRM-lead-maintained action list. Owner: CRM project lead (docs/OWNERSHIP_MATRIX.md)."
      />
    </div>
  );
}

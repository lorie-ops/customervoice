import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { crmRows, hotjarRows, recommendations } from '../lib/fixtures';
import { calculateCrmRates, calculateHotjarAverage } from '../lib/calculations';
import { formatNps, formatPercent } from '../lib/format';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';

/**
 * Overview tab - owned by the Marketing project lead (cross-tab reporting
 * view for leadership). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function OverviewTab() {
  const webAverage = calculateHotjarAverage(hotjarRows.map((row) => row.score));
  const scoredHotjarCount = hotjarRows.filter((row) => row.score !== null && row.score !== undefined).length;
  const crmRates = calculateCrmRates(crmRows);
  const mycp = MYCP_BASELINE_APRIL_2026.global;

  return (
    <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
      <TabHeader tabId="overview" />

      <SectionPlaceholder
        title="Last Month Trends"
        description="Rolling trend line across Hotjar Web, MyCP and CRM signals for the most recent month. Wired to fixtures in Phase 2 (chart)."
      />

      <SectionPlaceholder
        title="KPI Cards - Web, MyCP, CRM, Post-stay"
        description="One KPI card per source. MyCP uses the validated static April 2026 baseline, never a fixture-derived number."
      >
        <div className="kpi-grid">
          <KpiCard
            label="Web (Hotjar)"
            value={webAverage !== null ? webAverage.toFixed(1) : null}
            unit=" / 5"
            tone="blue"
            footnote={`${scoredHotjarCount} of ${hotjarRows.length} fixture rows scored (unanswered excluded)`}
          />
          <KpiCard
            label="MyCP"
            value={mycp.average.toFixed(1)}
            unit=" / 10"
            tone="purple"
            footnote={`NPS ${formatNps(mycp.nps)} · ${mycp.responses} responses (validated April 2026 baseline)`}
          />
          <KpiCard
            label="CRM"
            value={crmRates.total}
            unit=" responses"
            tone="neutral"
            footnote={`${formatPercent(crmRates.positiveRate)} positive · ${formatPercent(crmRates.negativeRate)} negative (fixture)`}
          />
          <KpiCard
            label="Post-stay"
            value={null}
            tone="neutral"
            emptyMessage="Non applicable"
            footnote="No post-stay source is wired in yet. Medallia is a future candidate source and will never be merged with MyCP (DATA_MODEL_ADDENDUM.md §3)."
          />
        </div>
      </SectionPlaceholder>

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
        <ol className="recommendation-list">
          {recommendations
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((rec) => (
              <li key={rec.priority} className="recommendation-card">
                <div className="recommendation-card__header">
                  <span className="recommendation-card__priority">P{rec.priority}</span>
                  <span className={`owner-tag owner-tag--${rec.owner_role.toLowerCase()}`}>{rec.owner_role}</span>
                  {rec.impacted_stage ? (
                    <span className="stage-tag">{rec.impacted_stage}</span>
                  ) : null}
                </div>
                <p className="recommendation-card__title">{rec.title}</p>
                <p className="recommendation-card__evidence">{rec.evidence}</p>
              </li>
            ))}
        </ol>
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

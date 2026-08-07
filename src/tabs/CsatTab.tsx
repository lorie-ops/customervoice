import { useState } from 'react';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { hotjarRows } from '../lib/fixtures';
import { calculateHotjarAverage } from '../lib/calculations';
import { formatNps, formatNumber } from '../lib/format';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import type { Market } from '../types';

type Scope = 'mycp' | 'web' | 'both';
type MarketFilter = 'all' | Market;

/**
 * CSAT tab - owned by Marketing / Customer insight lead (monthly
 * satisfaction reporting). Section order follows docs/PROJECT_SPEC.md §2.
 * Default scope is MyCP only (CLAUDE.md, PROJECT_SPEC.md).
 */
export function CsatTab() {
  const [scope, setScope] = useState<Scope>('mycp');
  const [market, setMarket] = useState<MarketFilter>('all');

  const mycpStats = market === 'all' ? MYCP_BASELINE_APRIL_2026.global : MYCP_BASELINE_APRIL_2026.markets[market];
  const webScores = hotjarRows
    .filter((row) => market === 'all' || row.country === market)
    .map((row) => row.score);
  const webAverage = calculateHotjarAverage(webScores);
  const webScoredCount = webScores.filter((score) => score !== null && score !== undefined).length;

  const marketRows = MARKETS.filter((m) => market === 'all' || m === market).map((m) => ({
    market: m,
    ...MYCP_BASELINE_APRIL_2026.markets[m],
  }));

  return (
    <div role="tabpanel" id="tabpanel-csat" aria-labelledby="tab-csat">
      <TabHeader tabId="csat" />

      <SectionPlaceholder
        title="Filters"
        description="Scope (MyCP only / Web only / Web + MyCP) and market. Default scope: MyCP only."
        tag="Default: MyCP"
      >
        <FilterBar>
          <FilterField label="Scope">
            <select value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
              <option value="mycp">MyCP only</option>
              <option value="web">Web only</option>
              <option value="both">Web + MyCP</option>
            </select>
          </FilterField>
          <FilterField label="Market">
            <select value={market} onChange={(event) => setMarket(event.target.value as MarketFilter)}>
              <option value="all">All markets</option>
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {MARKET_LABELS[m]}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterBar>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Global CSAT Scores"
        description="Validated static MyCP baseline (April 2026), displayed immediately - never derived from a fixture (CLAUDE.md / DATA_MODEL.md)."
      >
        <div className="kpi-grid">
          {(scope === 'mycp' || scope === 'both') && (
            <>
              <KpiCard
                label="MyCP Average"
                value={mycpStats.average.toFixed(1)}
                unit=" / 10"
                tone="purple"
                footnote={`${formatNumber(mycpStats.responses)} responses`}
              />
              <KpiCard label="MyCP NPS" value={formatNps(mycpStats.nps)} tone="purple" />
            </>
          )}
          {(scope === 'web' || scope === 'both') && (
            <>
              <KpiCard
                label="Web (Hotjar) Average"
                value={webAverage !== null ? webAverage.toFixed(1) : null}
                unit=" / 5"
                tone="blue"
                footnote={`${webScoredCount} scored responses (fixture, unanswered excluded)`}
              />
              <KpiCard
                label="Web (Hotjar) NPS"
                value={null}
                tone="blue"
                emptyMessage="Non applicable"
                footnote="NPS is not defined for the 1-5 Hotjar scale in this data model - never mixed with the MyCP NPS above."
              />
            </>
          )}
        </div>
        <InfoNote>
          Some values shown in the old CSAT screenshot are not this validated baseline - the
          historical screenshot is a layout reference only (docs/PROJECT_SPEC.md §5).
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="MyCP NPS by Country"
        description="Per-market NPS from the validated April 2026 baseline."
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Responses</th>
                <th>Average</th>
                <th>NPS</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => (
                <tr key={row.market}>
                  <td>{MARKET_LABELS[row.market]}</td>
                  <td>{formatNumber(row.responses)}</td>
                  <td>{row.average.toFixed(1)} / 10</td>
                  <td>{formatNps(row.nps)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Analysis - Summary"
        description="Validated theme sets for DE, FR, NL from DATA_MODEL.md."
      >
        <InfoNote tone="warning">
          BEFR, BENL and DK are marked "To verify" in theme_analysis_fixture.json - rendered as an
          explicit unknown state, never as zero or an invented number. Chart wired in Phase 3.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Deep Dive"
        description="Drill-down into a single theme's mentions and trend, used by Product to cross-check satisfaction against friction points. Wired in Phase 3."
      />

      <SectionPlaceholder
        title="Monthly Report - Slide Format"
        description="Exportable slide-style summary for committee reporting, owned by Marketing. Wired in Phase 3."
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

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { mycpPdBreakdownByMarket, themeAnalysisByMarket, themeEnrichmentByMarket } from '../lib/fixtures';
import { useDashboardData } from '../state/DataContext';
import { formatNps, formatNumber } from '../lib/format';
import { MYCP_APRIL_2025_NPS_COMPARISON, MYCP_NPS_TARGET_OKR_EXAMPLE } from '../lib/mycpBaseline';
import type { Market } from '../types';

type MarketFilter = 'all' | Market;

const THEME_MARKETS: Market[] = ['DE', 'FR', 'NL'];

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;

/**
 * MyCP tab - owned by Marketing / Customer insight lead (monthly
 * satisfaction reporting). Pure MyCP content only - Web/Hotjar content
 * moved to its own tab (business feedback). Section order follows
 * docs/PROJECT_SPEC.md §2.
 */
export function MyCpTab() {
  const { mycpBaseline, mycpSource } = useDashboardData();
  const [market, setMarket] = useState<MarketFilter>('all');
  const [themeMarket, setThemeMarket] = useState<Market>('DE');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const mycpStats = market === 'all' ? mycpBaseline.global : mycpBaseline.markets[market];

  const marketRows = MARKETS.filter((m) => market === 'all' || m === market).map((m) => ({
    market: m,
    ...mycpBaseline.markets[m],
  }));

  const distributionData = MARKETS.map((m) => ({
    marketLabel: MARKET_LABELS[m],
    ...mycpPdBreakdownByMarket[m],
  }));

  const themeRows = (themeAnalysisByMarket[themeMarket] ?? []).map((entry) => {
    const totalMentionsForMarket = (themeAnalysisByMarket[themeMarket] ?? []).reduce(
      (sum, t) => sum + (t.mentions ?? 0),
      0,
    );
    const enrichment = themeEnrichmentByMarket[themeMarket]?.[entry.theme];
    return {
      ...entry,
      pctOfMentions: entry.mentions !== null && totalMentionsForMarket > 0 ? (entry.mentions / totalMentionsForMarket) * 100 : null,
      enrichment,
    };
  });
  const deepDiveTheme = themeRows.find((t) => t.theme === selectedTheme) ?? null;

  return (
    <div role="tabpanel" id="tabpanel-mycp" aria-labelledby="tab-mycp">
      <TabHeader tabId="mycp" />

      <SectionPlaceholder title="Filters" description="Market filter, applied to every section below.">
        <FilterBar>
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
        title="Global MyCP Scores"
        description={
          mycpSource === 'upload'
            ? 'Live MyCP data - all six market files loaded and coherent (docs/BACKLOG.md Phase 6).'
            : 'Validated static MyCP baseline (April 2026), displayed immediately - never derived from a fixture (CLAUDE.md / DATA_MODEL.md).'
        }
      >
        <div className="kpi-grid">
          <KpiCard
            label="MyCP Average"
            value={mycpStats.average.toFixed(1)}
            unit=" / 10"
            tone="purple"
            footnote={`${formatNumber(mycpStats.responses)} responses`}
          />
          <KpiCard label="MyCP NPS" value={formatNps(mycpStats.nps)} tone="purple" />
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
        title="Promoters / Passives / Detractors Distribution"
        description="One plausible split per market that reproduces the validated NPS exactly - not an individually validated breakdown."
      >
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={distributionData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
              <YAxis type="category" dataKey="marketLabel" width={110} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promoterPct" name="Promoters (9-10)" stackId="a" fill="var(--cv-green)" />
              <Bar dataKey="passivePct" name="Passives (7-8)" stackId="a" fill="var(--cv-border)" />
              <Bar dataKey="detractorPct" name="Detractors (0-6)" stackId="a" fill="var(--cv-red)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <InfoNote tone="warning">
          Illustrative breakdown (mycp_pd_breakdown_fixture.json) - only responses, average, and
          NPS are validated per market. Do not present these percentages as validated data.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Analysis - Summary"
        description="Validated theme sets for DE, FR, NL from DATA_MODEL.md. Market impact/confidence columns are illustrative additions."
      >
        <FilterBar>
          <FilterField label="Market">
            <select value={themeMarket} onChange={(event) => { setThemeMarket(event.target.value as Market); setSelectedTheme(null); }}>
              {THEME_MARKETS.map((m) => (
                <option key={m} value={m}>
                  {MARKET_LABELS[m]}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterBar>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Theme</th>
                <th>Mentions</th>
                <th>% of market mentions</th>
                <th>Trend</th>
                <th>Market impact</th>
                <th>CSAT impact</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {themeRows.map((row) => {
                const TrendIcon = row.trend !== 'Unknown' ? TREND_ICON[row.trend as 'up' | 'down' | 'flat'] : Minus;
                return (
                  <tr
                    key={row.theme}
                    onClick={() => setSelectedTheme(row.theme)}
                    className={selectedTheme === row.theme ? 'data-table__row--selected' : undefined}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.theme}</td>
                    <td>{formatNumber(row.mentions)}</td>
                    <td>{row.pctOfMentions !== null ? `${row.pctOfMentions.toFixed(0)}%` : 'Non applicable'}</td>
                    <td>
                      <TrendIcon size={14} aria-hidden="true" />
                    </td>
                    <td>{row.enrichment ? `${row.enrichment.marketImpactPct.toFixed(1)} pts` : 'Non applicable'}</td>
                    <td>
                      {row.enrichment ? (
                        <span className={`impact-tag impact-tag--${row.enrichment.csatImpact.toLowerCase()}`}>
                          {row.enrichment.csatImpact}
                        </span>
                      ) : (
                        'Non applicable'
                      )}
                    </td>
                    <td>
                      {row.enrichment ? (
                        <span className={`impact-tag impact-tag--${row.enrichment.confidence.toLowerCase()}`}>
                          {row.enrichment.confidence}
                        </span>
                      ) : (
                        'Non applicable'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="filter-note">Click a row to open its Theme Deep Dive below.</p>
        <InfoNote tone="warning">
          BEFR, BENL and DK are marked "To verify" in theme_analysis_fixture.json - not shown in
          this table, rendered as an explicit unknown state elsewhere, never as zero.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Deep Dive"
        description="Drill-down into a single theme's mentions and trend, used by Product to cross-check satisfaction against friction points."
      >
        {deepDiveTheme ? (
          <div className="topic-card">
            <div className="topic-card__header">
              <p className="topic-card__title">
                {deepDiveTheme.theme} - {MARKET_LABELS[themeMarket]}
              </p>
              <span className="count-badge count-badge--orange">{formatNumber(deepDiveTheme.mentions)} mentions</span>
            </div>
            <p className="topic-card__quote">
              {deepDiveTheme.enrichment ? `"${deepDiveTheme.enrichment.exampleVerbatim}"` : 'Non applicable'}
            </p>
            {deepDiveTheme.enrichment ? (
              <p className="filter-note">
                Market impact {deepDiveTheme.enrichment.marketImpactPct.toFixed(1)} pts · CSAT impact{' '}
                {deepDiveTheme.enrichment.csatImpact} · Confidence {deepDiveTheme.enrichment.confidence}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="filter-note">Select a theme in the table above to see its deep dive.</p>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Monthly Report - Slide Format"
        description="Exportable slide-style summary for committee reporting, owned by Marketing."
      >
        <div className="report-slide">
          <div className="report-slide__header">
            <span>MyCP · {mycpSource === 'upload' ? 'Live upload' : 'April 2026'}</span>
            <span>Target OKR (example, to confirm): {formatNps(MYCP_NPS_TARGET_OKR_EXAMPLE)}</span>
          </div>
          <div className="report-slide__body">
            <div>
              <p className="report-slide__nps">{formatNps(mycpBaseline.global.nps)}</p>
              <p className="filter-note">Average score: {mycpBaseline.global.average.toFixed(1)}/10</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>NPS</th>
                  <th>vs April 2025</th>
                  <th>Average</th>
                  <th>Responses</th>
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((m) => {
                  const stats = mycpBaseline.markets[m];
                  const prevYear = MYCP_APRIL_2025_NPS_COMPARISON[m];
                  const delta = prevYear !== undefined ? stats.nps - prevYear : null;
                  return (
                    <tr key={m}>
                      <td>{MARKET_LABELS[m]}</td>
                      <td>{formatNps(stats.nps)}</td>
                      <td>{delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} pts` : 'Non applicable'}</td>
                      <td>{stats.average.toFixed(1)} / 10</td>
                      <td>{formatNumber(stats.responses)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <InfoNote>
          Medallia (after-stay survey) is a separate source with a different population and
          collection timing than MyCP. Per the non-merge rule (docs/DATA_MODEL_ADDENDUM.md §3),
          it is never combined with the MyCP NPS shown above - see the Data Sources panel above
          and, once connected, its own reporting will always be labeled explicitly (e.g.
          "NPS - Medallia" vs "NPS - MyCP").
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

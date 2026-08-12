import { useState } from 'react';
import { FileDown, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import {
  AFTER_STAY_SOURCE_DOCS,
  AQUA_MUNDO_MAIN_IRRITANTS,
  AQUA_MUNDO_VISIT_FREQUENCY,
  AQUA_MUNDO_WHAT_GUESTS_LOVE,
  MEDALLIA_FY25_BIGGEST_IMPROVERS,
  MEDALLIA_FY25_COUNTRY_RANKING,
  MEDALLIA_FY25_EXECUTIVE_SUMMARY,
  MEDALLIA_FY25_MARKET_FOCUS,
  MEDALLIA_FY25_TOP_PARKS,
} from '../lib/medalliaExtraction';
import { useDashboardData } from '../state/DataContext';
import { formatNps, formatNumber, formatPercent } from '../lib/format';
import type { Market } from '../types';

type MarketFilter = 'all' | Market;

/**
 * After Stay tab - Medallia post-stay survey. Owner assumption: Product
 * Manager (scope), pending confirmation (see constants/ownership.ts).
 * Section order mirrors the MyCP/Web tabs. Global scores, per-market
 * table and category breakdown come from a validated static extraction
 * of a real Medallia EQS export (lib/medalliaExtraction.ts) - displayed
 * immediately, replaced only by a real upload. Key Insights and Aqua
 * Mundo Behaviours are verbatim excerpts from separate internal review
 * decks (different reporting periods, kept clearly labeled rather than
 * blended into the extraction's own numbers). Never merged with MyCP
 * (non-merge rule, docs/DATA_MODEL_ADDENDUM.md §3).
 */
export function AfterStayTab() {
  const { medalliaBaseline, medalliaSource } = useDashboardData();
  const [market, setMarket] = useState<MarketFilter>('all');

  const stats = market === 'all' ? medalliaBaseline.global : medalliaBaseline.markets[market];
  const categories = market === 'all' ? medalliaBaseline.categoriesGlobal : medalliaBaseline.categoriesByMarket[market];

  const marketRows = MARKETS.filter((m) => market === 'all' || m === market).map((m) => ({
    market: m,
    ...medalliaBaseline.markets[m],
  }));

  const categoryChartData = MARKETS.filter((m) => market === 'all' || m === market).map((m) => ({
    marketLabel: MARKET_LABELS[m],
    ...medalliaBaseline.categoriesByMarket[m],
  }));

  const returnIntentChartData = MARKETS.filter((m) => market === 'all' || m === market).map((m) => {
    const ri = medalliaBaseline.markets[m].returnIntent;
    return { marketLabel: MARKET_LABELS[m], Yes: ri.yes, Probably: ri.probably, 'Probably not': ri.probablyNot, No: ri.no };
  });

  const aquaMundoRows = market === 'all' ? AQUA_MUNDO_VISIT_FREQUENCY : AQUA_MUNDO_VISIT_FREQUENCY.filter((r) => r.market === market);

  return (
    <div role="tabpanel" id="tabpanel-after-stay" aria-labelledby="tab-after-stay">
      <TabHeader tabId="after-stay" />

      <InfoNote tone="warning">
        Global scores, the per-market table and the category breakdown are a validated static
        extraction from a real Medallia EQS export (20,894 Center Parcs responses, 2 Apr - 12 May
        2026 - the same file referenced elsewhere in this app as "medallia_aggregated.json").
        Key Insights and Aqua Mundo Behaviours below are verbatim excerpts from separate internal
        review decks covering different periods (FY25 annual review; Nov 2025-Apr 2026 for Aqua
        Mundo) - kept clearly labeled rather than blended into the extraction's own numbers. Never
        merged with MyCP (docs/DATA_MODEL_ADDENDUM.md §3).
        <br />
        {AFTER_STAY_SOURCE_DOCS.map((doc) => (
          <a key={doc.file} className="doc-download-link" href={`/docs/${doc.file}`} download style={{ marginRight: 8 }}>
            <FileDown size={14} aria-hidden="true" /> {doc.label}
          </a>
        ))}
      </InfoNote>

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
        title="Global After Stay Scores"
        description={`Center Parcs, ${market === 'all' ? 'all markets' : MARKET_LABELS[market]} - ${
          medalliaSource === 'upload' ? 'live upload' : 'validated static extraction from a real EQS export'
        }.`}
      >
        <div className="kpi-grid">
          <KpiCard
            label="Average Score (recommendation)"
            value={stats.average.toFixed(1)}
            unit=" / 10"
            tone="purple"
            footnote={`${formatNumber(stats.responses)} responses`}
          />
          <KpiCard label="NPS" value={formatNps(stats.nps)} tone="purple" />
          <KpiCard label="Overall Satisfaction" value={stats.overallSatisfaction.toFixed(1)} unit=" / 10" tone="blue" />
          <KpiCard
            label="Return Intent (Yes + Probably)"
            value={(stats.returnIntent.yes + stats.returnIntent.probably).toFixed(1)}
            unit="%"
            tone="green"
          />
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder title="After Stay Score by Country" description="Per-market average, NPS and return intent.">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Responses</th>
                <th>Average</th>
                <th>NPS</th>
                <th>Return intent (Yes+Probably)</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => (
                <tr key={row.market}>
                  <td>{MARKET_LABELS[row.market]}</td>
                  <td>{formatNumber(row.responses)}</td>
                  <td>{row.average.toFixed(1)} / 10</td>
                  <td>{formatNps(row.nps)}</td>
                  <td>{formatPercent(row.returnIntent.yes + row.returnIntent.probably)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Category Breakdown"
        description="Average score (0-10) per experience category: Check-in, Village, Cottage (comfort), Aqua Mundo, Catering."
      >
        <div className="kpi-grid">
          <KpiCard label="Check-in" value={categories.checkin.toFixed(1)} unit=" / 10" tone="blue" />
          <KpiCard label="Village" value={categories.village.toFixed(1)} unit=" / 10" tone="blue" />
          <KpiCard label="Cottage (comfort)" value={categories.cottage.toFixed(1)} unit=" / 10" tone="orange" />
          <KpiCard label="Aqua Mundo" value={categories.aquamundo.toFixed(1)} unit=" / 10" tone="green" />
          <KpiCard label="Catering" value={categories.catering.toFixed(1)} unit=" / 10" tone="orange" />
        </div>
        {market === 'all' && (
          <div style={{ width: '100%', height: 260, marginTop: 16 }}>
            <ResponsiveContainer>
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                <XAxis type="number" domain={[0, 10]} fontSize={12} />
                <YAxis type="category" dataKey="marketLabel" width={110} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkin" name="Check-in" fill="var(--cv-blue)" />
                <Bar dataKey="village" name="Village" fill="var(--cv-navy)" />
                <Bar dataKey="cottage" name="Cottage" fill="var(--cv-orange)" />
                <Bar dataKey="aquamundo" name="Aqua Mundo" fill="var(--cv-green)" />
                <Bar dataKey="catering" name="Catering" fill="var(--cv-purple)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder title="Return Intent Distribution" description="Would you return for a short paid holiday? Yes / Probably / Probably not / No.">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={returnIntentChartData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
              <XAxis type="number" domain={[0, 100]} allowDataOverflow unit="%" fontSize={12} />
              <YAxis type="category" dataKey="marketLabel" width={110} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="var(--cv-green)" />
              <Bar dataKey="Probably" stackId="a" fill="var(--cv-green-bg)" />
              <Bar dataKey="Probably not" stackId="a" fill="var(--cv-orange-bg)" />
              <Bar dataKey="No" stackId="a" fill="var(--cv-red)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Key Insights - NPS Program FY25 Annual Review"
        description="Verbatim excerpts from CPE_NPS_Program_Full_Quality_review_FY25.pptx (Product Intelligence, 27/11/2025) - a different, earlier period than the extraction above."
      >
        <ul className="topic-list">
          {MEDALLIA_FY25_EXECUTIVE_SUMMARY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="filter-note" style={{ marginTop: 12, fontWeight: 600 }}>
          Country ranking (FY25 NPS)
        </p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>NPS</th>
                <th>vs last year</th>
              </tr>
            </thead>
            <tbody>
              {MEDALLIA_FY25_COUNTRY_RANKING.map((row) => (
                <tr key={row.market}>
                  <td>{MARKET_LABELS[row.market]}</td>
                  <td>{formatNps(row.nps)}</td>
                  <td>{row.deltaVsLastYear > 0 ? `+${row.deltaVsLastYear.toFixed(1)} pts` : 'Non applicable'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="category-summary-grid" style={{ marginTop: 12 }}>
          <div className="kpi-card">
            <p className="kpi-card__label">Top parks (FY25 NPS)</p>
            <ul className="topic-list">
              {MEDALLIA_FY25_TOP_PARKS.map((p) => (
                <li key={p.property}>
                  {p.property} ({MARKET_LABELS[p.market]}) - {formatNps(p.nps)}
                </li>
              ))}
            </ul>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">Biggest improvers vs last year</p>
            <ul className="topic-list">
              {MEDALLIA_FY25_BIGGEST_IMPROVERS.map((p) => (
                <li key={p.property}>
                  {p.property} ({MARKET_LABELS[p.market]}) - +{p.deltaVsLastYear.toFixed(1)} pts
                </li>
              ))}
            </ul>
          </div>
        </div>

        {market !== 'all' && (
          <p className="filter-note" style={{ marginTop: 12 }}>
            <strong>{MARKET_LABELS[market]} - special attention to continue improvement:</strong>{' '}
            {MEDALLIA_FY25_MARKET_FOCUS[market]}
          </p>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Aqua Mundo Behaviours"
        description="Verbatim excerpts from Ask_Now__Aqua_Mundo_behaviours.pptx (Product Intelligence, 24/07/2026) - 5 countries (BNGFD), >10,500 respondents, Nov 2025-Apr 2026."
      >
        <p className="filter-note">91.8% of guests visit Aqua Mundo at least once during their stay; 81.6% visit in groups.</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Haven't visited</th>
                <th>Once during stay</th>
                <th>Once a day</th>
                <th>Several times a day</th>
                <th>n</th>
              </tr>
            </thead>
            <tbody>
              {aquaMundoRows.map((row) => (
                <tr key={row.market} className={row.market === 'Total' ? 'data-table__row--selected' : undefined}>
                  <td>{row.market === 'Total' ? 'Total' : MARKET_LABELS[row.market]}</td>
                  <td>{formatPercent(row.neverVisited)}</td>
                  <td>{formatPercent(row.onceDuringStay)}</td>
                  <td>{formatPercent(row.onceADay)}</td>
                  <td>{formatPercent(row.severalTimesADay)}</td>
                  <td>{formatNumber(row.n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="category-summary-grid" style={{ marginTop: 12 }}>
          <div className="kpi-card kpi-card--green">
            <p className="kpi-card__label">
              <ThumbsUp size={14} aria-hidden="true" /> What guests love
            </p>
            <ul className="topic-list">
              {AQUA_MUNDO_WHAT_GUESTS_LOVE.map((t) => (
                <li key={t.theme}>
                  <strong>{t.theme} ({t.pct}%)</strong> - {t.detail}
                </li>
              ))}
            </ul>
          </div>
          <div className="kpi-card kpi-card--red">
            <p className="kpi-card__label">
              <ThumbsDown size={14} aria-hidden="true" /> Main irritants
            </p>
            <ul className="topic-list">
              {AQUA_MUNDO_MAIN_IRRITANTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Monthly Report - Slide Format"
        description="Exportable slide-style summary for committee reporting, adapted to the After Stay (Medallia) scope."
      >
        <div className="report-slide">
          <div className="report-slide__header">
            <span>After Stay (Medallia) · post-stay survey</span>
            <span>Scale: 0-10, never merged with MyCP</span>
          </div>
          <div className="report-slide__body">
            <div>
              <p className="report-slide__nps">{formatNps(medalliaBaseline.global.nps)}</p>
              <p className="filter-note">
                Average score: {medalliaBaseline.global.average.toFixed(1)}/10 · Overall satisfaction:{' '}
                {medalliaBaseline.global.overallSatisfaction.toFixed(1)}/10
              </p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>NPS</th>
                  <th>Average</th>
                  <th>Responses</th>
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((m) => {
                  const marketStats = medalliaBaseline.markets[m];
                  return (
                    <tr key={m}>
                      <td>{MARKET_LABELS[m]}</td>
                      <td>{formatNps(marketStats.nps)}</td>
                      <td>{marketStats.average.toFixed(1)} / 10</td>
                      <td>{formatNumber(marketStats.responses)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <InfoNote>
          MyCP is a separate source with a different population and collection timing than this
          after-stay survey. Per the non-merge rule (docs/DATA_MODEL_ADDENDUM.md §3), the NPS
          above is never combined with the MyCP NPS shown on the MyCP tab.
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

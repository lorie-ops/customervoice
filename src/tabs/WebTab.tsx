import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { useDashboardData } from '../state/DataContext';
import { calculateHotjarAverage, calculateHotjarScoreDistribution, countHotjarByCategory } from '../lib/calculations';
import { formatDate, formatNumber, formatPercent } from '../lib/format';
import type { Category, Market } from '../types';

type MarketFilter = 'all' | Market;
type SurveyFilter = 'all' | string;

/**
 * Web tab - owned by Marketing / Customer insight lead. Mirrors the MyCP
 * tab's structure but scoped to the Hotjar (1-5, in-situ) source (business
 * feedback). Never computes an NPS - not defined for the 1-5 scale in this
 * data model (CLAUDE.md, mixed-scale protection).
 */
export function WebTab() {
  const { hotjarRows } = useDashboardData();
  const [market, setMarket] = useState<MarketFilter>('all');
  const [survey, setSurvey] = useState<SurveyFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const surveyTypes = useMemo(
    () => Array.from(new Set(hotjarRows.map((row) => row.surveyType).filter((s): s is string => Boolean(s)))).sort(),
    [hotjarRows],
  );

  const scopedRows = useMemo(
    () =>
      hotjarRows.filter((row) => {
        if (market !== 'all' && row.country !== market) return false;
        if (survey !== 'all' && row.surveyType !== survey) return false;
        return true;
      }),
    [hotjarRows, market, survey],
  );

  const webAverage = calculateHotjarAverage(scopedRows.map((row) => row.score));
  const scoredCount = scopedRows.filter((row) => row.score !== null && row.score !== undefined).length;

  const marketRows = MARKETS.filter((m) => market === 'all' || m === market).map((m) => {
    const rows = hotjarRows.filter((row) => row.country === m && (survey === 'all' || row.surveyType === survey));
    return {
      market: m,
      average: calculateHotjarAverage(rows.map((row) => row.score)),
      scoredCount: rows.filter((row) => row.score !== null && row.score !== undefined).length,
    };
  });

  const distributionData = MARKETS.map((m) => {
    const rows = hotjarRows.filter((row) => row.country === m && (survey === 'all' || row.surveyType === survey));
    const dist = calculateHotjarScoreDistribution(rows.map((row) => row.score));
    return { marketLabel: MARKET_LABELS[m], ...dist.byScore, scoredCount: dist.scoredCount };
  });

  const categoryRows = useMemo(() => {
    const counts = countHotjarByCategory(scopedRows);
    const total = counts.reduce((sum, c) => sum + c.count, 0);
    return counts.map((c) => ({ ...c, pct: total > 0 ? (c.count / total) * 100 : null }));
  }, [scopedRows]);

  const deepDiveExamples = selectedCategory
    ? scopedRows.filter((row) => row.category === selectedCategory).slice(0, 5)
    : [];

  return (
    <div role="tabpanel" id="tabpanel-web" aria-labelledby="tab-web">
      <TabHeader tabId="web" />

      <SectionPlaceholder title="Filters" description="Market and survey filters, applied to every section below.">
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
          <FilterField label="Survey">
            <select value={survey} onChange={(event) => setSurvey(event.target.value)}>
              <option value="all">All surveys</option>
              {surveyTypes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterBar>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Global Web Scores"
        description="Hotjar in-situ satisfaction, 1-5 scale. Unanswered scores are excluded, never treated as zero."
      >
        <div className="kpi-grid">
          <KpiCard
            label="Web (Hotjar) Average"
            value={webAverage !== null ? webAverage.toFixed(1) : null}
            unit=" / 5"
            tone="blue"
            footnote={`${scoredCount} scored responses (unanswered excluded)`}
          />
          <KpiCard
            label="Web (Hotjar) NPS"
            value={null}
            tone="blue"
            emptyMessage="Non applicable"
            footnote="NPS is not defined for the 1-5 Hotjar scale in this data model - never mixed with the MyCP NPS."
          />
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder title="Web Score by Country" description="Per-market average Hotjar score.">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Scored responses</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => (
                <tr key={row.market}>
                  <td>{MARKET_LABELS[row.market]}</td>
                  <td>{formatNumber(row.scoredCount)}</td>
                  <td>{row.average !== null ? `${row.average.toFixed(1)} / 5` : 'Non applicable'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Score Distribution (1-5) by Market"
        description="Real distribution computed from loaded Hotjar rows - not illustrative."
      >
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={distributionData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
              <YAxis type="category" dataKey="marketLabel" width={110} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="1" name="Score 1" stackId="a" fill="var(--cv-red)" />
              <Bar dataKey="2" name="Score 2" stackId="a" fill="var(--cv-orange)" />
              <Bar dataKey="3" name="Score 3" stackId="a" fill="var(--cv-border)" />
              <Bar dataKey="4" name="Score 4" stackId="a" fill="var(--cv-blue)" />
              <Bar dataKey="5" name="Score 5" stackId="a" fill="var(--cv-green)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Category Analysis"
        description="Real category counts derived from loaded Hotjar rows (row.category) - not an illustrative fixture."
      >
        {categoryRows.length === 0 ? (
          <EmptyState message="Non applicable" description="No categorized Hotjar rows match the current filters." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Mentions</th>
                  <th>% of mentions</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr
                    key={row.category}
                    onClick={() => setSelectedCategory(row.category)}
                    className={selectedCategory === row.category ? 'data-table__row--selected' : undefined}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{row.category}</td>
                    <td>{formatNumber(row.count)}</td>
                    <td>{row.pct !== null ? formatPercent(row.pct) : 'Non applicable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="filter-note">Click a row to open its Category Deep Dive below.</p>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Category Deep Dive"
        description="Sample verbatims for a single category, used to cross-check satisfaction against friction points."
      >
        {!selectedCategory ? (
          <p className="filter-note">Select a category in the table above to see example verbatims.</p>
        ) : deepDiveExamples.length === 0 ? (
          <EmptyState message="Non applicable" description="No verbatims found for this category and filter combination." />
        ) : (
          <div className="topic-card">
            <div className="topic-card__header">
              <p className="topic-card__title">{selectedCategory}</p>
              <span className="count-badge count-badge--orange">
                {formatNumber(categoryRows.find((r) => r.category === selectedCategory)?.count ?? null)} mentions
              </span>
            </div>
            {deepDiveExamples.map((row) => (
              <p className="topic-card__quote" key={row.id}>
                "{row.message}" - {MARKET_LABELS[row.country]}, {formatDate(row.date)}
              </p>
            ))}
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Monthly Report - Slide Format"
        description="Exportable slide-style summary for committee reporting, adapted to the Web (Hotjar) scope."
      >
        <div className="report-slide">
          <div className="report-slide__header">
            <span>Web (Hotjar) · in-situ satisfaction</span>
            <span>Scale: 1-5, unanswered excluded</span>
          </div>
          <div className="report-slide__body">
            <div>
              <p className="report-slide__nps">{webAverage !== null ? `${webAverage.toFixed(1)} / 5` : 'Non applicable'}</p>
              <p className="filter-note">{scoredCount} scored responses across all filtered markets</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Average</th>
                  <th>Scored responses</th>
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((m) => {
                  const rows = hotjarRows.filter((row) => row.country === m);
                  const average = calculateHotjarAverage(rows.map((row) => row.score));
                  const count = rows.filter((row) => row.score !== null && row.score !== undefined).length;
                  return (
                    <tr key={m}>
                      <td>{MARKET_LABELS[m]}</td>
                      <td>{average !== null ? `${average.toFixed(1)} / 5` : 'Non applicable'}</td>
                      <td>{formatNumber(count)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <InfoNote>
          No NPS row is shown on this slide - NPS is not defined for the 1-5 Hotjar scale in this
          data model and is never derived from it (CLAUDE.md, mixed-scale protection).
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

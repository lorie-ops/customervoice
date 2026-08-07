import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { crmRows, hotjarRows, recommendations } from '../lib/fixtures';
import {
  calculateCrmRates,
  calculateHotjarAverage,
  calculateWeeklyCrmRates,
  calculateWeeklyHotjarAverage,
  countHotjarByCategory,
} from '../lib/calculations';
import { formatDate, formatNps, formatPercent } from '../lib/format';
import { latestDate } from '../lib/dateRange';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import { subDays } from 'date-fns';

const anchor = latestDate([...hotjarRows.map((r) => r.date), ...crmRows.map((r) => r.date)]);
const defaultPeriodBEnd = anchor;
const defaultPeriodBStart = subDays(anchor, 14);
const defaultPeriodAEnd = subDays(defaultPeriodBStart, 1);
const defaultPeriodAStart = subDays(defaultPeriodAEnd, 14);

const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export function OverviewTab() {
  const webAverage = calculateHotjarAverage(hotjarRows.map((row) => row.score));
  const scoredHotjarCount = hotjarRows.filter((row) => row.score !== null && row.score !== undefined).length;
  const crmRates = calculateCrmRates(crmRows);
  const mycp = MYCP_BASELINE_APRIL_2026.global;

  const weeklyWeb = useMemo(() => calculateWeeklyHotjarAverage(hotjarRows), []);
  const weeklyCrm = useMemo(() => calculateWeeklyCrmRates(crmRows), []);
  const weeklyTrend = useMemo(() => {
    const weeks = Array.from(new Set([...weeklyWeb.map((w) => w.week), ...weeklyCrm.map((w) => w.week)])).sort();
    return weeks.map((week) => ({
      week,
      webAverage: weeklyWeb.find((w) => w.week === week)?.average ?? null,
      crmPositiveRate: weeklyCrm.find((w) => w.week === week)?.positiveRate ?? null,
    }));
  }, [weeklyWeb, weeklyCrm]);

  const [periodAStart, setPeriodAStart] = useState(toInputDate(defaultPeriodAStart));
  const [periodAEnd, setPeriodAEnd] = useState(toInputDate(defaultPeriodAEnd));
  const [periodBStart, setPeriodBStart] = useState(toInputDate(defaultPeriodBStart));
  const [periodBEnd, setPeriodBEnd] = useState(toInputDate(defaultPeriodBEnd));

  const categoryA = useMemo(() => countHotjarByCategory(hotjarRows, periodAStart, periodAEnd), [periodAStart, periodAEnd]);
  const categoryB = useMemo(() => countHotjarByCategory(hotjarRows, periodBStart, periodBEnd), [periodBStart, periodBEnd]);

  const combinedCategories = useMemo(() => {
    const categories = new Set([...categoryA.map((c) => c.category), ...categoryB.map((c) => c.category)]);
    return Array.from(categories).map((category) => ({
      category,
      periodA: categoryA.find((c) => c.category === category)?.count ?? 0,
      periodB: categoryB.find((c) => c.category === category)?.count ?? 0,
    }));
  }, [categoryA, categoryB]);

  const top3Categories = useMemo(
    () => [...categoryB].sort((a, b) => b.count - a.count).slice(0, 3),
    [categoryB],
  );

  const criticalRows = useMemo(
    () => hotjarRows.filter((row) => row.score !== null && row.score !== undefined && row.score <= 2),
    [],
  );
  const frustrationFocus = useMemo(() => {
    const counts = countHotjarByCategory(criticalRows, periodBStart, periodBEnd);
    return counts.slice(0, 3);
  }, [criticalRows, periodBStart, periodBEnd]);

  const keyMovements = useMemo(
    () =>
      combinedCategories
        .map((row) => ({
          ...row,
          delta: row.periodB - row.periodA,
          pctChange: row.periodA > 0 ? ((row.periodB - row.periodA) / row.periodA) * 100 : null,
        }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
        .slice(0, 7),
    [combinedCategories],
  );

  return (
    <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
      <TabHeader tabId="overview" />

      <SectionPlaceholder
        title="Last Month Trends"
        description="Weekly trend across the full fixture span, Web and CRM on one chart (two scales, two axes - never blended into one number). MyCP has no per-row dates in the validated baseline, so it stays a single static figure rather than a trend line."
      >
        {weeklyTrend.length === 0 ? (
          <EmptyState description="No Hotjar or CRM rows to trend." />
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis yAxisId="web" domain={[1, 5]} fontSize={12} stroke="var(--cv-blue)" label={{ value: 'Web / 5', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--cv-blue)' }} />
                <YAxis yAxisId="crm" orientation="right" domain={[0, 100]} unit="%" fontSize={12} stroke="var(--cv-green)" label={{ value: 'CRM %', angle: 90, position: 'insideRight', fontSize: 11, fill: 'var(--cv-green)' }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="web"
                  type="monotone"
                  dataKey="webAverage"
                  name="Web (Hotjar) average (/5)"
                  stroke="var(--cv-blue)"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  yAxisId="crm"
                  type="monotone"
                  dataKey="crmPositiveRate"
                  name="CRM positive rate (%)"
                  stroke="var(--cv-green)"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionPlaceholder>

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
        description="Source, Market, Scope, Survey filters that apply across the whole tab. Wired to specific sections in a later iteration."
      />

      <SectionPlaceholder
        title="Period A / Period B Filters"
        description="Both periods apply to Hotjar + CRM (row-level sources). MyCP stays a single static figure - it is never period-sliced."
      >
        <FilterBar>
          <FilterField label="Period A start">
            <input type="date" value={periodAStart} onChange={(event) => setPeriodAStart(event.target.value)} />
          </FilterField>
          <FilterField label="Period A end">
            <input type="date" value={periodAEnd} onChange={(event) => setPeriodAEnd(event.target.value)} />
          </FilterField>
          <FilterField label="Period B start">
            <input type="date" value={periodBStart} onChange={(event) => setPeriodBStart(event.target.value)} />
          </FilterField>
          <FilterField label="Period B end">
            <input type="date" value={periodBEnd} onChange={(event) => setPeriodBEnd(event.target.value)} />
          </FilterField>
        </FilterBar>
        <p className="filter-note">
          Defaults to the two most recent 15-day windows of fixture data (anchored to{' '}
          {formatDate(anchor.toISOString())}), not the real calendar date.
        </p>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Theme Distribution - Period A vs B"
        description="Category mentions from Hotjar, compared between the two selected periods (real, derived - not the static theme_analysis_fixture, which has no per-period breakdown)."
      >
        {combinedCategories.length === 0 ? (
          <EmptyState description="No categorized Hotjar rows in either period." />
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={combinedCategories} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="category" width={160} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="periodA" name="Period A" fill="var(--cv-border)" />
                <Bar dataKey="periodB" name="Period B" fill="var(--cv-blue)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <InfoNote>
          DE / FR / NL are the validated theme sets for the CSAT tab's Theme Analysis. This chart
          uses the broader `Category` taxonomy instead, since it is the only one with real
          per-period data.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Top 3 Categories - Verbatim Summary"
        description="Top three categories by volume in Period B, with a real example verbatim."
      >
        {top3Categories.length === 0 ? (
          <EmptyState description="No categorized Hotjar rows in Period B." />
        ) : (
          <div className="category-summary-grid">
            {top3Categories.map((entry, index) => {
              const example = hotjarRows.find((row) => row.category === entry.category);
              return (
                <div className="kpi-card" key={entry.category}>
                  <p className="kpi-card__label">#{index + 1}</p>
                  <p className="kpi-card__value" style={{ fontSize: 18 }}>
                    {entry.category}
                  </p>
                  <p className="kpi-card__footnote">{entry.count} feedbacks in Period B</p>
                  {example ? <p className="issue-card__quote">"{example.message}"</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Frustration Focus - Top 3 Pain Points"
        description="Top categories among 'critical' Hotjar responses (score 1-2 out of 5) in Period B - this feature's own definition, separate from any NPS bucket."
      >
        {frustrationFocus.length === 0 ? (
          <EmptyState description="No critical (score 1-2) Hotjar rows in Period B." />
        ) : (
          <ol className="topic-list">
            {frustrationFocus.map((entry) => (
              <li key={entry.category}>
                {entry.category} - {entry.count} critical response{entry.count > 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Key Movements - Period A to B"
        description="Category volume change between Period A and Period B (real, derived)."
      >
        {keyMovements.length === 0 ? (
          <EmptyState description="No categorized Hotjar rows in either period." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Period A</th>
                  <th>Period B</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {keyMovements.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td>{row.periodA}</td>
                    <td>{row.periodB}</td>
                    <td className={row.delta > 0 ? 'movement--up' : row.delta < 0 ? 'movement--down' : undefined}>
                      {row.delta > 0 ? '+' : ''}
                      {row.delta} {row.pctChange !== null ? `(${row.pctChange > 0 ? '+' : ''}${row.pctChange.toFixed(0)}%)` : '(new)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPlaceholder>

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

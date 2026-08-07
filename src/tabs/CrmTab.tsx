import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { crmActionPlanItems, crmRows } from '../lib/fixtures';
import { calculateCrmRates, calculateWeeklyCrmRates, mostFrequentNegativeText } from '../lib/calculations';
import { latestDate, presetRange } from '../lib/dateRange';
import { formatDate, formatPercent } from '../lib/format';
import type { Market } from '../types';

const anchor = latestDate(crmRows.map((row) => row.date));

export function CrmTab() {
  const [market, setMarket] = useState<Market>('FR');
  const [campaign, setCampaign] = useState<'all' | string>('all');

  const campaigns = useMemo(
    () => Array.from(new Set(crmRows.map((row) => row.campaign).filter((c): c is string => Boolean(c)))).sort(),
    [],
  );

  const last7 = presetRange('7d', anchor);
  const last7Rows = crmRows.filter((row) => new Date(row.date) >= last7.start && new Date(row.date) <= last7.end);
  const last7Rates = calculateCrmRates(last7Rows);

  const last30 = presetRange('30d', anchor);
  const last30Rows = crmRows.filter((row) => new Date(row.date) >= last30.start && new Date(row.date) <= last30.end);
  const weeklyRates = calculateWeeklyCrmRates(last30Rows);

  const filteredRows = useMemo(
    () =>
      crmRows.filter(
        (row) =>
          row.market === market &&
          new Date(row.date) >= last30.start &&
          new Date(row.date) <= last30.end &&
          (campaign === 'all' || row.campaign === campaign),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [market, campaign],
  );
  const filteredRates = calculateCrmRates(filteredRows);
  const positiveSignals = filteredRows.filter((row) => row.sentiment === 'positive');
  const negativeSignals = filteredRows.filter((row) => row.sentiment === 'negative');
  const rootCause = mostFrequentNegativeText(filteredRows);
  const filteredWeekly = calculateWeeklyCrmRates(filteredRows);
  const [prevWeek, lastWeek] = filteredWeekly.slice(-2);
  const wowDelta =
    prevWeek && lastWeek && prevWeek.negativeRate !== null && lastWeek.negativeRate !== null
      ? lastWeek.negativeRate - prevWeek.negativeRate
      : null;

  return (
    <div role="tabpanel" id="tabpanel-crm" aria-labelledby="tab-crm">
      <TabHeader tabId="crm" />

      <SectionPlaceholder
        title="Global Overview - Last 7 Days of Data"
        description={`${formatDate(last7.start.toISOString())} to ${formatDate(last7.end.toISOString())} - anchored to the most recent fixture date, not the real calendar date.`}
      >
        <div className="kpi-grid">
          <KpiCard label="Total responses" value={last7Rates.total} tone="neutral" />
          <KpiCard label="Positive rate" value={formatPercent(last7Rates.positiveRate)} tone="green" />
          <KpiCard label="Negative rate" value={formatPercent(last7Rates.negativeRate)} tone="red" />
        </div>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Positive vs Negative Rate - Last 30 Days by Week"
        description="Weekly breakdown, real fixture data grouped by ISO week."
      >
        {weeklyRates.length === 0 ? (
          <EmptyState description="No CRM rows in the last 30 days of data." />
        ) : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={weeklyRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="positiveRate" name="Positive %" stroke="var(--cv-green)" strokeWidth={2} />
                <Line type="monotone" dataKey="negativeRate" name="Negative %" stroke="var(--cv-red)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder title="Filtered View" description="Sections below react to the market and campaign selected here.">
        <FilterBar>
          <FilterField label="Market (single)">
            <select value={market} onChange={(event) => setMarket(event.target.value as Market)}>
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {MARKET_LABELS[m]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Campaign">
            <select value={campaign} onChange={(event) => setCampaign(event.target.value)}>
              <option value="all">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
        </FilterBar>
        <p className="filter-note">Window: last 30 days of data ({formatDate(last30.start.toISOString())} to {formatDate(last30.end.toISOString())}).</p>
      </SectionPlaceholder>

      <SectionPlaceholder
        title={`Market Health Snapshot - ${MARKET_LABELS[market]}`}
        description="Per-market view of CRM sentiment, used by the CRM lead to arbitrate priorities."
      >
        {filteredRates.total === 0 ? (
          <EmptyState description="No CRM rows match this market/campaign/window." />
        ) : (
          <div className="kpi-grid">
            <KpiCard label="Responses" value={filteredRates.total} tone="neutral" />
            <KpiCard label="Positive rate" value={formatPercent(filteredRates.positiveRate)} tone="green" />
            <KpiCard label="Negative rate" value={formatPercent(filteredRates.negativeRate)} tone="red" />
            <KpiCard
              label="WoW negative delta"
              value={wowDelta !== null ? `${wowDelta > 0 ? '+' : ''}${wowDelta.toFixed(1)}` : null}
              unit=" pts"
              tone="orange"
              emptyMessage="Non applicable"
              footnote="Needs at least two weeks of data in the current filter."
            />
          </div>
        )}
        <p className="filter-note">
          Root cause: {rootCause ?? 'Non applicable - no repeated negative comment in this filter.'} (derived from
          the most frequently repeated negative comment - a real signal, not an invented category.)
        </p>
      </SectionPlaceholder>

      <SectionPlaceholder title="Positive Signals" description="Positive verbatims (positiveText) for the current filter.">
        {positiveSignals.length === 0 ? (
          <EmptyState description="No positive verbatims match the current filter." />
        ) : (
          <ul className="signal-list signal-list--positive">
            {positiveSignals.map((row) => (
              <li key={row.id}>
                <span className="signal-list__date">{formatDate(row.date)}</span> {row.positiveText}
              </li>
            ))}
          </ul>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder title="Negative Signals" description="Negative verbatims (negativeText) for the current filter.">
        {negativeSignals.length === 0 ? (
          <EmptyState description="No negative verbatims match the current filter." />
        ) : (
          <ul className="signal-list signal-list--negative">
            {negativeSignals.map((row) => (
              <li key={row.id}>
                <span className="signal-list__date">{formatDate(row.date)}</span> {row.negativeText}
              </li>
            ))}
          </ul>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Action Plan - P1 / P2"
        description="Owner: CRM project lead (docs/OWNERSHIP_MATRIX.md) - this lead is responsible for keeping this list current."
      >
        <InfoNote tone="warning">
          Starter content below is illustrative (crm_action_plan_fixture.json) - the CRM project
          lead should replace it with real, curated actions.
        </InfoNote>
        <ul className="action-plan-list">
          {crmActionPlanItems.map((item) => (
            <li key={item.title} className="action-plan-item">
              <span className={`priority-badge priority-badge--${item.priority.toLowerCase()}`}>{item.priority}</span>
              <div>
                <p className="action-plan-item__title">{item.title}</p>
                <p className="action-plan-item__detail">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionPlaceholder>
    </div>
  );
}

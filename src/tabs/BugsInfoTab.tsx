import { useMemo, useState } from 'react';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { useDashboardData } from '../state/DataContext';
import {
  DEFAULT_TECHNICAL_ISSUE_ACTION,
  MISSING_INFO_TOPICS,
  TECHNICAL_ISSUE_ACTIONS,
  TOPIC_RECOMMENDATIONS,
  rowsForTopic,
} from '../lib/bugsInfoTopics';
import type { Market } from '../types';

type MarketFilter = 'all' | Market;

/**
 * Bugs & Info tab - owned by the Product project lead (weekly backlog
 * prioritization). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function BugsInfoTab() {
  const { hotjarRows } = useDashboardData();
  const [market, setMarket] = useState<MarketFilter>('all');

  const scopedRows = useMemo(
    () => hotjarRows.filter((row) => market === 'all' || row.country === market),
    [hotjarRows, market],
  );

  const bugRows = scopedRows.filter((row) => row.category === 'Bug / Technical Error');
  const missingInfoRows = scopedRows.filter((row) => row.category === 'Missing Information');

  const topIssues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of bugRows) counts.set(row.message, (counts.get(row.message) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [bugRows]);

  return (
    <div role="tabpanel" id="tabpanel-bugs-info" aria-labelledby="tab-bugs-info">
      <TabHeader tabId="bugs-info" />

      <SectionPlaceholder
        title="Filters"
        description="Market filter. Date range and journeyStage filters are wired in a later iteration."
      >
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

      <div className="kpi-grid">
        <KpiCard label="Bug reports detected" value={bugRows.length} tone="red" footnote="Category = 'Bug / Technical Error' (real fixture count)." />
        <KpiCard label="Missing information reports" value={missingInfoRows.length} tone="orange" footnote="Category = 'Missing Information' (real fixture count)." />
      </div>

      <SectionPlaceholder
        title="Top 5 Technical Issues"
        description="Ranked by real frequency of repeated messages in the Hotjar fixture."
      >
        {topIssues.length === 0 ? (
          <p className="filter-note">No bug reports in this filter.</p>
        ) : (
          topIssues.map(([message, count], index) => (
            <div className="issue-card" key={message}>
              <div className="issue-card__header">
                <p className="issue-card__title">#{index + 1} Bug / Technical Error</p>
                <span className="count-badge count-badge--red">{count} report{count > 1 ? 's' : ''}</span>
              </div>
              <p className="issue-card__quote">"{message}"</p>
              <p className="issue-card__action">
                <strong>Action:</strong> {TECHNICAL_ISSUE_ACTIONS[message] ?? DEFAULT_TECHNICAL_ISSUE_ACTION}
              </p>
            </div>
          ))
        )}
        <InfoNote tone="warning">
          Report counts and quotes above are real (Hotjar fixture). The "Action" text is
          illustrative placeholder guidance for the Product project lead to validate.
        </InfoNote>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Missing Information - by Topic"
        description="Category-to-topic mapping is this prototype's own choice, pending Product validation (docs/OWNERSHIP_MATRIX.md)."
      >
        {MISSING_INFO_TOPICS.map((topic) => {
          const rows = rowsForTopic(scopedRows, topic);
          const exampleRow = rows[0];
          return (
            <div className="topic-card" key={topic}>
              <div className="topic-card__header">
                <p className="topic-card__title">{topic}</p>
                <span className="count-badge count-badge--orange">
                  {rows.length} report{rows.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="topic-card__quote">
                {exampleRow ? `"${exampleRow.message}"` : 'Non applicable - no fixture verbatim mapped to this topic yet.'}
              </p>
              <p className="topic-card__recommendation">
                <strong>Recommendation:</strong> {TOPIC_RECOMMENDATIONS[topic]}
              </p>
            </div>
          );
        })}
        <InfoNote>
          Report counts and quotes are real, derived from the Hotjar fixture via the topic
          mapping above. "Recommendation" text is illustrative placeholder guidance.
        </InfoNote>
      </SectionPlaceholder>
    </div>
  );
}

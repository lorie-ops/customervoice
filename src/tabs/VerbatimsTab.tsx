import { useMemo, useState } from 'react';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { crmRows, hotjarRows } from '../lib/fixtures';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { formatDate } from '../lib/format';
import { isWithinDateRange } from '../lib/dateRange';
import type { Market } from '../types';

type SourceFilter = 'all' | 'hotjar' | 'crm';
type MarketFilter = 'all' | Market;
type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';

/**
 * Verbatims tab - cross-team investigation tool, no single owner
 * (docs/OWNERSHIP_MATRIX.md). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function VerbatimsTab() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');
  const [market, setMarket] = useState<MarketFilter>('all');
  const [sentiment, setSentiment] = useState<SentimentFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const query = search.trim().toLowerCase();

  const filteredHotjar = useMemo(() => {
    if (source === 'crm') return [];
    return hotjarRows.filter((row) => {
      if (market !== 'all' && row.country !== market) return false;
      // Hotjar rows have no sentiment field - never guessed from score, so a
      // specific sentiment filter simply excludes them rather than matching.
      if (sentiment !== 'all') return false;
      if (!isWithinDateRange(row.date, startDate || undefined, endDate || undefined)) return false;
      if (query && !row.message.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [source, market, sentiment, startDate, endDate, query]);

  const filteredCrm = useMemo(() => {
    if (source === 'hotjar') return [];
    return crmRows.filter((row) => {
      if (market !== 'all' && row.market !== market) return false;
      if (sentiment !== 'all' && row.sentiment !== sentiment) return false;
      if (!isWithinDateRange(row.date, startDate || undefined, endDate || undefined)) return false;
      const text = `${row.positiveText ?? ''} ${row.negativeText ?? ''}`.toLowerCase();
      if (query && !text.includes(query)) return false;
      return true;
    });
  }, [source, market, sentiment, startDate, endDate, query]);

  return (
    <div role="tabpanel" id="tabpanel-verbatims" aria-labelledby="tab-verbatims">
      <TabHeader tabId="verbatims" />

      <SectionPlaceholder
        title="Hotjar Raw Verbatims"
        description={`Row-level table from hotjar_fixture.json (${filteredHotjar.length} of ${hotjarRows.length} rows shown).`}
      >
        {filteredHotjar.length === 0 ? (
          <EmptyState message="Non applicable" description="No Hotjar verbatims match the current filters." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Market</th>
                  <th>Score</th>
                  <th>Category</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotjar.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.date)}</td>
                    <td>{MARKET_LABELS[row.country]}</td>
                    <td>{row.score ?? 'Unknown'}</td>
                    <td>{row.category ?? 'Unknown'}</td>
                    <td>{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="CRM Verbatims"
        description={`Row-level table from crm_fixture.json (${filteredCrm.length} of ${crmRows.length} rows shown).`}
      >
        {filteredCrm.length === 0 ? (
          <EmptyState message="Non applicable" description="No CRM verbatims match the current filters." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Market</th>
                  <th>Sentiment</th>
                  <th>Campaign</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrm.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.date)}</td>
                    <td>{MARKET_LABELS[row.market]}</td>
                    <td>
                      <span className={`sentiment-tag sentiment-tag--${row.sentiment}`}>{row.sentiment}</span>
                    </td>
                    <td>{row.campaign ?? 'Unknown'}</td>
                    <td>{row.positiveText ?? row.negativeText ?? 'Non applicable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Search, Source, Market, Sentiment, Date Filters"
        description="Free-text search plus Source (Hotjar/CRM), Market, Sentiment, and Date filters, shared across both tables above."
      >
        <FilterBar>
          <FilterField label="Search">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search message or comment..."
            />
          </FilterField>
          <FilterField label="Source">
            <select value={source} onChange={(event) => setSource(event.target.value as SourceFilter)}>
              <option value="all">All sources</option>
              <option value="hotjar">Hotjar</option>
              <option value="crm">CRM</option>
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
          <FilterField label="Sentiment">
            <select value={sentiment} onChange={(event) => setSentiment(event.target.value as SentimentFilter)}>
              <option value="all">All sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </FilterField>
          <FilterField label="Start date">
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </FilterField>
          <FilterField label="End date">
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </FilterField>
        </FilterBar>
        <p className="filter-note">
          Sentiment is only defined for CRM rows in this data model - selecting a specific
          sentiment hides Hotjar rows rather than guessing one from their score.
        </p>
      </SectionPlaceholder>
    </div>
  );
}

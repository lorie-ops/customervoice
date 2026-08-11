import { useMemo, useState } from 'react';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { useDashboardData } from '../state/DataContext';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { formatDate } from '../lib/format';
import { isWithinDateRange } from '../lib/dateRange';
import type { Category, JourneyStage, Market } from '../types';

type SourceFilter = 'all' | 'hotjar' | 'crm' | 'mycp';
type MarketFilter = 'all' | Market;
type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral';
type CategoryFilter = 'all' | Category;
type JourneyStageFilter = 'all' | JourneyStage;

const CATEGORIES: Category[] = [
  'Reservation / Booking',
  'Payment / Price',
  'Cottage & Equipment',
  'Bug / Technical Error',
  'Missing Information',
  'Activities & Leisure',
  'Customer Service',
  'Account / Login',
  'Other',
];

const STAGE_LABELS: Record<JourneyStage, string> = { before: 'Before Stay', during: 'During Stay', after: 'After Stay' };

/**
 * Verbatims tab - cross-team investigation tool, no single owner
 * (docs/OWNERSHIP_MATRIX.md). Section order follows docs/PROJECT_SPEC.md §2.
 * Source, Market, Sentiment, Category and Journey Stage filters are shared
 * across the three tables below; a filter only affects the tables whose
 * rows have that field (e.g. Category only exists on Hotjar rows) - it
 * excludes the other tables' rows rather than guessing a value for them.
 */
export function VerbatimsTab() {
  const { hotjarRows, crmRows, mycpRows } = useDashboardData();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');
  const [market, setMarket] = useState<MarketFilter>('all');
  const [sentiment, setSentiment] = useState<SentimentFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [journeyStage, setJourneyStage] = useState<JourneyStageFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const query = search.trim().toLowerCase();

  const filteredHotjar = useMemo(() => {
    if (source === 'crm' || source === 'mycp') return [];
    return hotjarRows.filter((row) => {
      if (market !== 'all' && row.country !== market) return false;
      // Hotjar rows have no sentiment field - never guessed from score, so a
      // specific sentiment filter simply excludes them rather than matching.
      if (sentiment !== 'all') return false;
      if (category !== 'all' && row.category !== category) return false;
      if (journeyStage !== 'all' && row.journeyStage !== journeyStage) return false;
      if (!isWithinDateRange(row.date, startDate || undefined, endDate || undefined)) return false;
      if (query && !row.message.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [hotjarRows, source, market, sentiment, category, journeyStage, startDate, endDate, query]);

  const filteredCrm = useMemo(() => {
    if (source === 'hotjar' || source === 'mycp') return [];
    return crmRows.filter((row) => {
      if (market !== 'all' && row.market !== market) return false;
      if (sentiment !== 'all' && row.sentiment !== sentiment) return false;
      // CRM rows have no category field.
      if (category !== 'all') return false;
      if (journeyStage !== 'all' && row.journeyStage !== journeyStage) return false;
      if (!isWithinDateRange(row.date, startDate || undefined, endDate || undefined)) return false;
      const text = `${row.positiveText ?? ''} ${row.negativeText ?? ''}`.toLowerCase();
      if (query && !text.includes(query)) return false;
      return true;
    });
  }, [crmRows, source, market, sentiment, category, journeyStage, startDate, endDate, query]);

  const filteredMyCp = useMemo(() => {
    if (source === 'hotjar' || source === 'crm') return [];
    return mycpRows.filter((row) => {
      if (market !== 'all' && row.market !== market) return false;
      // MyCP rows have no sentiment or category field.
      if (sentiment !== 'all') return false;
      if (category !== 'all') return false;
      if (journeyStage !== 'all' && row.journeyStage !== journeyStage) return false;
      if (!isWithinDateRange(row.date, startDate || undefined, endDate || undefined)) return false;
      const text = `${row.sorryVerbatim ?? ''} ${row.improveVerbatim ?? ''} ${row.optimizeVerbatim ?? ''}`.toLowerCase();
      if (query && !text.includes(query)) return false;
      return true;
    });
  }, [mycpRows, source, market, sentiment, category, journeyStage, startDate, endDate, query]);

  return (
    <div role="tabpanel" id="tabpanel-verbatims" aria-labelledby="tab-verbatims">
      <TabHeader tabId="verbatims" />

      <SectionPlaceholder
        title="Hotjar Raw Verbatims"
        description={`Row-level table from Web (Hotjar) (${filteredHotjar.length} of ${hotjarRows.length} rows shown).`}
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
                  <th>Journey stage</th>
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
                    <td>{row.journeyStage ? STAGE_LABELS[row.journeyStage] : 'Unknown'}</td>
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
        description={`Row-level table from CRM (${filteredCrm.length} of ${crmRows.length} rows shown).`}
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
                  <th>Journey stage</th>
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
                    <td>{row.journeyStage ? STAGE_LABELS[row.journeyStage] : 'Unknown'}</td>
                    <td>{row.positiveText ?? row.negativeText ?? 'Non applicable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="MyCP Verbatims"
        description={`Row-level table from MyCP (sorry / improve / optimize) (${filteredMyCp.length} of ${mycpRows.length} rows shown).`}
      >
        {filteredMyCp.length === 0 ? (
          <EmptyState
            message="Non applicable"
            description={
              mycpRows.length === 0
                ? 'No MyCP rows loaded yet - the validated static baseline has no row-level verbatims, only aggregate scores. Upload MyCP files (Data Sources panel above) to see verbatims here.'
                : 'No MyCP verbatims match the current filters.'
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Market</th>
                  <th>Score</th>
                  <th>Journey stage</th>
                  <th>Sorry</th>
                  <th>Improve</th>
                  <th>Optimize</th>
                </tr>
              </thead>
              <tbody>
                {filteredMyCp.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.date)}</td>
                    <td>{MARKET_LABELS[row.market]}</td>
                    <td>{row.score} / 10</td>
                    <td>{row.journeyStage ? STAGE_LABELS[row.journeyStage] : 'Unknown'}</td>
                    <td>{row.sorryVerbatim ?? 'Non applicable'}</td>
                    <td>{row.improveVerbatim ?? 'Non applicable'}</td>
                    <td>{row.optimizeVerbatim ?? 'Non applicable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Search, Source, Market, Sentiment, Category, Journey Stage, Date Filters"
        description="Free-text search plus Source (Hotjar/CRM/MyCP), Market, Sentiment, Category, Journey Stage, and Date filters, shared across all three tables above."
      >
        <FilterBar>
          <FilterField label="Search">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search message, comment or verbatim..."
            />
          </FilterField>
          <FilterField label="Source">
            <select value={source} onChange={(event) => setSource(event.target.value as SourceFilter)}>
              <option value="all">All sources</option>
              <option value="hotjar">Web (Hotjar)</option>
              <option value="crm">CRM</option>
              <option value="mycp">MyCP</option>
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
          <FilterField label="Category">
            <select value={category} onChange={(event) => setCategory(event.target.value as CategoryFilter)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Journey stage">
            <select value={journeyStage} onChange={(event) => setJourneyStage(event.target.value as JourneyStageFilter)}>
              <option value="all">All stages</option>
              <option value="before">Before Stay</option>
              <option value="during">During Stay</option>
              <option value="after">After Stay</option>
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
          Sentiment is only defined for CRM rows and Category only for Hotjar rows in this data
          model - selecting a specific sentiment or category hides the tables without that field
          rather than guessing a value for them.
        </p>
      </SectionPlaceholder>
    </div>
  );
}

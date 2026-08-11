import { useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';
import { InfoNote } from '../components/InfoNote';
import { KpiCard } from '../components/KpiCard';
import { FilterBar, FilterField } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import { BRAND_IMAGE_ATTRIBUTES, CP_IMAGE_STATEMENTS } from '../constants/brandMonitoring';
import {
  BRAND_MONITOR_GOAL_EUROPE,
  BRAND_MONITOR_INSIGHTS_BY_MARKET,
  BRAND_MONITOR_INSIGHTS_EUROPE,
} from '../lib/brandMonitorExtraction';
import { useDashboardData } from '../state/DataContext';
import { formatPercent } from '../lib/format';
import type { BrandMonitoringRow, Market } from '../types';

type MarketFilter = 'all' | Market;

function isCenterParcs(row: BrandMonitoringRow) {
  return row.brand.trim().toLowerCase() === 'center parcs';
}

const AVERAGEABLE_KEYS = [
  'awarenessTotal',
  'awarenessSpontaneous',
  'awarenessAided',
  'awarenessTopOfMind',
  'consideration',
  'preference',
  'shortList',
  'user',
  'repeater',
  'loyal',
] as const;

function averageNumber(values: Array<number | undefined>): number | undefined {
  const defined = values.filter((v): v is number => typeof v === 'number');
  return defined.length > 0 ? defined.reduce((sum, v) => sum + v, 0) / defined.length : undefined;
}

function averageImageMap(rows: BrandMonitoringRow[], key: 'brandImage' | 'cpImage'): Record<string, number> {
  const attrs = new Set(rows.flatMap((row) => Object.keys(row[key])));
  const result: Record<string, number> = {};
  for (const attr of attrs) {
    const value = averageNumber(rows.map((row) => row[key][attr]));
    if (value !== undefined) result[attr] = value;
  }
  return result;
}

/**
 * "All markets" is not a real row in the data - it is a cross-market
 * average of each market's own Center Parcs row for that year, since the
 * PDF's 500-respondents-per-market design has no meaningful weighting
 * beyond a simple mean across markets. Never just picks the first
 * market's row (that would silently mislabel one market's numbers as
 * "all markets").
 */
function averageCenterParcsRow(rows: BrandMonitoringRow[]): BrandMonitoringRow | null {
  const cpRows = rows.filter(isCenterParcs);
  if (cpRows.length === 0) return null;
  if (cpRows.length === 1) return cpRows[0];
  const averaged: Partial<Record<(typeof AVERAGEABLE_KEYS)[number], number>> = {};
  for (const key of AVERAGEABLE_KEYS) {
    const value = averageNumber(cpRows.map((row) => row[key]));
    if (value !== undefined) averaged[key] = value;
  }
  return {
    id: 'brandmonitor-all-markets-average',
    market: cpRows[0].market,
    year: cpRows[0].year,
    brand: 'Center Parcs',
    brandImage: averageImageMap(cpRows, 'brandImage'),
    cpImage: averageImageMap(cpRows, 'cpImage'),
    source: 'BrandMonitoring',
    ...averaged,
  };
}

const FUNNEL_STAGES: Array<{ key: keyof BrandMonitoringRow; label: string }> = [
  { key: 'awarenessTotal', label: 'Awareness' },
  { key: 'consideration', label: 'Consideration' },
  { key: 'shortList', label: 'Short list' },
  { key: 'user', label: 'User' },
  { key: 'repeater', label: 'Repeater' },
  { key: 'loyal', label: 'Loyal' },
];

/**
 * Brand Monitoring tab - owned by Marketing brand lead. Proposed after
 * reading Brand_Monitor_2026_Analysis_1.pdf (approved structure), which is
 * an extraction/summary only - it explicitly points to a separate
 * "Brand Monitor 2026.xls" for the real KPI numbers, which this prototype
 * has not been given. Every section here is upload-driven with honest
 * empty states - no number from the PDF is hardcoded (CLAUDE.md).
 */
export function BrandMonitoringTab() {
  const { brandMonitoringRows, brandMonitoringSource } = useDashboardData();
  const [market, setMarket] = useState<MarketFilter>('all');
  const [year, setYear] = useState<number | null>(null);

  const scopedRows = useMemo(
    () => brandMonitoringRows.filter((row) => market === 'all' || row.market === market),
    [brandMonitoringRows, market],
  );

  const availableYears = useMemo(
    () => Array.from(new Set(scopedRows.map((row) => row.year))).sort((a, b) => b - a),
    [scopedRows],
  );

  const activeYear = year ?? availableYears[0] ?? null;

  const yearRows = useMemo(
    () => (activeYear === null ? [] : scopedRows.filter((row) => row.year === activeYear)),
    [scopedRows, activeYear],
  );

  const cpRow = averageCenterParcsRow(yearRows);
  const competitorRows = yearRows.filter((row) => !isCenterParcs(row));

  const competitorAverage = (key: keyof BrandMonitoringRow): number | null => {
    const values = competitorRows.map((row) => row[key]).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const funnelData = FUNNEL_STAGES.map((stage) => ({
    stage: stage.label,
    centerParcs: typeof cpRow?.[stage.key] === 'number' ? (cpRow[stage.key] as number) : null,
    competitorAvg: competitorAverage(stage.key),
  }));

  const quadrantData = cpRow
    ? BRAND_IMAGE_ATTRIBUTES.filter((attr) => cpRow.brandImage[attr] !== undefined).map((attr) => ({
        attribute: attr,
        centerParcs: cpRow.brandImage[attr],
        competitorAvg:
          competitorRows.length > 0
            ? (() => {
                const values = competitorRows.map((row) => row.brandImage[attr]).filter((v): v is number => v !== undefined);
                return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
              })()
            : null,
      }))
    : [];

  const radarData = BRAND_IMAGE_ATTRIBUTES.filter((attr) => cpRow?.brandImage[attr] !== undefined).map((attr) => ({
    attribute: attr,
    centerParcs: cpRow?.brandImage[attr] ?? 0,
    competitorAvg:
      competitorRows.length > 0
        ? (() => {
            const values = competitorRows.map((row) => row.brandImage[attr]).filter((v): v is number => v !== undefined);
            return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
          })()
        : 0,
  }));

  const cpImageData = CP_IMAGE_STATEMENTS.filter((stmt) => cpRow?.cpImage[stmt] !== undefined)
    .map((stmt) => ({ statement: stmt, score: cpRow?.cpImage[stmt] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const marketInsights = market !== 'all' ? BRAND_MONITOR_INSIGHTS_BY_MARKET[market] : null;

  return (
    <div role="tabpanel" id="tabpanel-brand-monitoring" aria-labelledby="tab-brand-monitoring">
      <TabHeader tabId="brand-monitoring" />

      <InfoNote tone="warning">
        Brand Health Indicators, Competitor Benchmark and Key Insights below are a validated
        static extraction from Brand_Monitor_2026_Analysis_1.pdf (Awareness / Consideration /
        Preference, May 2024-2026, manually transcribed from clearly labeled bars). Brand Image,
        Center Parcs Image and the Short list/User/Repeater/Loyal funnel stages are NOT included -
        the PDF's attribute-level charts are too dense to transcribe reliably, so those sections
        stay an honest empty state. Upload the real Brand Monitor 2026.xls (Data Sources panel
        above) to replace this extraction and populate every section.
        <br />
        <a className="doc-download-link" href="/docs/Brand_Monitor_2026_Analysis_1.pdf" download>
          <FileDown size={14} aria-hidden="true" /> Download Brand Monitor 2026 (PDF)
        </a>
      </InfoNote>

      <SectionPlaceholder title="Filters" description="Market and year, applied to every section below.">
        <FilterBar>
          <FilterField label="Market">
            <select
              value={market}
              onChange={(event) => {
                setMarket(event.target.value as MarketFilter);
                setYear(null);
              }}
            >
              <option value="all">All markets</option>
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {MARKET_LABELS[m]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Year">
            <select
              value={activeYear ?? ''}
              onChange={(event) => setYear(event.target.value ? Number(event.target.value) : null)}
              disabled={availableYears.length === 0}
            >
              {availableYears.length === 0 ? (
                <option value="">No data loaded</option>
              ) : (
                availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))
              )}
            </select>
          </FilterField>
        </FilterBar>
      </SectionPlaceholder>

      {!cpRow ? (
        <SectionPlaceholder
          title="Brand Health Indicators"
          description="Awareness, consideration, preference and usage - loaded per market/year from the Brand Monitoring source."
        >
          <EmptyState
            message="Non applicable"
            description='No "Center Parcs" row found for this market/year combination.'
          />
        </SectionPlaceholder>
      ) : (
        <>
          <SectionPlaceholder
            title="Brand Health Indicators"
            description={`Center Parcs, ${market === 'all' ? 'simple average across all 6 markets' : MARKET_LABELS[market as Market]} - ${activeYear} - ${
              brandMonitoringSource === 'upload'
                ? 'live upload'
                : 'validated static extraction from Brand_Monitor_2026_Analysis_1.pdf'
            }.`}
          >
            <div className="kpi-grid">
              <KpiCard label="Awareness - Total" value={cpRow.awarenessTotal?.toFixed(1) ?? null} unit="%" tone="blue" />
              <KpiCard label="Awareness - Spontaneous" value={cpRow.awarenessSpontaneous?.toFixed(1) ?? null} unit="%" tone="blue" />
              <KpiCard label="Awareness - Aided" value={cpRow.awarenessAided?.toFixed(1) ?? null} unit="%" tone="blue" />
              <KpiCard label="Awareness - Top of Mind" value={cpRow.awarenessTopOfMind?.toFixed(1) ?? null} unit="%" tone="blue" />
              <KpiCard label="Consideration" value={cpRow.consideration?.toFixed(1) ?? null} unit="%" tone="purple" />
              <KpiCard label="Preference" value={cpRow.preference?.toFixed(1) ?? null} unit="%" tone="purple" />
              <KpiCard label="Usage" value={cpRow.user?.toFixed(1) ?? null} unit="%" tone="green" />
            </div>
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Key Insights"
            description={
              market === 'all'
                ? 'Verbatim from the Brand Monitor 2026 management summary (Europe-wide).'
                : `Verbatim from the Brand Monitor 2026 management summary - ${MARKET_LABELS[market as Market]}.`
            }
          >
            {market === 'all' ? (
              <>
                <ul className="topic-list">
                  {BRAND_MONITOR_INSIGHTS_EUROPE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="filter-note" style={{ marginTop: 10, fontWeight: 600 }}>
                  Goal remains to consider Center Parcs and book after short listing:
                </p>
                <ul className="topic-list">
                  {BRAND_MONITOR_GOAL_EUROPE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="filter-note" style={{ fontWeight: 600 }}>{marketInsights?.headline}</p>
                <ul className="topic-list">
                  {marketInsights?.bullets.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </>
            )}
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Consumer Disposition Funnel"
            description="Awareness -> Consideration -> Short list -> User -> Repeater -> Loyal, Center Parcs vs competitor average."
          >
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                  <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
                  <YAxis type="category" dataKey="stage" width={90} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="centerParcs" name="Center Parcs" fill="var(--cv-navy)" />
                  <Bar dataKey="competitorAvg" name="Competitor average" fill="var(--cv-border)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {competitorRows.length === 0 ? (
              <p className="filter-note">No competitor rows loaded for this market/year - competitor average is Non applicable.</p>
            ) : null}
            {brandMonitoringSource === 'static' ? (
              <p className="filter-note">
                Short list / User / Repeater / Loyal are not in this PDF extraction (see the note above) - only
                Awareness and Consideration are real for this static baseline.
              </p>
            ) : null}
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Brand Image vs Competitors - Attribute Quadrant"
            description="Each Brand Image attribute plotted as Center Parcs score (x) vs competitor average (y). Reference lines at 50%."
          >
            {quadrantData.length === 0 ? (
              <EmptyState
                message="Non applicable"
                description={
                  brandMonitoringSource === 'static'
                    ? 'Not included in the PDF extraction (see the note above) - upload Brand Monitor 2026.xls to populate this chart.'
                    : 'No Brand Image attribute columns were recognized in the loaded file.'
                }
              />
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                    <XAxis type="number" dataKey="centerParcs" name="Center Parcs" unit="%" domain={[0, 100]} fontSize={12} />
                    <YAxis type="number" dataKey="competitorAvg" name="Competitor average" unit="%" domain={[0, 100]} fontSize={12} />
                    <ZAxis range={[80, 80]} />
                    <ReferenceLine x={50} stroke="var(--cv-border)" />
                    <ReferenceLine y={50} stroke="var(--cv-border)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Scatter name="Brand Image attributes" data={quadrantData} fill="var(--cv-blue)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Brand Image - Radar"
            description="12 reference Brand Image attributes (constants/brandMonitoring.ts), Center Parcs vs competitor average."
          >
            {radarData.length === 0 ? (
              <EmptyState
                message="Non applicable"
                description={
                  brandMonitoringSource === 'static'
                    ? 'Not included in the PDF extraction (see the note above) - upload Brand Monitor 2026.xls to populate this chart.'
                    : 'No Brand Image attribute columns were recognized in the loaded file.'
                }
              />
            ) : (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--cv-border)" />
                    <PolarAngleAxis dataKey="attribute" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                    <Radar name="Center Parcs" dataKey="centerParcs" stroke="var(--cv-navy)" fill="var(--cv-navy)" fillOpacity={0.3} />
                    {competitorRows.length > 0 ? (
                      <Radar name="Competitor average" dataKey="competitorAvg" stroke="var(--cv-blue)" fill="var(--cv-blue)" fillOpacity={0.15} />
                    ) : null}
                    <Legend />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Center Parcs Image - Perception Statements"
            description="~24 reference perception statements (constants/brandMonitoring.ts), Center Parcs score, sorted highest first."
          >
            {cpImageData.length === 0 ? (
              <EmptyState
                message="Non applicable"
                description={
                  brandMonitoringSource === 'static'
                    ? 'Not included in the PDF extraction (see the note above) - upload Brand Monitor 2026.xls to populate this chart.'
                    : 'No Center Parcs Image statement columns were recognized in the loaded file.'
                }
              />
            ) : (
              <div style={{ width: '100%', height: Math.max(240, cpImageData.length * 30) }}>
                <ResponsiveContainer>
                  <BarChart data={cpImageData} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--cv-border)" />
                    <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
                    <YAxis type="category" dataKey="statement" width={280} fontSize={11} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="score" name="Center Parcs" fill="var(--cv-purple)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionPlaceholder>

          <SectionPlaceholder
            title="Competitor Benchmark"
            description={`All brands loaded for ${market === 'all' ? 'all markets' : MARKET_LABELS[market as Market]} - ${activeYear}.`}
          >
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Awareness (Total)</th>
                    <th>Consideration</th>
                    <th>Preference</th>
                    <th>Usage</th>
                    <th>Loyal</th>
                  </tr>
                </thead>
                <tbody>
                  {yearRows.map((row) => (
                    <tr key={row.id} className={isCenterParcs(row) ? 'data-table__row--selected' : undefined}>
                      <td>{row.brand}</td>
                      <td>{row.awarenessTotal !== undefined ? formatPercent(row.awarenessTotal) : 'Non applicable'}</td>
                      <td>{row.consideration !== undefined ? formatPercent(row.consideration) : 'Non applicable'}</td>
                      <td>{row.preference !== undefined ? formatPercent(row.preference) : 'Non applicable'}</td>
                      <td>{row.user !== undefined ? formatPercent(row.user) : 'Non applicable'}</td>
                      <td>{row.loyal !== undefined ? formatPercent(row.loyal) : 'Non applicable'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionPlaceholder>
        </>
      )}
    </div>
  );
}

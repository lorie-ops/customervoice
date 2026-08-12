import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { hotjarRows as fixtureHotjarRows, crmRows as fixtureCrmRows } from '../lib/fixtures';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import { MEDALLIA_BASELINE_APRIL_2026 } from '../lib/medalliaExtraction';
import type { MedalliaBaseline } from '../lib/medalliaExtraction';
import { computeMedalliaBaselineFromRows, computeMyCpBaselineFromRows, isMyCpDataCoherent } from '../lib/calculations';
import { buildStaticBrandMonitoringRows } from '../lib/brandMonitorExtraction';
import { MARKETS } from '../constants/markets';
import type {
  BrandMonitoringRow,
  CRMRow,
  HotjarRow,
  Market,
  MedalliaRow,
  MyCpBaseline,
  MyCpRow,
} from '../types';

type SourceState = 'fixture' | 'upload';
/** Single-file-for-all-markets source (Brand Monitoring/Medallia - business exception,
 * confirmed against real exports for both). Starts on a validated static extraction
 * (lib/brandMonitorExtraction.ts, lib/medalliaExtraction.ts), same "display validated
 * static data immediately" pattern as MyCP - replaced only by a real upload. */
type SingleFileUploadState = 'static' | 'upload';

type ByMarket<T> = Partial<Record<Market, T[]>>;

function groupByMarket<T>(rows: T[], marketOf: (row: T) => Market): ByMarket<T> {
  const result: ByMarket<T> = {};
  for (const market of MARKETS) result[market] = rows.filter((row) => marketOf(row) === market);
  return result;
}

function flatten<T>(byMarket: ByMarket<T>): T[] {
  return MARKETS.flatMap((market) => byMarket[market] ?? []);
}

function allFixtureSource(): Record<Market, SourceState> {
  return MARKETS.reduce((acc, market) => ({ ...acc, [market]: 'fixture' as SourceState }), {} as Record<Market, SourceState>);
}

type DataState = {
  hotjarRowsByMarket: ByMarket<HotjarRow>;
  hotjarSourceByMarket: Record<Market, SourceState>;
  hotjarWarningsByMarket: ByMarket<string>;
  hotjarRows: HotjarRow[];
  hotjarSource: SourceState;

  crmRowsByMarket: ByMarket<CRMRow>;
  crmSourceByMarket: Record<Market, SourceState>;
  crmWarningsByMarket: ByMarket<string>;
  crmRows: CRMRow[];
  crmSource: SourceState;

  mycpRowsByMarket: ByMarket<MyCpRow>;
  mycpWarningsByMarket: ByMarket<string>;
  mycpRows: MyCpRow[];
  mycpBaseline: MyCpBaseline;
  mycpSource: 'static' | 'upload';

  /** Exception: one file for all 6 markets, confirmed against a real export - not one per market. */
  medalliaRows: MedalliaRow[];
  medalliaWarnings: string[];
  medalliaSource: SingleFileUploadState;
  medalliaBaseline: MedalliaBaseline;

  /** Exception: one file for all 6 markets (business feedback), not one per market. */
  brandMonitoringRows: BrandMonitoringRow[];
  brandMonitoringWarnings: string[];
  brandMonitoringSource: SingleFileUploadState;
};

type DataActions = {
  setHotjarMarketRows: (market: Market, rows: HotjarRow[], warnings: string[]) => void;
  setCrmMarketRows: (market: Market, rows: CRMRow[], warnings: string[]) => void;
  setMyCpMarketRows: (market: Market, rows: MyCpRow[], warnings: string[]) => void;
  /** Single-file setter (exception - see medalliaRows above). */
  setMedalliaRows: (rows: MedalliaRow[], warnings: string[]) => void;
  /** Single-file setter (exception - see brandMonitoringRows above). */
  setBrandMonitoringRows: (rows: BrandMonitoringRow[], warnings: string[]) => void;
  resetToFixtures: () => void;
};

const DataContext = createContext<(DataState & DataActions) | null>(null);

const initialHotjarByMarket = () => groupByMarket(fixtureHotjarRows, (row) => row.country);
const initialCrmByMarket = () => groupByMarket(fixtureCrmRows, (row) => row.market);

/**
 * Central data state for the dashboard (docs/BACKLOG.md Phase 6, expanded
 * to all 5 sources per business feedback). Every source loads one file per
 * market (constants/markets.ts), mirroring the original MyCP pattern.
 *
 * - Hotjar/CRM: default to local fixtures, grouped per market. Uploading a
 *   market's file replaces that market's slice immediately - the other
 *   markets keep showing fixture data until their own file is uploaded.
 * - MyCP: the static, validated April 2026 baseline stays active until all
 *   six market files are loaded and coherent (CLAUDE.md "Data loading"
 *   rules) - unchanged from Phase 6.
 * - Medallia/Brand Monitoring: both delivered as ONE file covering all 6
 *   markets (business exception, confirmed against real exports for
 *   both - unlike every other source here), not a per-market map.
 *   Display a validated static extraction immediately
 *   (lib/medalliaExtraction.ts, lib/brandMonitorExtraction.ts), replaced
 *   only by a real upload. Medallia is never merged with MyCP (non-merge
 *   rule, docs/DATA_MODEL_ADDENDUM.md §3).
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [hotjarRowsByMarket, setHotjarRowsByMarket] = useState<ByMarket<HotjarRow>>(initialHotjarByMarket);
  const [hotjarSourceByMarket, setHotjarSourceByMarket] = useState<Record<Market, SourceState>>(allFixtureSource);
  const [hotjarWarningsByMarket, setHotjarWarningsByMarket] = useState<ByMarket<string>>({});

  const [crmRowsByMarket, setCrmRowsByMarket] = useState<ByMarket<CRMRow>>(initialCrmByMarket);
  const [crmSourceByMarket, setCrmSourceByMarket] = useState<Record<Market, SourceState>>(allFixtureSource);
  const [crmWarningsByMarket, setCrmWarningsByMarket] = useState<ByMarket<string>>({});

  const [mycpRowsByMarket, setMycpRowsByMarket] = useState<ByMarket<MyCpRow>>({});
  const [mycpWarningsByMarket, setMycpWarningsByMarket] = useState<ByMarket<string>>({});

  const [medalliaRows, setMedalliaRowsState] = useState<MedalliaRow[]>([]);
  const [medalliaWarnings, setMedalliaWarnings] = useState<string[]>([]);
  const [medalliaSource, setMedalliaSource] = useState<SingleFileUploadState>('static');

  const [brandMonitoringRows, setBrandMonitoringRowsState] = useState<BrandMonitoringRow[]>(buildStaticBrandMonitoringRows);
  const [brandMonitoringWarnings, setBrandMonitoringWarnings] = useState<string[]>([]);
  const [brandMonitoringSource, setBrandMonitoringSource] = useState<SingleFileUploadState>('static');

  const hotjarRows = useMemo(() => flatten(hotjarRowsByMarket), [hotjarRowsByMarket]);
  const hotjarSource: SourceState = MARKETS.some((m) => hotjarSourceByMarket[m] === 'upload') ? 'upload' : 'fixture';

  const crmRows = useMemo(() => flatten(crmRowsByMarket), [crmRowsByMarket]);
  const crmSource: SourceState = MARKETS.some((m) => crmSourceByMarket[m] === 'upload') ? 'upload' : 'fixture';

  const mycpRows = useMemo(() => flatten(mycpRowsByMarket), [mycpRowsByMarket]);
  const mycpCoherent = isMyCpDataCoherent(mycpRowsByMarket);
  const mycpBaseline = useMemo(
    () => (mycpCoherent ? computeMyCpBaselineFromRows(mycpRowsByMarket) : MYCP_BASELINE_APRIL_2026),
    [mycpCoherent, mycpRowsByMarket],
  );

  const medalliaBaseline = useMemo(
    () => (medalliaSource === 'upload' ? computeMedalliaBaselineFromRows(medalliaRows) : MEDALLIA_BASELINE_APRIL_2026),
    [medalliaSource, medalliaRows],
  );

  const value: DataState & DataActions = {
    hotjarRowsByMarket,
    hotjarSourceByMarket,
    hotjarWarningsByMarket,
    hotjarRows,
    hotjarSource,

    crmRowsByMarket,
    crmSourceByMarket,
    crmWarningsByMarket,
    crmRows,
    crmSource,

    mycpRowsByMarket,
    mycpWarningsByMarket,
    mycpRows,
    mycpBaseline,
    mycpSource: mycpCoherent ? 'upload' : 'static',

    medalliaRows,
    medalliaWarnings,
    medalliaSource,
    medalliaBaseline,

    brandMonitoringRows,
    brandMonitoringWarnings,
    brandMonitoringSource,

    setHotjarMarketRows: (market, rows, warnings) => {
      setHotjarRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setHotjarSourceByMarket((prev) => ({ ...prev, [market]: 'upload' }));
      setHotjarWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
    },
    setCrmMarketRows: (market, rows, warnings) => {
      setCrmRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setCrmSourceByMarket((prev) => ({ ...prev, [market]: 'upload' }));
      setCrmWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
    },
    setMyCpMarketRows: (market, rows, warnings) => {
      setMycpRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setMycpWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
    },
    setMedalliaRows: (rows, warnings) => {
      setMedalliaRowsState(rows);
      setMedalliaWarnings(warnings);
      setMedalliaSource('upload');
    },
    setBrandMonitoringRows: (rows, warnings) => {
      setBrandMonitoringRowsState(rows);
      setBrandMonitoringWarnings(warnings);
      setBrandMonitoringSource('upload');
    },
    resetToFixtures: () => {
      setHotjarRowsByMarket(initialHotjarByMarket());
      setHotjarSourceByMarket(allFixtureSource());
      setHotjarWarningsByMarket({});
      setCrmRowsByMarket(initialCrmByMarket());
      setCrmSourceByMarket(allFixtureSource());
      setCrmWarningsByMarket({});
      setMycpRowsByMarket({});
      setMycpWarningsByMarket({});
      setMedalliaRowsState([]);
      setMedalliaWarnings([]);
      setMedalliaSource('static');
      setBrandMonitoringRowsState(buildStaticBrandMonitoringRows());
      setBrandMonitoringWarnings([]);
      setBrandMonitoringSource('static');
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives with its context on purpose
export function useDashboardData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDashboardData must be used within a DataProvider');
  return ctx;
}

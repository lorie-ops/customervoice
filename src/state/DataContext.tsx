import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { hotjarRows as fixtureHotjarRows, crmRows as fixtureCrmRows } from '../lib/fixtures';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import { computeMyCpBaselineFromRows, isMyCpDataCoherent } from '../lib/calculations';
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
/** Upload-only sources with no fixture/baseline fallback (Medallia, Brand Monitoring). */
type UploadState = 'not-loaded' | 'partial' | 'complete';

type ByMarket<T> = Partial<Record<Market, T[]>>;

function groupByMarket<T>(rows: T[], marketOf: (row: T) => Market): ByMarket<T> {
  const result: ByMarket<T> = {};
  for (const market of MARKETS) result[market] = rows.filter((row) => marketOf(row) === market);
  return result;
}

function flatten<T>(byMarket: ByMarket<T>): T[] {
  return MARKETS.flatMap((market) => byMarket[market] ?? []);
}

function computeUploadState<T>(byMarket: ByMarket<T>): UploadState {
  const loadedCount = MARKETS.filter((market) => (byMarket[market]?.length ?? 0) > 0).length;
  if (loadedCount === 0) return 'not-loaded';
  if (loadedCount === MARKETS.length) return 'complete';
  return 'partial';
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

  medalliaRowsByMarket: ByMarket<MedalliaRow>;
  medalliaWarningsByMarket: ByMarket<string>;
  medalliaRows: MedalliaRow[];
  medalliaSource: UploadState;

  brandMonitoringRowsByMarket: ByMarket<BrandMonitoringRow>;
  brandMonitoringWarningsByMarket: ByMarket<string>;
  brandMonitoringRows: BrandMonitoringRow[];
  brandMonitoringSource: UploadState;
};

type DataActions = {
  setHotjarMarketRows: (market: Market, rows: HotjarRow[], warnings: string[]) => void;
  setCrmMarketRows: (market: Market, rows: CRMRow[], warnings: string[]) => void;
  setMyCpMarketRows: (market: Market, rows: MyCpRow[], warnings: string[]) => void;
  setMedalliaMarketRows: (market: Market, rows: MedalliaRow[], warnings: string[]) => void;
  setBrandMonitoringMarketRows: (market: Market, rows: BrandMonitoringRow[], warnings: string[]) => void;
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
 * - Medallia/Brand Monitoring: new sources, no fixture and no static
 *   baseline - they start empty ("not-loaded") and accumulate per-market
 *   uploads. Medallia is never merged with MyCP (non-merge rule,
 *   docs/DATA_MODEL_ADDENDUM.md §3).
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

  const [medalliaRowsByMarket, setMedalliaRowsByMarket] = useState<ByMarket<MedalliaRow>>({});
  const [medalliaWarningsByMarket, setMedalliaWarningsByMarket] = useState<ByMarket<string>>({});

  const [brandMonitoringRowsByMarket, setBrandMonitoringRowsByMarket] = useState<ByMarket<BrandMonitoringRow>>({});
  const [brandMonitoringWarningsByMarket, setBrandMonitoringWarningsByMarket] = useState<ByMarket<string>>({});

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

  const medalliaRows = useMemo(() => flatten(medalliaRowsByMarket), [medalliaRowsByMarket]);
  const medalliaSource = useMemo(() => computeUploadState(medalliaRowsByMarket), [medalliaRowsByMarket]);

  const brandMonitoringRows = useMemo(() => flatten(brandMonitoringRowsByMarket), [brandMonitoringRowsByMarket]);
  const brandMonitoringSource = useMemo(
    () => computeUploadState(brandMonitoringRowsByMarket),
    [brandMonitoringRowsByMarket],
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

    medalliaRowsByMarket,
    medalliaWarningsByMarket,
    medalliaRows,
    medalliaSource,

    brandMonitoringRowsByMarket,
    brandMonitoringWarningsByMarket,
    brandMonitoringRows,
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
    setMedalliaMarketRows: (market, rows, warnings) => {
      setMedalliaRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setMedalliaWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
    },
    setBrandMonitoringMarketRows: (market, rows, warnings) => {
      setBrandMonitoringRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setBrandMonitoringWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
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
      setMedalliaRowsByMarket({});
      setMedalliaWarningsByMarket({});
      setBrandMonitoringRowsByMarket({});
      setBrandMonitoringWarningsByMarket({});
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

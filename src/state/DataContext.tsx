import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { hotjarRows as fixtureHotjarRows, crmRows as fixtureCrmRows } from '../lib/fixtures';
import { MYCP_BASELINE_APRIL_2026 } from '../lib/mycpBaseline';
import { computeMyCpBaselineFromRows, isMyCpDataCoherent } from '../lib/calculations';
import type { CRMRow, HotjarRow, Market, MyCpBaseline, MyCpRow } from '../types';

type SourceState = 'fixture' | 'upload';

type DataState = {
  hotjarRows: HotjarRow[];
  hotjarSource: SourceState;
  hotjarWarnings: string[];
  crmRows: CRMRow[];
  crmSource: SourceState;
  crmWarnings: string[];
  mycpRowsByMarket: Partial<Record<Market, MyCpRow[]>>;
  mycpWarningsByMarket: Partial<Record<Market, string[]>>;
  mycpBaseline: MyCpBaseline;
  mycpSource: 'static' | 'upload';
};

type DataActions = {
  setHotjarRows: (rows: HotjarRow[], warnings: string[]) => void;
  setCrmRows: (rows: CRMRow[], warnings: string[]) => void;
  setMyCpMarketRows: (market: Market, rows: MyCpRow[], warnings: string[]) => void;
  resetToFixtures: () => void;
};

const DataContext = createContext<(DataState & DataActions) | null>(null);

/**
 * Central data state for the dashboard (docs/BACKLOG.md Phase 6). Defaults
 * to local fixtures / the validated static MyCP baseline (CLAUDE.md
 * "Display validated static MyCP data immediately"). Uploading a real
 * Hotjar or CRM file replaces the fixture immediately. MyCP is stricter:
 * the static baseline stays active until all six market files are loaded
 * and coherent (CLAUDE.md "Data loading" rules) - see isMyCpDataCoherent.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [hotjarRows, setHotjarRowsState] = useState<HotjarRow[]>(fixtureHotjarRows);
  const [hotjarSource, setHotjarSource] = useState<SourceState>('fixture');
  const [hotjarWarnings, setHotjarWarnings] = useState<string[]>([]);

  const [crmRows, setCrmRowsState] = useState<CRMRow[]>(fixtureCrmRows);
  const [crmSource, setCrmSource] = useState<SourceState>('fixture');
  const [crmWarnings, setCrmWarnings] = useState<string[]>([]);

  const [mycpRowsByMarket, setMycpRowsByMarket] = useState<Partial<Record<Market, MyCpRow[]>>>({});
  const [mycpWarningsByMarket, setMycpWarningsByMarket] = useState<Partial<Record<Market, string[]>>>({});

  const mycpCoherent = isMyCpDataCoherent(mycpRowsByMarket);
  const mycpBaseline = useMemo(
    () => (mycpCoherent ? computeMyCpBaselineFromRows(mycpRowsByMarket) : MYCP_BASELINE_APRIL_2026),
    [mycpCoherent, mycpRowsByMarket],
  );

  const value: DataState & DataActions = {
    hotjarRows,
    hotjarSource,
    hotjarWarnings,
    crmRows,
    crmSource,
    crmWarnings,
    mycpRowsByMarket,
    mycpWarningsByMarket,
    mycpBaseline,
    mycpSource: mycpCoherent ? 'upload' : 'static',
    setHotjarRows: (rows, warnings) => {
      setHotjarRowsState(rows);
      setHotjarSource('upload');
      setHotjarWarnings(warnings);
    },
    setCrmRows: (rows, warnings) => {
      setCrmRowsState(rows);
      setCrmSource('upload');
      setCrmWarnings(warnings);
    },
    setMyCpMarketRows: (market, rows, warnings) => {
      setMycpRowsByMarket((prev) => ({ ...prev, [market]: rows }));
      setMycpWarningsByMarket((prev) => ({ ...prev, [market]: warnings }));
    },
    resetToFixtures: () => {
      setHotjarRowsState(fixtureHotjarRows);
      setHotjarSource('fixture');
      setHotjarWarnings([]);
      setCrmRowsState(fixtureCrmRows);
      setCrmSource('fixture');
      setCrmWarnings([]);
      setMycpRowsByMarket({});
      setMycpWarningsByMarket({});
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

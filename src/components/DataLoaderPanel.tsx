import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck, RotateCcw, Upload } from 'lucide-react';
import { useDashboardData } from '../state/DataContext';
import { parseHotjarWorkbook } from '../lib/parsers/hotjarParser';
import { parseCrmWorkbook } from '../lib/parsers/crmParser';
import { parseMyCpWorkbook } from '../lib/parsers/mycpParser';
import { parseMedalliaWorkbook } from '../lib/parsers/medalliaParser';
import { parseBrandMonitoringWorkbook } from '../lib/parsers/brandMonitoringParser';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import type { Market } from '../types';
import './DataLoaderPanel.css';

type MarketCardStatus = {
  /** true = this market shows real uploaded data right now. */
  loaded: boolean;
  /** Short line under the market label, e.g. "128 rows" or "Using fixture". */
  detail: string;
  warnings?: string[];
};

/**
 * One "source" block: a title, a one-line overall status, and a 6-market
 * grid of file inputs. Shared by all 5 sources (docs/BACKLOG.md Phase 6,
 * expanded per business feedback: every source loads one file per market,
 * matching the original MyCP pattern).
 */
function SourceMarketGrid({
  title,
  statusLine,
  getStatus,
  onFile,
}: {
  title: string;
  statusLine: string;
  getStatus: (market: Market) => MarketCardStatus;
  onFile: (market: Market, file: File) => void;
}) {
  return (
    <div className="data-loader__source-block">
      <p className="data-loader__label">
        {title} - one file per market ({statusLine})
      </p>
      <div className="data-loader__mycp-grid">
        {MARKETS.map((market) => {
          const status = getStatus(market);
          return (
            <div className="data-loader__mycp-market" key={market}>
              <p className="data-loader__mycp-market-label">
                {status.loaded ? (
                  <CircleCheck size={14} aria-hidden="true" color="var(--cv-green)" />
                ) : (
                  <CircleAlert size={14} aria-hidden="true" color="var(--cv-text-muted)" />
                )}
                {MARKET_LABELS[market]}
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => event.target.files?.[0] && onFile(market, event.target.files[0])}
              />
              <p className="filter-note">{status.detail}</p>
              {status.warnings && status.warnings.length > 0 ? (
                <p className="filter-note">{status.warnings.length} warning(s)</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * File loading UI (docs/BACKLOG.md Phase 6, expanded to all 5 sources).
 * Loading state and data quality are always visible (CLAUDE.md "Data
 * loading" rules) - this bar is present whenever the dashboard is open,
 * not hidden behind a modal.
 */
export function DataLoaderPanel() {
  const [open, setOpen] = useState(false);
  // Bumped on reset so file inputs remount and clear their displayed
  // filename - the underlying data state resets regardless of this.
  const [resetKey, setResetKey] = useState(0);
  const data = useDashboardData();

  function handleReset() {
    data.resetToFixtures();
    setResetKey((k) => k + 1);
  }

  async function handleHotjarFile(market: Market, file: File) {
    const { rows, warnings } = parseHotjarWorkbook(await file.arrayBuffer());
    data.setHotjarMarketRows(market, rows, warnings);
  }

  async function handleCrmFile(market: Market, file: File) {
    const { rows, warnings } = parseCrmWorkbook(await file.arrayBuffer());
    data.setCrmMarketRows(market, rows, warnings);
  }

  async function handleMyCpFile(market: Market, file: File) {
    const { rows, warnings } = parseMyCpWorkbook(await file.arrayBuffer(), market);
    data.setMyCpMarketRows(market, rows, warnings);
  }

  async function handleMedalliaFile(market: Market, file: File) {
    const { rows, warnings } = parseMedalliaWorkbook(await file.arrayBuffer(), market);
    data.setMedalliaMarketRows(market, rows, warnings);
  }

  async function handleBrandMonitoringFile(market: Market, file: File) {
    const { rows, warnings } = parseBrandMonitoringWorkbook(await file.arrayBuffer(), market);
    data.setBrandMonitoringMarketRows(market, rows, warnings);
  }

  return (
    <div className="data-loader">
      <button type="button" className="data-loader__toggle" onClick={() => setOpen((o) => !o)}>
        <Upload size={14} aria-hidden="true" />
        <span>
          Data sources: Web {data.hotjarSource === 'upload' ? `live upload (${data.hotjarRows.length})` : 'fixture'} · MyCP{' '}
          {data.mycpSource === 'upload' ? 'live upload (6/6 markets)' : 'validated static baseline'} · CRM{' '}
          {data.crmSource === 'upload' ? `live upload (${data.crmRows.length})` : 'fixture'} · Brand Monitoring{' '}
          {data.brandMonitoringSource === 'not-loaded' ? 'not connected' : `${data.brandMonitoringRows.length} rows`} · Medallia{' '}
          {data.medalliaSource === 'not-loaded' ? 'not connected' : `${data.medalliaRows.length} rows`}
        </span>
        {open ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
      </button>

      {open && (
        <div className="data-loader__body" key={resetKey}>
          <SourceMarketGrid
            title="Web (Hotjar)"
            statusLine={
              data.hotjarSource === 'upload'
                ? 'some markets on live upload, others on fixture until uploaded'
                : 'all markets on local fixture (synthetic)'
            }
            getStatus={(market) => {
              const rows = data.hotjarRowsByMarket[market] ?? [];
              const uploaded = data.hotjarSourceByMarket[market] === 'upload';
              return {
                loaded: uploaded,
                detail: uploaded ? `Uploaded - ${rows.length} rows` : `${rows.length} rows (fixture)`,
                warnings: data.hotjarWarningsByMarket[market],
              };
            }}
            onFile={handleHotjarFile}
          />

          <SourceMarketGrid
            title="MyCP"
            statusLine={
              data.mycpSource === 'upload'
                ? 'live upload active - all 6 markets loaded and coherent'
                : 'validated static baseline active until all 6 markets are loaded'
            }
            getStatus={(market) => {
              const rows = data.mycpRowsByMarket[market];
              return {
                loaded: Boolean(rows),
                detail: rows ? `${rows.length} rows` : 'Not loaded',
                warnings: data.mycpWarningsByMarket[market],
              };
            }}
            onFile={handleMyCpFile}
          />

          <SourceMarketGrid
            title="CRM"
            statusLine={
              data.crmSource === 'upload'
                ? 'some markets on live upload, others on fixture until uploaded'
                : 'all markets on local fixture (synthetic)'
            }
            getStatus={(market) => {
              const rows = data.crmRowsByMarket[market] ?? [];
              const uploaded = data.crmSourceByMarket[market] === 'upload';
              return {
                loaded: uploaded,
                detail: uploaded ? `Uploaded - ${rows.length} rows` : `${rows.length} rows (fixture)`,
                warnings: data.crmWarningsByMarket[market],
              };
            }}
            onFile={handleCrmFile}
          />

          <SourceMarketGrid
            title="Brand Monitoring"
            statusLine={
              data.brandMonitoringSource === 'not-loaded'
                ? 'no market connected yet - planned source'
                : `${data.brandMonitoringSource === 'complete' ? 'all 6' : 'some'} markets loaded`
            }
            getStatus={(market) => {
              const rows = data.brandMonitoringRowsByMarket[market];
              return {
                loaded: Boolean(rows),
                detail: rows ? `${rows.length} rows` : 'Not loaded',
                warnings: data.brandMonitoringWarningsByMarket[market],
              };
            }}
            onFile={handleBrandMonitoringFile}
          />

          <SourceMarketGrid
            title="Medallia (after stay survey)"
            statusLine={
              data.medalliaSource === 'not-loaded'
                ? 'no market connected yet - planned source, never merged with MyCP'
                : `${data.medalliaSource === 'complete' ? 'all 6' : 'some'} markets loaded`
            }
            getStatus={(market) => {
              const rows = data.medalliaRowsByMarket[market];
              return {
                loaded: Boolean(rows),
                detail: rows ? `${rows.length} rows` : 'Not loaded',
                warnings: data.medalliaWarningsByMarket[market],
              };
            }}
            onFile={handleMedalliaFile}
          />

          <button type="button" className="data-loader__reset" onClick={handleReset}>
            <RotateCcw size={13} aria-hidden="true" /> Reset to fixtures / static baseline
          </button>
        </div>
      )}
    </div>
  );
}


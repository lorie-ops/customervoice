import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck, RotateCcw, Upload } from 'lucide-react';
import { useDashboardData } from '../state/DataContext';
import { parseHotjarWorkbook } from '../lib/parsers/hotjarParser';
import { parseCrmWorkbook } from '../lib/parsers/crmParser';
import { parseMyCpWorkbook } from '../lib/parsers/mycpParser';
import { MARKETS, MARKET_LABELS } from '../constants/markets';
import type { Market } from '../types';
import './DataLoaderPanel.css';

/**
 * File loading UI (docs/BACKLOG.md Phase 6). Loading state and data
 * quality are always visible (CLAUDE.md "Data loading" rules) - this bar
 * is present whenever the dashboard is open, not hidden behind a modal.
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

  async function handleHotjarFile(file: File) {
    const { rows, warnings } = parseHotjarWorkbook(await file.arrayBuffer());
    data.setHotjarRows(rows, warnings);
  }

  async function handleCrmFile(file: File) {
    const { rows, warnings } = parseCrmWorkbook(await file.arrayBuffer());
    data.setCrmRows(rows, warnings);
  }

  async function handleMyCpFile(market: Market, file: File) {
    const { rows, warnings } = parseMyCpWorkbook(await file.arrayBuffer(), market);
    data.setMyCpMarketRows(market, rows, warnings);
  }

  return (
    <div className="data-loader">
      <button type="button" className="data-loader__toggle" onClick={() => setOpen((o) => !o)}>
        <Upload size={14} aria-hidden="true" />
        <span>
          Data sources: Hotjar {data.hotjarSource === 'upload' ? `uploaded (${data.hotjarRows.length})` : 'fixture'} · CRM{' '}
          {data.crmSource === 'upload' ? `uploaded (${data.crmRows.length})` : 'fixture'} · MyCP{' '}
          {data.mycpSource === 'upload' ? 'live upload (6/6 markets)' : 'validated static baseline'}
        </span>
        {open ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
      </button>

      {open && (
        <div className="data-loader__body" key={resetKey}>
          <div className="data-loader__row">
            <div className="data-loader__source">
              <p className="data-loader__label">Hotjar</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => event.target.files?.[0] && handleHotjarFile(event.target.files[0])}
              />
              <p className="filter-note">
                {data.hotjarSource === 'upload'
                  ? `Using uploaded file - ${data.hotjarRows.length} rows`
                  : 'Using local fixture (synthetic)'}
              </p>
              {data.hotjarWarnings.length > 0 && (
                <ul className="data-loader__warnings">
                  {data.hotjarWarnings.slice(0, 5).map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                  {data.hotjarWarnings.length > 5 ? <li>+{data.hotjarWarnings.length - 5} more</li> : null}
                </ul>
              )}
            </div>

            <div className="data-loader__source">
              <p className="data-loader__label">CRM</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => event.target.files?.[0] && handleCrmFile(event.target.files[0])}
              />
              <p className="filter-note">
                {data.crmSource === 'upload'
                  ? `Using uploaded file - ${data.crmRows.length} rows`
                  : 'Using local fixture (synthetic)'}
              </p>
              {data.crmWarnings.length > 0 && (
                <ul className="data-loader__warnings">
                  {data.crmWarnings.slice(0, 5).map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                  {data.crmWarnings.length > 5 ? <li>+{data.crmWarnings.length - 5} more</li> : null}
                </ul>
              )}
            </div>
          </div>

          <div>
            <p className="data-loader__label">
              MyCP - one file per market ({data.mycpSource === 'upload'
                ? 'live upload active - all 6 markets loaded and coherent'
                : 'validated static baseline active until all 6 markets are loaded'}
              )
            </p>
            <div className="data-loader__mycp-grid">
              {MARKETS.map((market) => {
                const rows = data.mycpRowsByMarket[market];
                const warnings = data.mycpWarningsByMarket[market] ?? [];
                return (
                  <div className="data-loader__mycp-market" key={market}>
                    <p className="data-loader__mycp-market-label">
                      {rows ? (
                        <CircleCheck size={14} aria-hidden="true" color="var(--cv-green)" />
                      ) : (
                        <CircleAlert size={14} aria-hidden="true" color="var(--cv-text-muted)" />
                      )}
                      {MARKET_LABELS[market]}
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(event) => event.target.files?.[0] && handleMyCpFile(market, event.target.files[0])}
                    />
                    <p className="filter-note">{rows ? `${rows.length} rows` : 'Not loaded'}</p>
                    {warnings.length > 0 ? <p className="filter-note">{warnings.length} warning(s)</p> : null}
                  </div>
                );
              })}
            </div>
          </div>

          <button type="button" className="data-loader__reset" onClick={handleReset}>
            <RotateCcw size={13} aria-hidden="true" /> Reset to fixtures / static baseline
          </button>
        </div>
      )}
    </div>
  );
}

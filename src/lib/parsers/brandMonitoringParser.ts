import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MARKETS } from '../../constants/markets';
import { BRAND_IMAGE_ATTRIBUTES, CP_IMAGE_STATEMENTS } from '../../constants/brandMonitoring';
import type { BrandMonitoringRow, Market } from '../../types';
import type { ParseResult } from './hotjarParser';

const ALIASES = {
  id: ['id', 'row id'],
  brand: ['brand', 'brand name'],
  year: ['year', 'wave', 'survey year'],
  market: ['market', 'country'],
  awarenessTotal: ['awareness total', 'total awareness', 'awareness'],
  awarenessSpontaneous: ['awareness spontaneous', 'spontaneous awareness', 'unaided awareness'],
  awarenessAided: ['awareness aided', 'aided awareness', 'prompted awareness'],
  awarenessTopOfMind: ['top of mind', 'top of mind awareness', 'tom'],
  consideration: ['consideration'],
  preference: ['preference'],
  shortList: ['short list', 'shortlist'],
  user: ['user', 'usage'],
  repeater: ['repeater', 'repeat visitor'],
  loyal: ['loyal', 'loyalty'],
};

/**
 * Parses a Brand Monitor XLSX/CSV export into BrandMonitoringRow[].
 *
 * Exception to every other source in this prototype: Brand Monitoring is
 * delivered as ONE file covering all 6 markets (business feedback), not
 * one file per market. The market for each row therefore comes from the
 * file's own market/country column, which is required here (unlike
 * mycpParser.ts/medalliaParser.ts, where market is assigned by the
 * per-market upload slot and an in-file column is only a cross-check).
 * One row per (market, brand, year) so Center Parcs and competitor
 * benchmark rows share the same file. Brand Image / CP Image columns are
 * matched against the reference attribute lists in
 * constants/brandMonitoring.ts (this prototype's best-effort
 * reconstruction, pending a real export - see that file's own note)
 * rather than hardcoded positions, so a real file with a subset of those
 * columns still parses.
 */
export function parseBrandMonitoringWorkbook(data: ArrayBuffer): ParseResult<BrandMonitoringRow> {
  const warnings: string[] = [];
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  if (raw.length === 0) {
    return { rows: [], warnings: ['File has no data rows.'] };
  }

  const cols = {
    id: findColumn(raw[0], ALIASES.id),
    brand: findColumn(raw[0], ALIASES.brand),
    year: findColumn(raw[0], ALIASES.year),
    market: findColumn(raw[0], ALIASES.market),
    awarenessTotal: findColumn(raw[0], ALIASES.awarenessTotal),
    awarenessSpontaneous: findColumn(raw[0], ALIASES.awarenessSpontaneous),
    awarenessAided: findColumn(raw[0], ALIASES.awarenessAided),
    awarenessTopOfMind: findColumn(raw[0], ALIASES.awarenessTopOfMind),
    consideration: findColumn(raw[0], ALIASES.consideration),
    preference: findColumn(raw[0], ALIASES.preference),
    shortList: findColumn(raw[0], ALIASES.shortList),
    user: findColumn(raw[0], ALIASES.user),
    repeater: findColumn(raw[0], ALIASES.repeater),
    loyal: findColumn(raw[0], ALIASES.loyal),
  };

  const brandImageCols = BRAND_IMAGE_ATTRIBUTES.map((attr) => ({ attr, col: findColumn(raw[0], [attr]) })).filter(
    (c) => c.col,
  );
  const cpImageCols = CP_IMAGE_STATEMENTS.map((stmt) => ({ stmt, col: findColumn(raw[0], [stmt]) })).filter(
    (c) => c.col,
  );

  if (!cols.brand || !cols.year || !cols.market) {
    warnings.push(
      `Could not find required columns (brand, year, market) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }
  if (brandImageCols.length === 0 && cpImageCols.length === 0) {
    warnings.push(
      'No Brand Image or Center Parcs Image attribute columns were recognized - see constants/brandMonitoring.ts for the expected labels.',
    );
  }

  const numOrUndefined = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const rows: BrandMonitoringRow[] = [];
  raw.forEach((record, index) => {
    const market = String(record[cols.market!] ?? '').trim().toUpperCase();
    if (!MARKETS.includes(market as Market)) {
      warnings.push(`Row ${index + 2}: unrecognized or missing market "${market}" - skipped.`);
      return;
    }
    const brand = String(record[cols.brand!] ?? '').trim();
    const year = Number(record[cols.year!]);
    if (!brand || !Number.isFinite(year)) {
      warnings.push(`Row ${index + 2}: missing brand or year - skipped.`);
      return;
    }

    const brandImage: Record<string, number> = {};
    for (const { attr, col } of brandImageCols) {
      const value = numOrUndefined(record[col!]);
      if (value !== undefined) brandImage[attr] = value;
    }
    const cpImage: Record<string, number> = {};
    for (const { stmt, col } of cpImageCols) {
      const value = numOrUndefined(record[col!]);
      if (value !== undefined) cpImage[stmt] = value;
    }

    rows.push({
      id: cols.id ? String(record[cols.id] ?? `brand-${market}-${index}`) : `brand-${market}-${index}`,
      market: market as Market,
      year,
      brand,
      awarenessTotal: numOrUndefined(cols.awarenessTotal ? record[cols.awarenessTotal] : undefined),
      awarenessSpontaneous: numOrUndefined(cols.awarenessSpontaneous ? record[cols.awarenessSpontaneous] : undefined),
      awarenessAided: numOrUndefined(cols.awarenessAided ? record[cols.awarenessAided] : undefined),
      awarenessTopOfMind: numOrUndefined(cols.awarenessTopOfMind ? record[cols.awarenessTopOfMind] : undefined),
      consideration: numOrUndefined(cols.consideration ? record[cols.consideration] : undefined),
      preference: numOrUndefined(cols.preference ? record[cols.preference] : undefined),
      shortList: numOrUndefined(cols.shortList ? record[cols.shortList] : undefined),
      user: numOrUndefined(cols.user ? record[cols.user] : undefined),
      repeater: numOrUndefined(cols.repeater ? record[cols.repeater] : undefined),
      loyal: numOrUndefined(cols.loyal ? record[cols.loyal] : undefined),
      brandImage,
      cpImage,
      source: 'BrandMonitoring',
    });
  });

  return { rows, warnings };
}

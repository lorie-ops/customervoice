import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MARKETS } from '../../constants/markets';
import type { CRMRow, Market } from '../../types';
import type { ParseResult } from './hotjarParser';

const ALIASES = {
  id: ['id', 'row id', 'ticket id'],
  date: ['date', 'contact date'],
  market: ['market', 'country'],
  campaign: ['campaign', 'campaign name'],
  sentiment: ['sentiment'],
  positiveText: ['positive text', 'positive comment', 'positive', 'positive verbatim'],
  negativeText: ['negative text', 'negative comment', 'negative', 'negative verbatim'],
  device: ['device'],
};

const VALID_SENTIMENTS = ['positive', 'negative', 'neutral'];

/**
 * Parses a CRM XLSX/CSV export into CRMRow[] (docs/BACKLOG.md Phase 6).
 * See hotjarParser.ts for the tolerant-header-matching approach.
 */
export function parseCrmWorkbook(data: ArrayBuffer): ParseResult<CRMRow> {
  const warnings: string[] = [];
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  if (raw.length === 0) {
    return { rows: [], warnings: ['File has no data rows.'] };
  }

  const cols = {
    id: findColumn(raw[0], ALIASES.id),
    date: findColumn(raw[0], ALIASES.date),
    market: findColumn(raw[0], ALIASES.market),
    campaign: findColumn(raw[0], ALIASES.campaign),
    sentiment: findColumn(raw[0], ALIASES.sentiment),
    positiveText: findColumn(raw[0], ALIASES.positiveText),
    negativeText: findColumn(raw[0], ALIASES.negativeText),
    device: findColumn(raw[0], ALIASES.device),
  };

  if (!cols.date || !cols.market || !cols.sentiment) {
    warnings.push(
      `Could not find required columns (date, market, sentiment) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }

  const rows: CRMRow[] = [];
  raw.forEach((record, index) => {
    const market = String(record[cols.market!] ?? '').trim().toUpperCase();
    if (!MARKETS.includes(market as Market)) {
      warnings.push(`Row ${index + 2}: unrecognized market "${market}" - skipped.`);
      return;
    }
    const sentiment = String(record[cols.sentiment!] ?? '').trim().toLowerCase();
    if (!VALID_SENTIMENTS.includes(sentiment)) {
      warnings.push(`Row ${index + 2}: unrecognized sentiment "${sentiment}" - skipped.`);
      return;
    }
    const date = String(record[cols.date!] ?? '').trim();
    if (!date) {
      warnings.push(`Row ${index + 2}: missing date - skipped.`);
      return;
    }
    rows.push({
      id: cols.id ? String(record[cols.id] ?? `crm-${index}`) : `crm-${index}`,
      date,
      market: market as Market,
      campaign: cols.campaign ? String(record[cols.campaign] ?? '') || undefined : undefined,
      sentiment: sentiment as CRMRow['sentiment'],
      positiveText: cols.positiveText ? String(record[cols.positiveText] ?? '') || undefined : undefined,
      negativeText: cols.negativeText ? String(record[cols.negativeText] ?? '') || undefined : undefined,
      device: cols.device ? String(record[cols.device] ?? '') || undefined : undefined,
    });
  });

  return { rows, warnings };
}

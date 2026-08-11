import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MARKETS } from '../../constants/markets';
import type { Market, MedalliaRow } from '../../types';
import type { ParseResult } from './hotjarParser';

const ALIASES = {
  id: ['id', 'row id', 'response id'],
  date: ['date', 'response date', 'survey date'],
  market: ['market', 'country'],
  score: ['score', 'nps score', 'recommendation score', 'overall score'],
  returnIntent: ['return intent', 'would you return', 'intent to return', 'revisit intent'],
  comment: ['comment', 'verbatim', 'feedback', 'message'],
};

const RETURN_INTENT_VALUES: Record<string, MedalliaRow['returnIntent']> = {
  yes: 'yes',
  no: 'no',
  unsure: 'unsure',
  'not sure': 'unsure',
};

/**
 * Parses a single-market Medallia (after-stay survey) XLSX/CSV export into
 * MedalliaRow[]. Deliberately its own parser/type, never merged with MyCP
 * (non-merge rule, docs/DATA_MODEL_ADDENDUM.md §3) - same shape convention
 * as mycpParser.ts (0-10 scale, one file per market, in-file market column
 * cross-checked against the upload assignment) but kept structurally
 * separate. Column aliases are this prototype's best guess pending a real
 * export.
 */
export function parseMedalliaWorkbook(data: ArrayBuffer, market: Market): ParseResult<MedalliaRow> {
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
    score: findColumn(raw[0], ALIASES.score),
    returnIntent: findColumn(raw[0], ALIASES.returnIntent),
    comment: findColumn(raw[0], ALIASES.comment),
  };

  if (!cols.date || !cols.score) {
    warnings.push(
      `Could not find required columns (date, score) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }

  const rows: MedalliaRow[] = [];
  raw.forEach((record, index) => {
    if (cols.market) {
      const inFileMarket = String(record[cols.market] ?? '').trim().toUpperCase();
      if (inFileMarket && MARKETS.includes(inFileMarket as Market) && inFileMarket !== market) {
        warnings.push(`Row ${index + 2}: file market column says "${inFileMarket}" but this file was assigned to ${market} - skipped.`);
        return;
      }
    }
    const date = String(record[cols.date!] ?? '').trim();
    const rawScore = record[cols.score!];
    const score = rawScore === null || rawScore === undefined || rawScore === '' ? null : Number(rawScore);
    if (!date || score === null || !Number.isFinite(score)) {
      warnings.push(`Row ${index + 2}: missing date or score - skipped.`);
      return;
    }
    const rawIntent = cols.returnIntent ? String(record[cols.returnIntent] ?? '').trim().toLowerCase() : '';
    const returnIntent = rawIntent ? RETURN_INTENT_VALUES[rawIntent] : undefined;
    if (rawIntent && !returnIntent) {
      warnings.push(`Row ${index + 2}: unrecognized return intent "${rawIntent}" - left unset.`);
    }
    rows.push({
      id: cols.id ? String(record[cols.id] ?? `medallia-${market}-${index}`) : `medallia-${market}-${index}`,
      date,
      market,
      score,
      returnIntent,
      comment: cols.comment ? String(record[cols.comment] ?? '') || undefined : undefined,
      source: 'Medallia',
    });
  });

  return { rows, warnings };
}

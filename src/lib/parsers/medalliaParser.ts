import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MEDALLIA_PROPERTY_MARKET } from '../../constants/medalliaProperties';
import type { MedalliaRow } from '../../types';
import type { ParseResult } from './hotjarParser';

const ALIASES = {
  id: ['id', 'row id', 'response id'],
  date: ['date', 'responsedate', 'response date'],
  property: ['property', 'site', 'resort', 'park'],
  score: ['nps cp', 'score', 'nps score', 'recommendation score', 'total nps'],
  overallSatisfaction: ['overall satisfaction cp', 'overall satisfaction', 'satisfaction'],
  returnIntent: ['return intent mark', 'return intent'],
  checkin: ['checkin general', 'check-in general'],
  village: ['village general'],
  cottage: ['cottage comfort', 'cottage general'],
  aquamundo: ['aquamundo general', 'aqua mundo general'],
  catering: ['catering general'],
  comment: ['final comments', 'general impression', 'what went wrong or should be improved?', 'comment'],
};

const RETURN_INTENT_VALUES: Record<string, MedalliaRow['returnIntent']> = {
  yes: 'Yes',
  probably: 'Probably',
  'probably not': 'Probably not',
  no: 'No',
};

/**
 * Parses a Medallia EQS export into MedalliaRow[].
 *
 * Exception like brandMonitoringParser.ts: Medallia is delivered as ONE
 * file covering all 6 markets (confirmed against a real export -
 * EQS_extract_April_26_1.xlsx, 21,707 rows), not one file per market.
 * The export has no market column of its own - market is derived from
 * the row's "Property" (resort) via constants/medalliaProperties.ts,
 * since Belgium's BEFR/BENL split depends on which specific resort the
 * response is about. Column aliases match that real export's headers
 * (see lib/medalliaExtraction.ts for the same file's aggregate numbers).
 * Never merged with MyCP (non-merge rule, docs/DATA_MODEL_ADDENDUM.md §3).
 */
export function parseMedalliaWorkbook(data: ArrayBuffer): ParseResult<MedalliaRow> {
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
    property: findColumn(raw[0], ALIASES.property),
    score: findColumn(raw[0], ALIASES.score),
    overallSatisfaction: findColumn(raw[0], ALIASES.overallSatisfaction),
    returnIntent: findColumn(raw[0], ALIASES.returnIntent),
    checkin: findColumn(raw[0], ALIASES.checkin),
    village: findColumn(raw[0], ALIASES.village),
    cottage: findColumn(raw[0], ALIASES.cottage),
    aquamundo: findColumn(raw[0], ALIASES.aquamundo),
    catering: findColumn(raw[0], ALIASES.catering),
    comment: findColumn(raw[0], ALIASES.comment),
  };

  if (!cols.date || !cols.score || !cols.property) {
    warnings.push(
      `Could not find required columns (date, property, score) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }

  const numOrUndefined = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const rows: MedalliaRow[] = [];
  raw.forEach((record, index) => {
    const property = String(record[cols.property!] ?? '').trim();
    const market = MEDALLIA_PROPERTY_MARKET[property];
    if (!market) {
      warnings.push(`Row ${index + 2}: unrecognized property "${property}" - not in constants/medalliaProperties.ts, skipped.`);
      return;
    }
    const date = String(record[cols.date!] ?? '').trim();
    const score = numOrUndefined(record[cols.score!]);
    if (!date || score === undefined) {
      warnings.push(`Row ${index + 2}: missing date or score - skipped.`);
      return;
    }
    const rawIntent = cols.returnIntent ? String(record[cols.returnIntent] ?? '').trim().toLowerCase() : '';
    const returnIntent = rawIntent ? RETURN_INTENT_VALUES[rawIntent] : undefined;
    if (rawIntent && !returnIntent) {
      warnings.push(`Row ${index + 2}: unrecognized return intent "${rawIntent}" - left unset.`);
    }
    rows.push({
      id: cols.id ? String(record[cols.id] ?? `medallia-${index}`) : `medallia-${index}`,
      date,
      market,
      property,
      score,
      overallSatisfaction: cols.overallSatisfaction ? numOrUndefined(record[cols.overallSatisfaction]) : undefined,
      returnIntent,
      checkin: cols.checkin ? numOrUndefined(record[cols.checkin]) : undefined,
      village: cols.village ? numOrUndefined(record[cols.village]) : undefined,
      cottage: cols.cottage ? numOrUndefined(record[cols.cottage]) : undefined,
      aquamundo: cols.aquamundo ? numOrUndefined(record[cols.aquamundo]) : undefined,
      catering: cols.catering ? numOrUndefined(record[cols.catering]) : undefined,
      comment: cols.comment ? String(record[cols.comment] ?? '') || undefined : undefined,
      source: 'Medallia',
    });
  });

  return { rows, warnings };
}

import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MARKETS } from '../../constants/markets';
import type { JourneyStage, Market, MyCpRow } from '../../types';
import type { ParseResult } from './hotjarParser';

const ALIASES = {
  id: ['id', 'row id', 'response id'],
  date: ['date', 'response date'],
  market: ['market', 'country'],
  score: ['score', 'nps score', 'recommendation score', 'overall score'],
  sorryVerbatim: ['sorry', 'what are you sorry about', 'apology', 'what went wrong'],
  improveVerbatim: ['improve', 'what could we improve', 'improvement'],
  optimizeVerbatim: ['optimize', 'what could we optimize', 'optimization', 'what worked well'],
  journeyStage: ['journey stage', 'stage', 'moment', 'journey'],
};

const JOURNEY_STAGE_VALUES: Record<string, JourneyStage> = {
  before: 'before',
  'before stay': 'before',
  during: 'during',
  'during stay': 'during',
  after: 'after',
  'after stay': 'after',
};

/**
 * Parses a single-market MyCP XLSX/CSV export into MyCpRow[] (docs/BACKLOG.md
 * Phase 6). A real MyCP export is one file per market, so `market` is the
 * market assigned to this file in the upload UI - a market column in the
 * file (if present) is cross-checked against it, never silently trusted
 * over the assignment, since a mismatch would corrupt the per-market
 * baseline. Verbatim column aliases are this prototype's best guess,
 * pending a real export to validate against.
 */
export function parseMyCpWorkbook(data: ArrayBuffer, market: Market): ParseResult<MyCpRow> {
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
    sorryVerbatim: findColumn(raw[0], ALIASES.sorryVerbatim),
    improveVerbatim: findColumn(raw[0], ALIASES.improveVerbatim),
    optimizeVerbatim: findColumn(raw[0], ALIASES.optimizeVerbatim),
    journeyStage: findColumn(raw[0], ALIASES.journeyStage),
  };

  if (!cols.date || !cols.score) {
    warnings.push(
      `Could not find required columns (date, score) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }

  const rows: MyCpRow[] = [];
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
    // Score 0 is a valid detractor - only null/undefined/blank are treated as missing.
    const score = rawScore === null || rawScore === undefined || rawScore === '' ? null : Number(rawScore);
    if (!date || score === null || !Number.isFinite(score)) {
      warnings.push(`Row ${index + 2}: missing date or score - skipped.`);
      return;
    }
    const rawStage = cols.journeyStage
      ? String(record[cols.journeyStage] ?? '').trim().toLowerCase()
      : '';
    const journeyStage = rawStage ? JOURNEY_STAGE_VALUES[rawStage] : undefined;
    if (rawStage && !journeyStage) {
      warnings.push(`Row ${index + 2}: unrecognized journey stage "${rawStage}" - left unset (shown as Unknown).`);
    }

    rows.push({
      id: cols.id ? String(record[cols.id] ?? `mycp-${market}-${index}`) : `mycp-${market}-${index}`,
      date,
      market,
      score,
      sorryVerbatim: cols.sorryVerbatim ? String(record[cols.sorryVerbatim] ?? '') || undefined : undefined,
      improveVerbatim: cols.improveVerbatim ? String(record[cols.improveVerbatim] ?? '') || undefined : undefined,
      optimizeVerbatim: cols.optimizeVerbatim ? String(record[cols.optimizeVerbatim] ?? '') || undefined : undefined,
      source: 'MyCP',
      journeyStage,
    });
  });

  return { rows, warnings };
}

import * as XLSX from 'xlsx';
import { findColumn } from './normalizeHeader';
import { MARKETS } from '../../constants/markets';
import type { Category, HotjarRow, Market } from '../../types';

export type ParseResult<T> = {
  rows: T[];
  /** Row-level issues (skipped rows, unrecognized values) - shown in the loading status UI, never silent. */
  warnings: string[];
};

const ALIASES = {
  id: ['id', 'row id', 'response id', 'hotjar id'],
  date: ['date', 'response date', 'submitted', 'submitted at'],
  country: ['country', 'market'],
  device: ['device', 'device type'],
  score: ['score', 'rating', 'web score', 'nps score'],
  message: ['message', 'comment', 'feedback', 'verbatim', 'response'],
  tags: ['tags', 'tag'],
  surveyType: ['survey type', 'survey', 'survey name'],
  sourceUrl: ['source url', 'url', 'page url', 'page'],
  category: ['category', 'topic'],
};

function coerceScore(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Parses a Hotjar XLSX/CSV export into HotjarRow[] (docs/BACKLOG.md Phase
 * 6). Header matching is tolerant (see normalizeHeader.ts) since this
 * prototype has no real sample export to match exactly - column aliases
 * above are this prototype's best guess and may need adjusting against a
 * real file.
 */
export function parseHotjarWorkbook(data: ArrayBuffer): ParseResult<HotjarRow> {
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
    country: findColumn(raw[0], ALIASES.country),
    device: findColumn(raw[0], ALIASES.device),
    score: findColumn(raw[0], ALIASES.score),
    message: findColumn(raw[0], ALIASES.message),
    tags: findColumn(raw[0], ALIASES.tags),
    surveyType: findColumn(raw[0], ALIASES.surveyType),
    sourceUrl: findColumn(raw[0], ALIASES.sourceUrl),
    category: findColumn(raw[0], ALIASES.category),
  };

  if (!cols.date || !cols.country || !cols.message) {
    warnings.push(
      `Could not find required columns (date, country, message) by header name. Detected headers: ${Object.keys(raw[0]).join(', ')}`,
    );
    return { rows: [], warnings };
  }

  const rows: HotjarRow[] = [];
  raw.forEach((record, index) => {
    const country = String(record[cols.country!] ?? '').trim().toUpperCase();
    if (!MARKETS.includes(country as Market)) {
      warnings.push(`Row ${index + 2}: unrecognized market "${country}" - skipped.`);
      return;
    }
    const date = String(record[cols.date!] ?? '').trim();
    const message = String(record[cols.message!] ?? '').trim();
    if (!date || !message) {
      warnings.push(`Row ${index + 2}: missing date or message - skipped.`);
      return;
    }
    rows.push({
      id: cols.id ? String(record[cols.id] ?? `hotjar-${index}`) : `hotjar-${index}`,
      date,
      country: country as Market,
      device: cols.device ? String(record[cols.device] ?? '') || undefined : undefined,
      score: cols.score ? coerceScore(record[cols.score]) : null,
      message,
      tags: cols.tags
        ? String(record[cols.tags] ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      scope: 'Web',
      surveyType: cols.surveyType ? String(record[cols.surveyType] ?? '') || undefined : undefined,
      sourceUrl: cols.sourceUrl ? String(record[cols.sourceUrl] ?? '') || undefined : undefined,
      category: cols.category ? (String(record[cols.category] ?? '') as Category) || undefined : undefined,
    });
  });

  return { rows, warnings };
}

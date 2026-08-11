import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseHotjarWorkbook } from './hotjarParser';
import { parseCrmWorkbook } from './crmParser';
import { parseMyCpWorkbook } from './mycpParser';
import { normalizeHeader } from './normalizeHeader';

function toWorkbookBuffer(rows: Record<string, unknown>[]): ArrayBuffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  const out = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return out as ArrayBuffer;
}

describe('normalizeHeader', () => {
  it('strips accents, case, and punctuation for tolerant matching', () => {
    expect(normalizeHeader('Date de réponse')).toBe('datedereponse');
    expect(normalizeHeader('  Score (1-5) ')).toBe('score15');
  });
});

describe('parseHotjarWorkbook', () => {
  it('parses rows with aliased headers and coerces a blank score to null', () => {
    const buffer = toWorkbookBuffer([
      { Date: '2026-04-01', Country: 'FR', Message: 'Great site', Score: 4 },
      { Date: '2026-04-02', Country: 'FR', Message: 'No opinion', Score: '' },
    ]);
    const { rows, warnings } = parseHotjarWorkbook(buffer);
    expect(rows).toHaveLength(2);
    expect(rows[0].score).toBe(4);
    expect(rows[1].score).toBeNull();
    expect(warnings).toHaveLength(0);
  });

  it('skips rows with an unrecognized market and warns', () => {
    const buffer = toWorkbookBuffer([{ Date: '2026-04-01', Country: 'US', Message: 'Hi' }]);
    const { rows, warnings } = parseHotjarWorkbook(buffer);
    expect(rows).toHaveLength(0);
    expect(warnings[0]).toMatch(/unrecognized market/);
  });

  it('reports a warning and returns no rows when required columns are missing', () => {
    const buffer = toWorkbookBuffer([{ Foo: 'bar' }]);
    const { rows, warnings } = parseHotjarWorkbook(buffer);
    expect(rows).toHaveLength(0);
    expect(warnings[0]).toMatch(/Could not find required columns/);
  });
});

describe('parseCrmWorkbook', () => {
  it('parses valid sentiment values and rejects unrecognized ones', () => {
    const buffer = toWorkbookBuffer([
      { Date: '2026-04-01', Market: 'DE', Sentiment: 'Positive' },
      { Date: '2026-04-02', Market: 'DE', Sentiment: 'furious' },
    ]);
    const { rows, warnings } = parseCrmWorkbook(buffer);
    expect(rows).toHaveLength(1);
    expect(rows[0].sentiment).toBe('positive');
    expect(warnings[0]).toMatch(/unrecognized sentiment/);
  });
});

describe('parseMyCpWorkbook', () => {
  it('does not drop a score of 0 - the most important MyCP parsing rule', () => {
    const buffer = toWorkbookBuffer([
      { Date: '2026-04-01', Score: 0 },
      { Date: '2026-04-02', Score: 10 },
    ]);
    const { rows, warnings } = parseMyCpWorkbook(buffer, 'FR');
    expect(rows).toHaveLength(2);
    expect(rows[0].score).toBe(0);
    expect(warnings).toHaveLength(0);
  });

  it('skips a row whose in-file market column conflicts with the assigned market', () => {
    const buffer = toWorkbookBuffer([{ Date: '2026-04-01', Score: 8, Market: 'DE' }]);
    const { rows, warnings } = parseMyCpWorkbook(buffer, 'FR');
    expect(rows).toHaveLength(0);
    expect(warnings[0]).toMatch(/assigned to FR/);
  });

  it('detects verbatim columns by normalized header', () => {
    const buffer = toWorkbookBuffer([{ Date: '2026-04-01', Score: 9, 'What Could We Improve': 'Faster wifi' }]);
    const { rows } = parseMyCpWorkbook(buffer, 'FR');
    expect(rows[0].improveVerbatim).toBe('Faster wifi');
  });
});

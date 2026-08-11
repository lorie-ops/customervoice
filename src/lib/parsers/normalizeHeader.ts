/**
 * Normalizes an XLSX column header for tolerant matching: lowercase,
 * strip accents, collapse anything that isn't a letter/digit. This is
 * how "Detect MyCP verbatim columns by normalized headers" (docs/BACKLOG.md
 * Phase 6) is implemented - and reused for Hotjar/CRM headers too, so a
 * real export's exact spelling/spacing/accents don't break the parser.
 */
export function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Finds the first row key whose normalized header matches one of the
 * given aliases (also normalized). Returns undefined if none match.
 */
export function findColumn(row: Record<string, unknown>, aliases: string[]): string | undefined {
  const normalizedAliases = new Set(aliases.map(normalizeHeader));
  return Object.keys(row).find((key) => normalizedAliases.has(normalizeHeader(key)));
}

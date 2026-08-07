/**
 * Real integration status of each data source in this prototype - not a
 * fixture (this is truthful app metadata, not sample data). Used on the
 * Customer Journey entry page. Medallia is intentionally "planned": real
 * aggregated data exists (medallia_aggregated.json) but is not integrated
 * per the non-merge rule (docs/DATA_MODEL_ADDENDUM.md §3).
 */
export type SourceStatus = 'available' | 'planned';
export type HotCold = 'hot' | 'cold';

export type SourceInfo = {
  id: string;
  label: string;
  status: SourceStatus;
  note: string;
  hotCold: HotCold;
};

export const SOURCES: SourceInfo[] = [
  {
    id: 'hotjar',
    label: 'Web / Hotjar',
    status: 'available',
    note: 'Local fixture (synthetic) - real export wired in Phase 6.',
    hotCold: 'hot',
  },
  {
    id: 'crm',
    label: 'CRM',
    status: 'available',
    note: 'Local fixture (synthetic) - real export wired in Phase 6.',
    hotCold: 'cold',
  },
  {
    id: 'mycp',
    label: 'MyCP',
    status: 'available',
    note: 'Validated static April 2026 baseline - global/per-market only, not touchpoint-level.',
    hotCold: 'cold',
  },
  {
    id: 'medallia',
    label: 'Medallia',
    status: 'planned',
    note: 'Real aggregated data exists (21,707 responses, April 2026) but is intentionally not integrated yet - never merged with MyCP.',
    hotCold: 'cold',
  },
  {
    id: 'brand-monitoring',
    label: 'Brand Monitoring',
    status: 'planned',
    note: 'No source connected yet in this prototype.',
    hotCold: 'cold',
  },
];

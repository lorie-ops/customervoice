/**
 * Real integration status of each data source in this prototype - not a
 * fixture (this is truthful app metadata, not sample data). Used on the
 * Customer Journey entry page. Medallia is intentionally "planned": real
 * aggregated data exists (medallia_aggregated.json) but is not integrated
 * per the non-merge rule (docs/DATA_MODEL_ADDENDUM.md §3).
 *
 * Hot/Cold classification: Hot = collected in real time / in-situ during
 * the moment being measured (Web/Hotjar, MyCP, MIA WhatsApp). Cold =
 * collected retrospectively, after the moment (CRM, Medallia, Brand
 * Monitoring).
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
    note: 'Local fixture (synthetic) - real export wired in Phase 6, one file per market.',
    hotCold: 'hot',
  },
  {
    id: 'mycp',
    label: 'MyCP',
    status: 'available',
    note: 'Validated static April 2026 baseline until all 6 market files are loaded and coherent.',
    hotCold: 'hot',
  },
  {
    id: 'mia-whatsapp',
    label: 'MIA WhatsApp',
    status: 'planned',
    note: 'Future in-situ source, collected during the stay via WhatsApp - not built yet in this prototype.',
    hotCold: 'hot',
  },
  {
    id: 'crm',
    label: 'CRM',
    status: 'available',
    note: 'Local fixture (synthetic) - real export wired in Phase 6, one file per market.',
    hotCold: 'cold',
  },
  {
    id: 'medallia',
    label: 'Medallia',
    status: 'planned',
    note: 'After-stay survey. Real aggregated data exists (21,707 responses, April 2026) but is intentionally not integrated yet - never merged with MyCP.',
    hotCold: 'cold',
  },
  {
    id: 'brand-monitoring',
    label: 'Brand Monitoring',
    status: 'planned',
    note: 'Annual brand health survey (awareness, consideration, image) - no source connected yet in this prototype.',
    hotCold: 'cold',
  },
];

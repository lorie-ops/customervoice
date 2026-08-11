/**
 * Reference attribute lists for the Brand Monitoring parser and tab.
 *
 * These labels are this prototype's best-effort reconstruction of a
 * typical annual brand tracking study structure (12 Brand Image
 * attributes, ~24 Center Parcs Image perception statements), proposed
 * after reading Brand_Monitor_2026_Analysis_1.pdf - that PDF is an
 * extraction/summary only and explicitly states the underlying numbers
 * live in "Brand Monitor 2026.xls", which this prototype has not been
 * given. Nothing here is validated data; it exists so the XLSX parser has
 * a known set of column-header aliases to match against, and so the tab
 * can render a real (if currently empty) structure instead of an
 * unstructured placeholder. Update this list once a real export is
 * available - do not treat it as final.
 */

export const BRAND_IMAGE_ATTRIBUTES: string[] = [
  'Family-friendly',
  'Value for money',
  'Quality of accommodation',
  'Nature & greenery',
  'Wide range of activities',
  'Reliable / trustworthy',
  'Relaxing',
  'Premium / high-end',
  'Convenient location',
  'Good for short breaks',
  'Innovative',
  'Environmentally responsible',
];

export const CP_IMAGE_STATEMENTS: string[] = [
  'Center Parcs is a brand I trust',
  'Center Parcs offers good value for money',
  'Center Parcs is suitable for families with young children',
  'Center Parcs accommodation is high quality',
  'Center Parcs parks are close to nature',
  'Center Parcs has a wide range of activities for all ages',
  'Center Parcs is a relaxing place to stay',
  'Center Parcs is easy to book',
  'Center Parcs is good value compared to competitors',
  'Center Parcs is a premium brand',
  'Center Parcs is close to where I live',
  'Center Parcs is ideal for a short break',
  'Center Parcs is innovative',
  'Center Parcs cares about the environment',
  'Center Parcs has excellent customer service',
  'Center Parcs is a brand for all seasons',
  'Center Parcs facilities are well maintained',
  'Center Parcs is a place I would recommend to friends/family',
  'Center Parcs offers something for every generation',
  'Center Parcs villages feel safe and secure',
  'Center Parcs is different from other holiday parks',
  'Center Parcs communication reflects my expectations',
  'Center Parcs is a brand I would return to',
  'Center Parcs is easy to reach by car',
];

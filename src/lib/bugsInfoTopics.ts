import type { Category, HotjarRow } from '../types';

/**
 * Bugs & Info topic taxonomy (docs/PROJECT_SPEC.md). This maps the
 * validated Hotjar `Category` values onto the 7 Missing-Information
 * topics shown in the UI. This mapping is this prototype's own choice,
 * not yet validated - the Product project lead should confirm or extend
 * the Category taxonomy before this is treated as final
 * (docs/OWNERSHIP_MATRIX.md "Ce qu'il/elle doit valider").
 *
 * Report counts and example verbatims below are derived live from real
 * fixture rows, never invented. Only the recommendation text is
 * synthetic placeholder guidance (clearly marked).
 */
export type MissingInfoTopic =
  | 'Activity Schedule and Booking'
  | 'Arrival and Check-in'
  | 'Pricing and Fees'
  | 'Cottage and Amenities'
  | 'Booking and Cancellation Policy'
  | 'Contact and Support'
  | 'Loyalty';

export const MISSING_INFO_TOPICS: MissingInfoTopic[] = [
  'Activity Schedule and Booking',
  'Arrival and Check-in',
  'Pricing and Fees',
  'Cottage and Amenities',
  'Booking and Cancellation Policy',
  'Contact and Support',
  'Loyalty',
];

const DIRECT_CATEGORY_MAP: Partial<Record<Category, MissingInfoTopic>> = {
  'Reservation / Booking': 'Activity Schedule and Booking',
  'Activities & Leisure': 'Activity Schedule and Booking',
  'Payment / Price': 'Pricing and Fees',
  'Cottage & Equipment': 'Cottage and Amenities',
  'Customer Service': 'Contact and Support',
  'Account / Login': 'Contact and Support',
};

/**
 * `Missing Information` rows need a keyword sub-split since that one
 * category spans several topics. Returns null when no keyword matches -
 * the row still counts toward the top-level "Missing Information
 * Reports" KPI, just not toward a specific topic row.
 */
function topicForMissingInfoRow(row: HotjarRow): MissingInfoTopic | null {
  const text = row.message.toLowerCase();
  if (text.includes('check-in')) return 'Arrival and Check-in';
  if (text.includes('cancellation')) return 'Booking and Cancellation Policy';
  if (text.includes('pet')) return 'Cottage and Amenities';
  return null;
}

export function getMissingInfoTopic(row: HotjarRow): MissingInfoTopic | null {
  if (row.category === 'Missing Information') return topicForMissingInfoRow(row);
  if (row.category) return DIRECT_CATEGORY_MAP[row.category] ?? null;
  return null;
}

/** Real rows for a topic, from the Hotjar fixture - used for count and example verbatim. */
export function rowsForTopic(rows: HotjarRow[], topic: MissingInfoTopic): HotjarRow[] {
  return rows.filter((row) => getMissingInfoTopic(row) === topic);
}

/**
 * SYNTHETIC placeholder recommendation text per topic - illustrative
 * guidance only, to be replaced by the Product project lead.
 */
export const TOPIC_RECOMMENDATIONS: Record<MissingInfoTopic, string> = {
  'Activity Schedule and Booking':
    'Create a dedicated "Activities" section visible in My Booking, with a live availability calendar.',
  'Arrival and Check-in':
    'Send a dedicated arrival guide email a few days before check-in with access codes and check-in instructions.',
  'Pricing and Fees': 'Show a clear pricing breakdown on the booking page, including all fees, before checkout.',
  'Cottage and Amenities': 'Add a detailed equipment list and pet policy to each property page.',
  'Booking and Cancellation Policy':
    'Display cancellation conditions clearly at every step - booking, confirmation, and booking summary.',
  'Contact and Support': 'Add a visible "Contact us" entry point with expected response times.',
  Loyalty: 'No fixture signal yet for this topic - Product project lead to confirm whether loyalty info is missing.',
};

/**
 * SYNTHETIC placeholder action text for the top technical issues -
 * illustrative guidance only, to be replaced by the Product project lead.
 */
export const TECHNICAL_ISSUE_ACTIONS: Record<string, string> = {
  'Page crashed when I clicked on activities tab.':
    'Dev team: reproduce the activities-tab crash and add error boundary + retry logic.',
  'Site is very slow on mobile during checkout.':
    'Dev team: profile the mobile checkout flow for slow network calls and reduce payload size.',
  'Login button does nothing on Safari.': 'Dev team: cross-browser test the login button on Safari and fix the handler.',
  'Booking confirmation email never arrived.':
    'Dev team: check the confirmation-email queue for delivery failures and add a resend option.',
  'The booking calendar froze when I tried to select dates.':
    'Dev team: investigate the booking calendar widget for a rendering/event-handling regression.',
};

export const DEFAULT_TECHNICAL_ISSUE_ACTION =
  'Dev team: triage by frequency, assign to the responsible squad, and add monitoring for this failure pattern.';

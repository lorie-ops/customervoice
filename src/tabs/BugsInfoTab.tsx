import { TabHeader } from '../components/TabHeader';
import { SectionPlaceholder } from '../components/SectionPlaceholder';

const TOPICS = [
  'Activity Schedule and Booking',
  'Arrival and Check-in',
  'Pricing and Fees',
  'Cottage and Amenities',
  'Booking and Cancellation Policy',
  'Contact and Support',
  'Loyalty',
];

/**
 * Bugs & Info tab - owned by the Product project lead (weekly backlog
 * prioritization). Section order follows docs/PROJECT_SPEC.md §2.
 */
export function BugsInfoTab() {
  return (
    <div role="tabpanel" id="tabpanel-bugs-info" aria-labelledby="tab-bugs-info">
      <TabHeader tabId="bugs-info" />

      <SectionPlaceholder
        title="Filters"
        description="Market, date range, and optional journeyStage filter (before/during/after) per docs/DATA_MODEL_ADDENDUM.md §1."
      />

      <SectionPlaceholder
        title="Bug Reports Detected"
        description="KPI count of rows categorized as 'Bug / Technical Error' in the Hotjar fixture."
      />

      <SectionPlaceholder
        title="Missing Information Reports"
        description="KPI count of rows categorized as 'Missing Information' in the Hotjar fixture."
      />

      <SectionPlaceholder
        title="Top 5 Technical Issues"
        description="Ranked list of the most frequent technical issues, from hotjar_fixture.json messages tagged 'bug'."
      />

      <SectionPlaceholder title="Missing Information - by Topic" description="One row per topic:">
        <ul className="topic-list">
          {TOPICS.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </SectionPlaceholder>

      <SectionPlaceholder
        title="Topic-Level Recommendation Cards"
        description="Recommendation cards per topic, each tagged with owner_role (docs/DATA_MODEL_ADDENDUM.md §4) - base for the product backlog discussion (docs/OWNERSHIP_MATRIX.md)."
      />
    </div>
  );
}

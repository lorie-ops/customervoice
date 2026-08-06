# Customer Voice Dashboard - Product Specification

## 1. Product objective

Create a local prototype that reproduces the historical Center Parcs Customer Voice Dashboard while separating data loading, calculations, and visual components.

The prototype must reproduce the five historical tabs and the visual hierarchy visible in the provided screenshots.

## 2. Historical layout reference

### Global header

- Brand mark area.
- Title: Customer Voice Dashboard.
- Subtitle with Hotjar volume, CRM volume, total signals, and last update date.
- Five tab navigation buttons.

### Overview tab

Sections in order:

1. Last Month Trends
2. KPI cards for Web, MyCP, CRM, and Post-stay
3. Global filters
4. Period A and Period B filters
5. Theme Distribution - Period A vs B
6. Top 3 Categories - Verbatim Summary
7. Frustration Focus - Top 3 pain points
8. Key Movements - Period A to B
9. Top 5 Recommendations

Filters:

- Source
- Market
- Scope
- Survey
- Period A start and end
- Period B start and end
- Presets: 7d, 30d, 90d, vs LY

### CRM tab

Sections in order:

1. Global Overview - last 7 days
2. KPI cards: total responses, positive rate, negative rate
3. Positive vs Negative rate - last 30 days by week
4. Filtered View
5. Filters: date range, 7d, 30d, 90d, market, campaign
6. Market Health Snapshot
7. Positive signals
8. Negative signals
9. Root cause
10. Action Plan with P1 and P2 actions

### CSAT tab

Sections in order:

1. Filters: period, market, scope
2. Global CSAT Scores
3. MyCP NPS by Country
4. Theme Analysis - Summary
5. Theme Deep Dive
6. Monthly Report - Slide Format

Filters:

- Start date
- End date
- 30d, 60d, 90d presets
- Market
- Scope: MyCP only, Web only, Web plus MyCP

The default scope is MyCP only.

### Bugs & Info tab

Sections in order:

1. Filters
2. Bug reports detected KPI
3. Missing information reports KPI
4. Top 5 Technical Issues
5. Missing Information - by Topic
6. Topic-level recommendation cards

Topics:

- Activity Schedule and Booking
- Arrival and Check-in
- Pricing and Fees
- Cottage and Amenities
- Booking and Cancellation Policy
- Contact and Support
- Loyalty

### Verbatims tab

Sections:

1. Hotjar raw verbatims table
2. CRM verbatims table
3. Search field
4. Source filter
5. Market filter
6. Sentiment filter
7. Date filter

## 3. Data sources for the prototype

Use local fixtures first:

- Hotjar fixture
- CRM fixture
- MyCP fixture
- Theme analysis fixture
- Recommendation fixture

The first version does not need live file upload or external API access.

## 4. Visual rules

- Light grey page background.
- White cards with subtle borders and rounded corners.
- Strong navy headings.
- Blue used for primary accents.
- Green used for positive metrics.
- Red used for negative metrics and bugs.
- Orange used for missing information and warnings.
- Purple may be used for MyCP or secondary comparison data.
- Keep charts readable and not overly dense.
- Preserve the vertical order of the historical dashboard.
- Use responsive layouts, but desktop is the first target.

## 5. Historical screenshot values

The screenshots are a layout reference. Some values visible in the old CSAT screenshot are not the validated April 2026 baseline. Do not copy those inconsistent values into the new calculations.

The validated MyCP baseline is documented in `CLAUDE.md` and `DATA_MODEL.md`.

## 6. Acceptance criteria

The first visual milestone is complete when:

- The app starts with `npm run dev`.
- The production build succeeds.
- All five tabs are clickable.
- Each tab has the expected section order.
- Fixture data renders without errors.
- Filters visibly update the displayed content.
- CSAT defaults to MyCP.
- MyCP NPS values match the validated baseline.
- No Hotjar score is interpreted as a MyCP score.
- Empty states are displayed when a filter returns no rows.
- The interface is usable at desktop width and does not overflow horizontally.

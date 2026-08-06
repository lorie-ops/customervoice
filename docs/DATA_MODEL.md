# Customer Voice Dashboard - Data Model

## HotjarRow

```ts
export type HotjarRow = {
  id: string;
  date: string;
  country: Market;
  device?: string;
  score?: number;
  message: string;
  tags?: string[];
  scope: 'Web';
  surveyType?: string;
  sourceUrl?: string;
  category?: Category;
};
```

## CRMRow

```ts
export type CRMRow = {
  id: string;
  date: string;
  market: Market;
  campaign?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveText?: string;
  negativeText?: string;
  device?: string;
};
```

## MyCPRow

```ts
export type MyCPRow = {
  id: string;
  date: string;
  market: Market;
  score: number;
  sorryVerbatim?: string;
  improveVerbatim?: string;
  optimizeVerbatim?: string;
  source: 'MyCP';
};
```

## Market

```ts
export type Market = 'FR' | 'NL' | 'DE' | 'BEFR' | 'BENL' | 'DK';
```

## Categories

```ts
export type Category =
  | 'Reservation / Booking'
  | 'Payment / Price'
  | 'Cottage & Equipment'
  | 'Bug / Technical Error'
  | 'Missing Information'
  | 'Activities & Leisure'
  | 'Customer Service'
  | 'Account / Login'
  | 'Other';
```

## NPS helpers

```ts
export function getMyCpBucket(score: number) {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

export function calculateNps(scores: number[]) {
  if (scores.length === 0) return null;

  const promoters = scores.filter((score) => score >= 9).length;
  const detractors = scores.filter((score) => score <= 6).length;

  return ((promoters / scores.length) - (detractors / scores.length)) * 100;
}
```

## Important calculation rules

- Do not remove MyCP score 0.
- Do remove unanswered Hotjar scores from score calculations.
- Do not calculate a single NPS from a mixed 1-to-5 and 0-to-10 dataset.
- Keep the scoring scale visible near the KPI or chart.
- Round displayed NPS to one decimal when needed.

## Validated MyCP baseline

```ts
export const validatedMyCpApril2026 = {
  global: {
    responses: 1124,
    average: 8.7,
    nps: 60,
  },
  markets: {
    DK: { responses: 18, average: 7.9, nps: 38.9 },
    BEFR: { responses: 28, average: 9.2, nps: 67.9 },
    BENL: { responses: 133, average: 8.6, nps: 57.1 },
    NL: { responses: 256, average: 8.9, nps: 62.9 },
    FR: { responses: 352, average: 8.7, nps: 61.1 },
    DE: { responses: 337, average: 8.7, nps: 57.6 },
  },
};
```

## Validated theme analysis

### Germany

- Payment and vouchers
- Add-ons
- Technical failures
- Booking flow clarity
- Support quality

### France

- Activity booking
- Navigation and filters
- Payment and credits
- Pricing and discounts
- Support follow-up

### Netherlands

- Add-ons
- Payment options
- Pricing
- Customer service
- Site navigation

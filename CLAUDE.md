# Customer Voice Dashboard

## Mission

Build a local React and TypeScript prototype that reproduces the historical Customer Voice Dashboard used for Center Parcs customer feedback analysis.

The screenshots are the visual reference. The validated business rules and data definitions in the project documentation are the source of truth for calculations.

## Product scope

The application has five tabs:

1. Overview
2. CRM
3. CSAT
4. Bugs & Info
5. Verbatims

## Technical stack

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- xlsx
- date-fns
- Vitest if tests are added

## Development rules

- Start with local fixtures. Do not connect to external systems in the first milestone.
- Keep the application modular. Do not create one large dashboard component.
- Keep calculations in pure functions separate from rendering.
- Keep data loading and parsing separate from UI components.
- Add or update tests when changing NPS, filtering, parsing, or aggregation logic.
- Run the build after every meaningful change.
- Do not silently change business rules.
- Do not mix Hotjar and MyCP scoring scales in a single NPS calculation.
- Use explicit empty states when data is missing.
- Use `Non applicable`, `Unknown`, or `To verify` rather than silently treating missing values as zero.
- Keep labels and copy in English for the prototype unless a task explicitly asks for French.
- Use accessible buttons, labels, tables, and form controls.
- Prefer simple CSS or Tailwind. Avoid unnecessary component libraries during the first milestone.

## Business rules

### Hotjar Web

- Score scale: 1 to 5.
- Missing or unanswered scores are excluded from score calculations.
- Average score is displayed on a 5-point scale.

### MyCP

- Score scale: 0 to 10.
- Score 0 is a valid detractor score.
- Promoters: 9 and 10.
- Passives: 7 and 8.
- Detractors: 0 to 6.
- NPS = promoter percentage minus detractor percentage.
- Average score is displayed on a 10-point scale.
- CSAT defaults to the MyCP scope.

### Data loading

- Display validated static MyCP data immediately.
- Do not replace static MyCP data when only one or a few XLSX files are loaded.
- Replace static data only when all six market files are loaded and the combined row count is coherent.
- Keep loading state and data quality state visible to the user.

## Validated MyCP April 2026 baseline

Global:

- Responses: 1124
- Average score: 8.7 / 10
- NPS: +60

Markets:

- DK: 18 responses, NPS +38.9, average 7.9
- BEFR: 28 responses, NPS +67.9, average 9.2
- BENL: 133 responses, NPS +57.1, average 8.6
- NL: 256 responses, NPS +62.9, average 8.9
- FR: 352 responses, NPS +61.1, average 8.7
- DE: 337 responses, NPS +57.6, average 8.7

April 2025 comparison values:

- FR: 60.6
- DE: 51.8
- NL: 58.3
- BEFR: 73.7
- BENL: 52.1
- DK: not available

## Markets

- FR
- NL
- DE
- BEFR
- BENL
- DK

## Expected commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

## Working method

Before coding:

1. Read `docs/PROJECT_SPEC.md`.
2. Read `docs/DATA_MODEL.md`.
3. Read `docs/BACKLOG.md`.
4. Inspect the current file tree.
5. Propose a small implementation plan.
6. Wait for approval before making large changes.

For each task:

1. State the files to be changed.
2. Implement the smallest coherent change.
3. Run the relevant tests.
4. Run the production build.
5. Report what changed and what remains.

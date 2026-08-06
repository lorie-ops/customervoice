# Customer Voice Dashboard

A React + TypeScript prototype that reproduces the historical Center Parcs
Customer Voice Dashboard: five tabs (Overview, CRM, CSAT, Bugs & Info,
Verbatims) built on local fixtures, with data loading, calculations, and
visual components kept separate.

See `CLAUDE.md` and `docs/` for the product spec, data model, and backlog
that drive this build. `docs/OWNERSHIP_MATRIX.md` maps each tab to the
business role that owns it.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

`npm run test` will be added once Vitest is introduced with the first real
calculation logic (Phase 3, per `CLAUDE.md`).

## Status

Phase 0 (app shell, five tabs, placeholder sections in historical order) is
in place. See `docs/BACKLOG.md` for the remaining phases.

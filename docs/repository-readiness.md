# Repository Readiness

Status: READY FOR SHIP CATALOG FOUNDATION (after small preparatory work)

Overview:
- Current architecture: domain-models (ship-model, combat-model), visualization-model, apps/ship-animator
- Visualization-layer now has `ShipVisualDefinition`, `HardpointDefinition`, and `WeaponVisualState` (Milestone 7)

Active packages:
- `packages/ship-model` — domain ship definitions
- `packages/combat-model` — combat event generation
- `packages/visualization-model` — visual transformation and types
- `packages/domain-validation` — validation framework (framework + examples)
- `apps/ship-animator` — renderer + playback engine

Archived / Historical:
- `docs/migration-criteria.md` — HISTORICAL (migration completed)
- `docs/firing-pattern-analysis.md` — REFERENCE (analysis retained)
- `docs/REALIGNMENT-SUMMARY.md` — ARCHIVE (Milestone 7 audit)

Known technical debt:
- No ship catalog or registry (app still configured for Augur only)
- Visual configs for additional ships not authored
- domain-validation lacks observed battle-log data (reports are placeholders)
- Playback scaling and layout are basic (acceptable for prototype)

Validation status (post-cleanup):
- `npm run demo:augur` — OK
- `npm run demo:visual` — OK
- `npm run demo:validation` — OK (no observed data)
- `npm run demo:two-ship` — OK

Next recommended milestone: Ship Catalog Foundation
- Scope (suggested): ship registry, ship selection UI, per-ship visual config files (3 example ships)
- Pre-work: author 2–3 additional `ShipVisualDefinition` files, add simple catalog export in `visualization-model/examples`

Notes:
- No generated artifacts were committed except for intentionally included source (compiled `dist/` was rebuilt earlier for domain-validation but removed from tracking and is now ignored)
- This repo is ready for the Ship Catalog Foundation work after adding a small ship registry and a couple of visual configs.

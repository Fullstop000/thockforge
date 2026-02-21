# AGENTS.md

This file defines repository-specific working rules for coding agents.

## Core Rules
- Add concise comments for key structs/functions and non-obvious logic.
- Handle errors explicitly; avoid silent failure paths.
- Keep architecture pragmatic; avoid speculative over-design.

## Project Priorities
- Keep a single rendering parameter source of truth.
- Preserve structure-grade realism for keycap/switch assemblies.
- Maintain 60 FPS as a hard constraint on mid-tier devices.

## Required Checks Before Delivery
```bash
npm run test
npm run lint
npm run build
```

## Important Docs (Must Read)
- Governance baseline: `docs/hifi-rendering-governance.md`
- Keycap/switch spec: `docs/keycap-switch-implementation-spec.md`
- Constraint-kinematic plan: `docs/constraint-kinematic-switch-realism-plan.md`
- Acceptance gate: `docs/rendering-acceptance-checklist.md`
- Domain model reference: `docs/domain-model.md`

## Change Discipline
- If adding/changing rendering parameters, update in one change:
  - `src/types`
  - `src/engine`
  - relevant `src/components`
  - `tests`
  - `docs`
- Do not add local duplicate mapping tables inside view components.
- Keep units consistent: meters in internal rendering math, mm only for UI display.

# ThockForge

High-fidelity mechanical keyboard simulation playground focused on:
- structure-grade keycap/switch rendering
- stable animation behavior
- 60 FPS on mid-tier devices

## Tech Stack
- Next.js 14 + React + TypeScript
- React Three Fiber + Drei
- Zustand state management

## Quick Start
```bash
npm install
npm run dev
```

## Scripts
```bash
npm run test
npm run lint
npm run build
```

## Project Structure
- `src/components/3d`: main 3D scene and assemblies
- `src/engine`: render parameter derivation and runtime logic
- `src/types`: domain and rendering models
- `docs`: governance, implementation specs, and acceptance checklists

## Documentation Index
- Rendering governance: `docs/hifi-rendering-governance.md`
- Keycap/switch implementation spec: `docs/keycap-switch-implementation-spec.md`
- Constraint-kinematic plan: `docs/constraint-kinematic-switch-realism-plan.md`
- Acceptance checklist: `docs/rendering-acceptance-checklist.md`
- Domain model: `docs/domain-model.md`

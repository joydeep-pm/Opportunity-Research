# S02: PM OS home and surface coherence

**Goal:** Tighten the top-level PM Knowledge OS experience so Home clearly exposes automation status and the primary surfaces feel workflow-first and internally consistent.
**Demo:** From the running app, Home presents signal brief, next step, automation status, and resume work; primary surfaces keep consistent PM Knowledge OS copy and navigation cues.

## Must-Haves

- Home includes visible automation status alongside the signal brief and next-step workflow.
- Primary surface copy and labels read as PM workflows rather than disconnected internal tools.

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `npm run build`
- `npm run test:e2e -- homepage.spec.ts navigation.spec.ts automation-panel.spec.ts`

## Observability / Diagnostics

- Runtime signals: automation health remains available via `/api/automation/health` and rendered on Home.
- Inspection surfaces: Home UI, sidebar navigation, Automation panel UI, existing E2E coverage.
- Failure visibility: missing automation prerequisites remain visible in the embedded status panel.
- Redaction constraints: no secret values rendered from health/config sources.

## Integration Closure

- Upstream surfaces consumed: `Dashboard`, `AutomationStatusPanel`, surface home components, app routing/layout.
- New wiring introduced in this slice: embedded automation visibility on Home and tighter PM OS labeling across primary surfaces.
- What remains before the milestone is truly usable end-to-end: signal route/runtime simplification and legacy workspace decomposition.

## Tasks

- [x] **T01: Embed automation status into Home** `est:30m`
  - Why: Home should expose automation status directly instead of requiring a separate workspace panel drill-in.
  - Files: `src/components/Dashboard.tsx`, `src/components/AutomationStatusPanel.tsx`
  - Do: Reuse the existing automation panel or a scoped variant on Home so the PM OS landing page includes signal brief, next step, automation status, and resume work in one coherent flow.
  - Verify: `npm run build`
  - Done when: Home visibly shows automation status without breaking layout or duplicating contradictory copy.
- [x] **T02: Normalize top-level PM workflow copy** `est:45m`
  - Why: The main surfaces should feel like one PM Knowledge OS rather than separate demos.
  - Files: `src/app/layout.tsx`, `src/components/SignalsHome.tsx`, `src/components/ResearchHome.tsx`, `src/components/WriteHome.tsx`, `src/components/VaultHome.tsx`
  - Do: Tighten naming, helper text, and navigation copy across primary surfaces to match the PM workflow model and reduce internal-tool framing.
  - Verify: `npm run build`
  - Done when: top-level copy is consistent and workflow-first across Home, Signals, Research, Write, and Vault.
- [x] **T03: Verify PM OS surface coherence** `est:30m`
  - Why: The slice is complete only if the updated surface contract works in the live app.
  - Files: `tests/e2e/homepage.spec.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/automation-panel.spec.ts`, `tasks/todo.md`
  - Do: Update or extend tests for Home automation visibility and workflow-first surface expectations, run targeted E2E, and record evidence.
  - Verify: `npm run test:e2e -- homepage.spec.ts navigation.spec.ts automation-panel.spec.ts`
  - Done when: targeted E2E passes and review evidence is captured in `tasks/todo.md`.

## Files Likely Touched

- `src/components/Dashboard.tsx`
- `src/components/AutomationStatusPanel.tsx`
- `src/app/layout.tsx`
- `src/components/SignalsHome.tsx`
- `src/components/ResearchHome.tsx`
- `src/components/WriteHome.tsx`
- `src/components/VaultHome.tsx`
- `tests/e2e/homepage.spec.ts`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/automation-panel.spec.ts`
- `tasks/todo.md`

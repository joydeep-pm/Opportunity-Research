# Claude Handoff (2026-03-07)

## 1) Current Objective
Continue the Knowledge Work Center roadmap without regressing UX/functionality.  
Latest user-approved direction:
- Keep the unified root Next.js app.
- Preserve all skill modules and antigravity shell behavior.
- Continue milestone work (PRD gating/download workflows and functional polish).

## 2) Repository + Branch State
- Repo: `/Users/joy/Opportunity Research`
- Branch: `main`
- Remote: `origin https://github.com/joydeep-pm/Opportunity-Research.git`
- Latest pushed commits:
  - `09b2794` Gate PRD generation behind explicit project initialization
  - `ca8728f` Stabilize skill dashboard UX and cross-skill context flow
  - `2f65aa8` Merge antigravity shell with full skill runtime

Working tree has many **untracked local artifacts** (notes, scratch dirs, local outputs).  
Do not delete/restructure those unless user asks.

## 3) What Is Working (Verified)
- Build: `npm run build` passes.
- E2E: `npm run test:e2e` passes (`15 passed`).
- Dashboard and tool routes are functional.
- Command bar now has a real input (`Command search`) and functional `Go`.
- Cross-skill context chaining works with SSR-safe storage guards.

## 4) Key Implemented Architecture
- Root router:
  - [`src/app/page.tsx`](/Users/joy/Opportunity%20Research/src/app/page.tsx)
  - Maps `?tool=` to skill IDs and renders embedded legacy runtime.
- Shell layout:
  - [`src/app/layout.tsx`](/Users/joy/Opportunity%20Research/src/app/layout.tsx)
  - Sidebar nav + header command input + launcher + right rail.
- Skill runtime + orchestration:
  - [`src/lib/legacy_page.tsx`](/Users/joy/Opportunity%20Research/src/lib/legacy_page.tsx)
  - All skills, output drawer, quick launch, chaining, seeded context.
- Context matrix:
  - [`src/lib/skillContext.ts`](/Users/joy/Opportunity%20Research/src/lib/skillContext.ts)
  - `SKILL_CHAINS`, hints, client-safe session storage guards.
- Signal APIs:
  - [`src/app/api/signal/refresh/route.ts`](/Users/joy/Opportunity%20Research/src/app/api/signal/refresh/route.ts)
  - [`src/app/api/signal/route.ts`](/Users/joy/Opportunity%20Research/src/app/api/signal/route.ts)
  - [`src/app/api/signal/state.ts`](/Users/joy/Opportunity%20Research/src/app/api/signal/state.ts)

## 5) PRD Gating Status (Important)
UI-level PRD gate has been added for Product Intelligence:
- In [`src/lib/legacy_page.tsx`](/Users/joy/Opportunity%20Research/src/lib/legacy_page.tsx):
  - `requiresInitialization: true` on `product` skill.
  - `Initialize Project` step requires project name + stack selection.
  - Run button disabled until initialized.

This is currently **client-side gating only** (not persisted via run IDs/API lock yet).

## 6) Known Gaps / Risks
1. PRD gate persistence is not yet implemented.
- Refresh/navigation resets in-memory initialization for that session/component.
- Not backed by run metadata or dedicated initialize endpoint.

2. Signal section format mismatch risk.
- Refresh route writes two-window markdown with headings (`## ...`).
- Read route parser prefers newsletter split by `---`; may collapse file-based reads to one section fallback.
- This does not fail tests but can degrade sectioned rendering after reload.

3. Project has many legacy/untracked folders/files.
- Keep commits scoped to app/runtime files to avoid accidental noise.

## 7) Environment Requirements
For signal refresh to work:
- `OPENAI_API_KEY` required.
- `OPENAI_MODEL` optional (default in code: `gpt-4.1-mini`).
- `SERPER_API_KEY` optional (improves freshness).
- Optional tuning:
  - `SIGNAL_START_DATE` or `SIGNAL_WINDOW_HOURS`
  - `SIGNAL_RSS_FEEDS`, `SERPER_QUERIES`, `SERPER_*`

If `OPENAI_API_KEY` is missing, `/api/signal/refresh` returns structured `500` (expected by tests).

## 8) Recommended Next Milestone (Immediate)
Implement server-backed PRD workflow (not just UI gating):
1. Add run-level initialization metadata persistence.
2. Enforce PRD generation guard in API (`409` when not initialized).
3. Expose documents/download endpoints (`md/json/pdf` + zip) for research/PRD artifacts.
4. Wire UI buttons to those endpoints and keep existing shell unchanged.
5. Add tests for gating transitions and download endpoint contracts.

## 9) Commands (Local)
```bash
cd "/Users/joy/Opportunity Research"
npm install
npm run build
npm run test:e2e
npm run dev
```

## 10) High-Signal Files To Read First
1. [`tasks/todo.md`](/Users/joy/Opportunity%20Research/tasks/todo.md)
2. [`src/lib/legacy_page.tsx`](/Users/joy/Opportunity%20Research/src/lib/legacy_page.tsx)
3. [`src/app/layout.tsx`](/Users/joy/Opportunity%20Research/src/app/layout.tsx)
4. [`src/lib/skillContext.ts`](/Users/joy/Opportunity%20Research/src/lib/skillContext.ts)
5. [`src/app/api/signal/refresh/route.ts`](/Users/joy/Opportunity%20Research/src/app/api/signal/refresh/route.ts)
6. [`tests/e2e/`](/Users/joy/Opportunity%20Research/tests/e2e)

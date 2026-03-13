# S01: Canonical signal automation status

**Goal:** Align the product, scripts, and runbook on one local signal scheduling path and surface that status clearly in the dashboard.
**Demo:** From the running app, the Automation panel shows the canonical schedule, log path, setup health, and docs that match the actual backend script/runbook behavior.

## Must-Haves

- Product copy, scripts, and runbook all agree on the same canonical signal automation path.
- Dashboard automation UI exposes actionable local status instead of placeholder messaging.

## Proof Level

- This slice proves: operational
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `npm run build`
- `npm run test:e2e -- automation-panel.spec.ts`

## Observability / Diagnostics

- Runtime signals: automation health JSON includes config, venv, log presence, and last run status.
- Inspection surfaces: `/api/automation/health`, Automation panel UI, `logs/digest_cron.log`.
- Failure visibility: missing env, missing venv, missing log, and latest failure status are visible.
- Redaction constraints: never expose secret values from `backend/.env` or logs.

## Integration Closure

- Upstream surfaces consumed: `backend/signal_engine.py`, `backend/setup_cron.sh`, `backend/run_daily_digest.sh`, `SIGNAL_ENGINE_RUNBOOK.md`, dashboard automation panel.
- New wiring introduced in this slice: unified automation copy and health status presentation in the Next.js app.
- What remains before the milestone is truly usable end-to-end: broader signal route/runtime simplification and dashboard PM OS positioning follow in later slices.

## Tasks

- [x] **T01: Audit and align signal automation truth** `est:30m`
  - Why: The repo currently contains conflicting signal scheduling and route guidance.
  - Files: `SIGNAL_ENGINE_RUNBOOK.md`, `backend/setup_cron.sh`, `backend/run_daily_digest.sh`, `src/lib/skills.ts`
  - Do: Verify the canonical local automation command, then update docs/scripts/product copy so they consistently point to the same schedule, log path, and preferred refresh path.
  - Verify: `rg -n "7:00 AM|digest_cron.log|signal_engine.py|python-refresh|refresh" SIGNAL_ENGINE_RUNBOOK.md backend/setup_cron.sh backend/run_daily_digest.sh src/lib/skills.ts -S`
  - Done when: all touched sources describe one consistent local automation setup.
- [x] **T02: Harden automation health and dashboard messaging** `est:45m`
  - Why: The app needs a reliable, user-visible automation status surface instead of ambiguous placeholder guidance.
  - Files: `src/app/api/automation/health/route.ts`, `src/components/AutomationStatusPanel.tsx`, `src/components/Dashboard.tsx`
  - Do: Ensure automation health returns stable, actionable status and update dashboard/automation panel copy to reflect PM Knowledge OS positioning and the canonical local schedule.
  - Verify: `npm run build`
  - Done when: the app builds and the automation panel text/status match the canonical setup.
- [x] **T03: Verify automation slice end-to-end** `est:30m`
  - Why: This slice is only done once the UI contract is exercised in the real app.
  - Files: `tests/e2e/automation-panel.spec.ts`, `tasks/todo.md`
  - Do: Keep or tighten E2E expectations for the automation panel, run targeted verification, and record evidence in `tasks/todo.md`.
  - Verify: `npm run test:e2e -- automation-panel.spec.ts`
  - Done when: targeted E2E passes and review evidence is captured in `tasks/todo.md`.

## Files Likely Touched

- `SIGNAL_ENGINE_RUNBOOK.md`
- `backend/setup_cron.sh`
- `backend/run_daily_digest.sh`
- `src/lib/skills.ts`
- `src/app/api/automation/health/route.ts`
- `src/components/AutomationStatusPanel.tsx`
- `src/components/Dashboard.tsx`
- `tests/e2e/automation-panel.spec.ts`
- `tasks/todo.md`

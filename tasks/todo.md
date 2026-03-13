# Opportunity Research Recovery Plan (2026-03-12)

## Objective
Refocus this repository into a reliable **AI-Native PM Knowledge OS** with one deployable app, one canonical signal pipeline, one scheduling path, and a coherent UX.

## Audit Findings
- The root deploy target is the Next.js 14 app at `/Users/joy/Opportunity Research`.
- There are multiple retained legacy implementations that still add conceptual noise:
  - `frontend/`
  - `knowledge-work-center/`
  - `playintel-dashboard/`
  - `web/`
- Core runtime behavior is overloaded inside `src/lib/legacy_page.tsx`.
- Signal generation has multiple paths and labels:
  - `backend/signal_engine.py` (local Python enhanced path)
  - `src/app/api/signal/refresh/route.ts` (Next.js server path)
  - UI references `/api/signal/python-refresh`, but that route needs validation as a first-class canonical path.
- Scheduling/cron is inconsistent:
  - `SIGNAL_ENGINE_RUNBOOK.md` references a 7:00 AM cron example.
  - `backend/setup_cron.sh` installs a 9:00 PM cron job.
  - `src/components/Dashboard.tsx` marks Scheduled Automation as `Coming Soon`, which conflicts with existing scripts.
- UX is split between:
  - dashboard/quick-launch behavior
  - shell/sidebar behavior
  - skill-first navigation instead of PM workflow-first navigation
- Current automated tests validate route loading and basic API shape, but not product coherence or scheduling truth.

## Product Direction
The product should center on 5 surfaces:
- Home
- Signals
- Research
- Write
- Vault / Automations

Skills should remain available, but grouped under product workflows rather than feeling like disconnected demos.

## Phase Plan

### Phase 1 — Stabilize truth sources
- [ ] Identify and validate active signal refresh route(s).
- [ ] Remove misleading labels and dead references around signal execution paths.
- [ ] Unify cron/runbook/scripts around one supported scheduling command.
- [ ] Expose scheduling status on the dashboard instead of `Coming Soon`.

### Phase 2 — UX simplification
- [ ] Rework dashboard into PM OS home:
  - latest signal brief
  - recent outputs
  - automation status
  - quick resume actions
- [ ] Reduce duplicate quick-launch affordances that compete with sidebar intent.
- [ ] Improve naming so tools read as PM workflows, not internal build artifacts.

### Phase 3 — Runtime decomposition
- [ ] Break `src/lib/legacy_page.tsx` into smaller skill/workflow modules.
- [ ] Separate signal workflow presentation from generic skill wrapper logic.
- [ ] Preserve current route contract `/?tool=*` while reducing monolith risk.

### Phase 4 — Verification
- [ ] Run root build.
- [ ] Run Playwright E2E.
- [ ] Add at least one verification for scheduling/status presentation.

## Immediate Slice (this session)
- [ ] Audit signal route wiring and scheduling scripts.
- [ ] Fix cron truth mismatch.
- [ ] Upgrade dashboard Scheduled Automation from placeholder to real status card.
- [ ] Update dashboard copy to better match PM Knowledge OS positioning.
- [ ] Run build + E2E after the slice.

## Review Notes
- In progress.

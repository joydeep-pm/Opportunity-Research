---
estimated_steps: 5
estimated_files: 4
---

# T01: Audit and align signal automation truth

**Slice:** S01 — Canonical signal automation status
**Milestone:** M001

## Description

Audit the current signal automation guidance across scripts, runbook, and product copy, then align all touched surfaces on one canonical local schedule and refresh path.

## Steps

1. Inspect current signal automation docs/scripts/copy for schedule, command, and log path mismatches.
2. Pick the canonical local automation path already supported by the repo.
3. Update docs and scripts to reflect the same 7:00 AM schedule, `backend/signal_engine.py`, and `logs/digest_cron.log` path.
4. Update product-facing signal copy where it still points to the wrong preferred refresh path.
5. Re-scan touched files to confirm wording and paths now match.

## Must-Haves

- [ ] One canonical schedule/log path is described consistently in touched files.
- [ ] Product-facing signal copy no longer prefers a conflicting refresh path.

## Verification

- `rg -n "7:00 AM|digest_cron.log|signal_engine.py|python-refresh|refresh" SIGNAL_ENGINE_RUNBOOK.md backend/setup_cron.sh backend/run_daily_digest.sh src/lib/skills.ts -S`
- Review the matched lines for consistent wording and paths.

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: read the runbook/scripts and UI copy, then compare with `/api/automation/health`.
- Failure state exposed: None

## Inputs

- `tasks/todo.md` — current session objective and immediate slice goals
- Existing automation scripts and runbook — current truth sources to reconcile

## Expected Output

- `SIGNAL_ENGINE_RUNBOOK.md` — canonical schedule/log path guidance
- `backend/setup_cron.sh` — matching cron installation script
- `backend/run_daily_digest.sh` — matching operator-facing comments/log behavior
- `src/lib/skills.ts` — aligned preferred signal refresh path copy

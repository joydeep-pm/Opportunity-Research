---
estimated_steps: 5
estimated_files: 2
---

# T01: Embed automation status into Home

**Slice:** S02 — PM OS home and surface coherence
**Milestone:** M001

## Description

Add visible automation status to the Home experience so the landing page reflects the real PM workflow: monitor signals, inspect automation readiness, resume work, and continue downstream.

## Steps

1. Inspect the current Home composition and the existing automation panel structure.
2. Decide the smallest reuse path for showing automation on Home.
3. Update Home to render automation status in a layout that fits with the signal brief and next-step sections.
4. Keep automation messaging consistent with the canonical schedule and diagnostics.
5. Build the app to confirm the updated composition is valid.

## Must-Haves

- [ ] Home visibly renders automation status.
- [ ] Embedded automation UI remains consistent with the dedicated automation panel content.

## Verification

- `npm run build`
- Visit `/` and confirm Home shows signal brief, automation status, and resume workflow in one page.

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: open `/` or inspect the automation card/component on Home.
- Failure state exposed: existing automation prerequisites and last run state remain visible from Home.

## Inputs

- `src/components/Dashboard.tsx` — current Home composition
- `src/components/AutomationStatusPanel.tsx` — reusable automation status UI

## Expected Output

- `src/components/Dashboard.tsx` — Home includes automation status section
- `src/components/AutomationStatusPanel.tsx` — supports clean embedding on Home if needed

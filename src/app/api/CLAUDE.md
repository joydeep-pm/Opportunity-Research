# API Module CLAUDE.md

## Scope
Applies to all files under `src/app/api/`.

## Contract Rules
- Return structured JSON for success and failure.
- Keep error payloads actionable (`error`, `details`, optional `help`).
- Preserve route response shapes expected by UI and E2E tests.

## Reliability Rules
- Never throw raw runtime errors to clients.
- Guard required env vars with explicit checks.
- Prefer deterministic fallback behavior where possible.

## Validation
Before finalizing API changes:
```bash
npm run build
npm run test:e2e
```

## Sensitive Paths
Treat future auth/billing endpoints as protected.

# Architecture Decisions (ADRs)

Use this folder for short ADR files.

## Naming
- `ADR-0001-single-root-nextjs.md`
- `ADR-0002-signal-node-serverless.md`

## ADR Template
```md
# ADR-XXXX: Title

## Context
What problem forced a decision?

## Decision
What was chosen?

## Consequences
Tradeoffs, risks, and migration impact.
```

## Current Baseline Decisions
- Root repository Next.js app is the only deployment target.
- Signal refresh route is Node-first for serverless compatibility.
- Multi-skill runtime remains in `src/lib/legacy_page.tsx` until a staged extraction is approved.

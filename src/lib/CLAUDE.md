# Lib Module CLAUDE.md

## Scope
Applies to `src/lib/` shared runtime logic.

## Critical Responsibilities
- Skill orchestration and routing state (`legacy_page.tsx`).
- Cross-skill context handoff (`skillContext.ts`).
- Output and signal local persistence helpers.

## Rules
- Keep browser-only APIs (`localStorage`, `sessionStorage`) SSR-safe.
- Preserve skill IDs and chaining compatibility unless migration is explicit.
- Avoid broad refactors without keeping behavior parity.

## Validation
For changes in this directory:
```bash
npm run build
npm run test:e2e
```

# Skill: Refactor

## Goal
Improve structure and readability without changing user-visible behavior.

## Constraints
- Preserve public API contracts and route behavior.
- Prefer extraction and naming improvements over broad rewrites.
- Keep diffs minimal and reversible.

## Workflow
1. Identify code smell and target boundary.
2. Extract one cohesive unit at a time.
3. Re-run verification after each meaningful slice.
4. Document why the refactor reduces complexity.

## Commands
```bash
npm run build
npm run test:e2e
```

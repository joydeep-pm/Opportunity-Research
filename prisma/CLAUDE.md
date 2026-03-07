# Prisma Module CLAUDE.md

## Scope
Applies to `prisma/` schema and migration assets.

## Rules
- Do not modify migrations casually.
- Any schema change must include a migration plan.
- Call out backward compatibility impact explicitly.

## Guardrail
Protected-path hooks are expected to block these edits unless intentionally overridden.

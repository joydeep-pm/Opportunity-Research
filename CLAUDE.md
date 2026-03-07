# CLAUDE.md

## Purpose
Opportunity Research is a unified Knowledge Work Center for AI-assisted product workflows.
It helps run India-first market/signal research, synthesize insights, generate product artifacts, and chain outputs across skills.

## Repo Map
- `src/app/` Next.js App Router pages and APIs.
- `src/app/api/signal/` Signal ingestion + synthesis endpoints.
- `src/app/api/skills/generate/` Skill generation API.
- `src/components/` Shell/dashboard/workspace UI components.
- `src/lib/` Core runtime logic (`legacy_page`, output history, skill context).
- `backend/` Local Python signal pipeline (non-serverless path).
- `tests/e2e/` Playwright E2E suite for core UX/API flows.
- `docs/` Architecture, decisions, and runbooks for progressive context.
- `tasks/` Execution plans, reviews, and lessons learned.

## Rules (Allowed / Forbidden)
- Keep root Next.js app as the primary deploy target.
- Preserve skill coverage and routing behavior (`/?tool=*`).
- Default product context to India-first workflows unless user asks otherwise.
- Prefer minimal-scope changes; do not replace functional modules with placeholders.
- Validate all non-trivial UI changes with build + E2E.
- Do not use destructive git commands (`reset --hard`, `checkout --`) unless explicitly requested.
- Do not commit local scratch artifacts (`_bmad*`, ad-hoc notes, local dumps) unless requested.

## Workflows
### Standard Change Flow
1. Write plan in `tasks/todo.md`.
2. Implement smallest coherent slice.
3. Run verification.
4. Record review evidence in `tasks/todo.md`.

### Verification Commands
```bash
cd "/Users/joy/Opportunity Research"
npm run build
npm run test:e2e
```

### Signal API Sanity
- `GET /api/signal` should always return stable shape (`markdown`, `exists`, `source`).
- `POST /api/signal/refresh` should return structured error when `OPENAI_API_KEY` is missing.

### High-Risk Areas
- `src/app/api/` API contracts and response schemas.
- `src/lib/legacy_page.tsx` multi-skill runtime orchestration.
- `src/lib/skillContext.ts` chain matrix + browser storage behavior.

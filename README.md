# Opportunity Research

Single-project setup for deployment: this repository root is the Next.js 14 app.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Deploy the repository root on Vercel (framework: Next.js).

## Project structure

- `src/` - main Knowledge Work Center app (Play Store Research + Content Engine)
- `skills/` - local skill definitions and scripts
- `CLAUDE.md` - concise AI operating memory for this repo
- `.claude/skills/` - reusable Claude skill workflows
- `.claude/hooks/` - deterministic guardrail scripts
- `docs/` - architecture, decisions, and runbook context
- `tasks/` - planning and review notes
- `outputs/` - generated research artifacts (local)

## Legacy folders

These are retained as historical implementations and are not deployment targets:

- `knowledge-work-center/` (original nested Next.js app source)
- `playintel-dashboard/` (earlier Vite dashboard)
- `web/` (earlier Flask app)

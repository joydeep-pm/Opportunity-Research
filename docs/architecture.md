# Architecture Overview

## System Shape
The active product is a root-level Next.js 14 application that hosts a multi-skill workspace.
A shell layout provides navigation + command routing, while a central runtime executes skill workflows.

## Core Layers
1. Presentation Layer
- `src/app/layout.tsx` for global shell.
- `src/components/*` for dashboard, command palette, workspace, and output actions.

2. Orchestration Layer
- `src/lib/legacy_page.tsx` manages skill definitions, inputs, execution, output drawer, and chaining.
- `src/lib/skillContext.ts` manages cross-skill context handoff and compatibility matrix.

3. API Layer
- `src/app/api/skills/generate/route.ts` for LLM-backed skill outputs.
- `src/app/api/signal/*` for signal ingestion/synthesis and fallback state.

4. Persistence Layer
- Browser-side persistence in `localStorage` / `sessionStorage` via `src/lib/outputHistory.ts`, `src/lib/signalHistory.ts`, and `src/lib/skillContext.ts`.
- Optional server file persistence for `daily_signal.md`.

## Runtime Modes
- Cloud/serverless mode: Node APIs under `src/app/api/*`.
- Local-enhanced mode: Python signal pipeline under `backend/` (used outside serverless path).

## Reliability Strategy
- Keep APIs returning stable structured JSON even under failure.
- Keep UI flows testable with Playwright at route and action level.
- Prevent SSR crashes by guarding browser-only storage access.

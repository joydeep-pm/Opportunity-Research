# Knowledge Work Center OS (KWC OS) - Product Review Brief for Claude

## 1) Review Objective
Please review this product and propose improvements that make it:
- easier for first-time users to understand,
- stronger in UI/UX quality and visual hierarchy,
- more functionally useful for real workflows (not just demo interactions).

This is an India-first AI operator workspace.

## 2) Product Snapshot
- Product name: `Knowledge Work Center OS (KWC OS)`
- Primary app: Next.js 14 app at repository root
- Stack: `Next.js App Router`, `React`, `Tailwind CSS`, `Framer Motion`, `Lucide-react`
- Core layout:
  - Left sidebar: navigation by domain
  - Top command bar: intent search + route command
  - Center pane: active workspace
  - Right rail: contextual panel (`Vault` for signal/vault, otherwise contextual placeholder)
  - Bottom slide-up output drawer for generated results

## 3) Navigation + Information Architecture
Routes use `?tool=` query params.

### Sidebar Groups
- Knowledge:
  - `signal` -> Daily Signal
  - `vault` -> Saved Vault
- Market:
  - `play-store` -> Play Store Research
  - `competitor` -> Competitor Tracking
  - `validator` -> Idea Validator
- Content:
  - `linkedin` -> LinkedIn Writer
  - `prompt` -> Prompt Engineering
- Management:
  - `product` -> Product Intelligence
  - `prd` -> PRD Generator
  - `idp` -> 1:1 IDP Builder
  - `workflow` -> Agent Workflow
  - `pulse` -> Pulse Timesheets

### Current Route-to-Skill Mapping
- `signal`, `vault` -> Signal Engine
- `play-store`, `competitor` -> Play Store Market Engine
- `linkedin` -> LinkedIn Content Engine
- `prompt` -> Prompt Engineering
- `validator` -> Idea Validator
- `product`, `prd` -> Product Intelligence
- `idp` -> Leadership IDP Engine
- `workflow`, `pulse` -> Agent Workflow

## 4) Functional Features by Skill
Each skill currently uses a shared runtime card pattern:
- Active Workspace header
- Execution Inputs form (text/textarea/select)
- Primary CTA button (`Generate...` or `Run...`)
- Output drawer with generated narrative result

### A) Signal Engine (`signal`, `vault`)
- UI:
  - Input: `Focus Lens` (default India fintech / RBI / enterprise AI / lending automation)
  - CTA: `Refresh Signal Windows`
  - Output: split sections:
    - `Fintech / RBI Window`
    - `Product Window`
- Backend:
  - `GET /api/signal`:
    - returns markdown, parsed sections, source (`filesystem`, `memory`, `none`)
  - `POST /api/signal/refresh`:
    - fetches RSS + optional Serper news
    - synthesizes with OpenAI
    - stores snapshot in memory and best-effort file persistence to `daily_signal.md`
- Fallback behavior:
  - If refresh fails, UI falls back to latest `GET /api/signal` response

### B) Play Store Market Engine (`play-store`, `competitor`)
- Inputs:
  - `Category` (`HEALTH_AND_FITNESS`, `FINANCE`, `PRODUCTIVITY`)
  - `Niche Query`
  - `Market` (default `India`)
- CTA: `Generate Opportunity Snapshot`
- Output:
  - category/query/market echo
  - top market signals
  - recommended MVP direction

### C) LinkedIn Content Engine (`linkedin`)
- Inputs:
  - rough idea
  - funnel mode (`ToF`, `MoF`, `BoF`)
  - CTA goal
- CTA: `Generate Viral Post Package`
- Output:
  - hook options
  - final post
  - CTA line
  - hashtags
  - checklist

### D) Prompt Engineering (`prompt`)
- Inputs:
  - prompt draft
  - failure mode
- CTA: `Optimize Prompt`
- Output:
  - optimized prompt text
  - resolved failure mode

### E) Product Intelligence (`product`, `prd`)
- Inputs:
  - problem statement
  - primary metric
- CTA: `Generate Product Brief`
- Output:
  - recommended direction
  - expected impact metrics

### F) Leadership IDP Engine (`idp`)
- Inputs:
  - employee name
  - date
  - raw 1:1 notes
- CTA: `Generate Strategic IDP`
- Output:
  - structured markdown synthesis (executive summary, leverage, bottlenecks, actions)
  - uses Pyramid + MECE style transformations

### G) Idea Validator (`validator`)
- Inputs:
  - idea
  - target user
- CTA: `Run Validation`
- Output:
  - scored dimensions (problem, timing, differentiation, distribution, execution)
  - verdict and next step

### H) Agent Workflow (`workflow`, `pulse`)
- Inputs:
  - goal
  - constraints
- CTA: `Generate Workflow Blueprint`
- Output:
  - ordered execution plan steps

## 5) Core UX Behaviors
- Command search supports intent routing (e.g. typing `linkedin` and Enter routes to that tool)
- Sidebar link route switching
- Output drawer:
  - opens after CTA run
  - closes via `Escape`
  - closes via `Close` button
- Embedded omnibar mode includes:
  - intent input
  - quick-launch buttons
  - filtered skill list

## 6) Current Operational Constraints
- Signal refresh needs environment keys:
  - `OPENAI_API_KEY` required
  - `SERPER_API_KEY` optional (enables Serper source)
- Without `OPENAI_API_KEY`:
  - `POST /api/signal/refresh` returns structured `500` error
  - UI still attempts fallback to latest cached signal
- Most non-signal skill outputs are deterministic local generators (not yet persisted or server-backed workflows).

## 7) Functional QA Status (latest)
- Route loading and CTA flow coverage passed for all visible tools.
- Command routing and sidebar navigation passed.
- Output drawer close behaviors passed.
- Known runtime dependency issue:
  - Signal refresh fails when `OPENAI_API_KEY` is missing.

## 8) What We Need From Claude
Please provide a prioritized redesign and product-improvement plan:

### A) UX + IA Review
- Where users experience cognitive load
- Better onboarding/discoverability for multi-skill systems
- Better labeling for alias routes (`prd` vs `product`, `competitor` vs `play-store`, `pulse` vs `workflow`)
- Suggested IA that scales to 20+ skills

### B) UI Redesign Recommendations
- Improve visual hierarchy and focus management
- Better use of right rail (currently underutilized except signal/vault)
- Better output experience (readability, actions, history, compare)
- Better command bar affordances and shortcuts
- Mobile and tablet adaptation strategy

### C) Functional Product Improvements
- Convert deterministic demo outputs into useful, stateful workflows
- Add persistence model for generated outputs (history/versioning/export/share)
- Add cross-skill orchestration (e.g., Market -> Product -> PRD -> Content)
- Add run status, progress, and failure recovery UX

### D) Prioritized Roadmap
Please give:
- Top 10 improvements by impact/effort
- Next 3 sprints with clear scope
- Concrete acceptance criteria per item

### E) Deliverables Requested
- One-page executive recommendation
- Detailed UI/UX audit with before/after suggestions
- Proposed information architecture map
- Functional architecture upgrades (frontend + backend)
- Component-level recommendations (cards, outputs, forms, nav, command bar)

## 9) Optional Paste-Ready Prompt for Claude
Use this if helpful:

```md
You are a principal product designer + staff product engineer. Review the attached KWC OS feature brief.

Goals:
1) Reduce cognitive load for first-time users.
2) Improve visual hierarchy and premium polish.
3) Make workflows functionally useful beyond mock generation.
4) Keep India-first context and multi-skill extensibility.

Please return:
- A critical UX audit (issues, why they matter, severity).
- A redesigned IA and interaction model.
- A prioritized backlog (top 10), each with impact/effort and acceptance criteria.
- A 3-sprint implementation plan (UI + backend + data model).
- Specific component-level changes for sidebar, command bar, workspace cards, output drawer, and right rail.
- Any anti-patterns currently present and how to fix them.
```


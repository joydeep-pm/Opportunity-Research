# Play Store Opportunity Research Skill

## Plan
- [x] Create skill scaffold for `play-store-opportunity-research` with required structure.
- [x] Author `SKILL.md` with end-to-end Google Play research pipeline (category -> charts -> deep dive -> gap analysis -> top-3 -> PRD -> scaffold handoff).
- [x] Add reusable reference templates for feature matrix, opportunity ranking, and MVP PRD sections.
- [x] Add a deterministic helper script to collect Google Play app metadata and review signals.
- [x] Validate skill structure and script usability with local checks.
- [x] Document completion notes and verification evidence in this file.

## Review
- Completed files:
  - `skills/play-store-opportunity-research/SKILL.md`
  - `skills/play-store-opportunity-research/agents/openai.yaml`
  - `skills/play-store-opportunity-research/references/research_templates.md`
  - `skills/play-store-opportunity-research/references/mvp_prd_template.md`
  - `skills/play-store-opportunity-research/scripts/play_store_research.py`
- Verification:
  - `python3 /Users/joy/.codex/skills/.system/skill-creator/scripts/quick_validate.py '/Users/joy/Opportunity Research/skills/play-store-opportunity-research'` -> `Skill is valid!`
  - `python3 '/Users/joy/Opportunity Research/skills/play-store-opportunity-research/scripts/play_store_research.py' --help` -> CLI help rendered.
  - `python3 '/Users/joy/Opportunity Research/skills/play-store-opportunity-research/scripts/play_store_research.py' charts --help` -> subcommand help rendered.
  - `python3 '/Users/joy/Opportunity Research/skills/play-store-opportunity-research/scripts/play_store_research.py' app --app-id com.google.android.apps.maps --reviews 1 --country us --lang en --out '/Users/joy/Opportunity Research/outputs/sample_app.json'` -> expected dependency guard: install `google-play-scraper`.
- Notes:
  - Runtime data collection requires `pip install google-play-scraper`.

## Run Log (2026-03-05)
- Installed dependency: `google-play-scraper`.
- Found runtime API mismatch (`collection` API missing in v1.2.7); patched script to fallback to HTML chart ID extraction.
- Generated first-pass outputs:
  - `outputs/charts_finance_us.json`
  - `outputs/deep_dive_finance_us.json`
- Verified deep-dive extraction over 8 apps with review-theme summaries and opportunity signals.

## India AI Habit Tracker Run Plan
- [x] Pull India category baseline (`HEALTH_AND_FITNESS`) to confirm market context.
- [x] Pull query-specific shortlist for "AI habit tracker" in India.
- [x] Deep-dive 8-12 relevant competitors with low-star review theme extraction.
- [x] Produce top-3 opportunity ranking focused on India user pain and monetization.

## Web Interface Plan
- [x] Build Flask backend endpoint to run Play Store category/query research on demand.
- [x] Implement analysis pipeline in backend (charts, shortlist, deep-dive, top-3 opportunities).
- [x] Build frontend page with category/country/query form and rendered result sections.
- [x] Smoke test end-to-end by running a live India AI habit tracker request.
- [x] Document run instructions and mark completion.

## Web Interface Review
- Added backend app: `web/app.py`
- Added frontend files:
  - `web/templates/index.html`
  - `web/static/styles.css`
  - `web/static/app.js`
- Added dependency file: `web/requirements.txt`
- Smoke-test evidence:
  - POST `/api/research` with India + AI habit tracker returned:
    - `chartAppsCollected: 10`
    - `deepDiveApps: 3`
    - `opportunities: 3`
  - Saved payloads:
    - `outputs/web_api_smoke_in_ai_habit.json`
    - `outputs/web_api_smoke2.json`

## Research Studio Upgrade Plan
- [x] Refactor backend into run-based research pipeline with persisted artifacts.
- [x] Add document generation pipeline for non-PRD docs in MD/JSON/PDF.
- [x] Add gated PRD generation endpoint (requires initialize).
- [x] Add document listing, per-document download, and zip download endpoints.
- [x] Redesign frontend into premium research studio layout with document navigator and viewer.
- [x] Implement initialization stepper and PRD lock/unlock behavior.
- [ ] Run end-to-end verification against all new API contracts and UI-critical flows.

## React Dashboard Build Plan
- [x] Scaffold `playintel-dashboard` React app with Vite.
- [x] Configure Tailwind CSS and global dark theme tokens for Midnight Obsidian visuals.
- [x] Build high-fidelity dashboard layout with animated sections (Header, Discovery, Workbench, Opportunity Hub, PRD Generator).
- [x] Implement interactive behaviors (category context updates, 3-second analyze thinking state, PRD slide-over, mock download actions).
- [x] Ensure responsive behavior for laptop and tablet widths.
- [x] Run production build verification.

## React Dashboard Review
- Added new React app: `playintel-dashboard/`
- Core files implemented:
  - `playintel-dashboard/src/App.jsx`
  - `playintel-dashboard/src/index.css`
  - `playintel-dashboard/vite.config.js`
  - `playintel-dashboard/package.json` (+ dependencies)
- Verification:
  - `cd '/Users/joy/Opportunity Research/playintel-dashboard' && npm run build` passed successfully.

## Knowledge Work Center OS Plan
- [x] Scaffold `knowledge-work-center` using Next.js 14 + Tailwind.
- [x] Build unified shell: left command sidebar, global context bar, dynamic workspace stage, terminal footer.
- [x] Implement Skill 1 (Market Research): category selection, gap analysis, PRD generation panel.
- [x] Implement Skill 2 (Content Engine): rough idea input, LinkedIn-style refinement output, 10% polish slider.
- [x] Add Command+K overlay for instant skill navigation and animate stage transitions with Framer Motion.
- [x] Apply deep obsidian, minimalist abstract visual system and ensure tablet/laptop responsiveness.
- [x] Verify with `npm run build`.

## Knowledge Work Center Review
- New app created: `knowledge-work-center/` (Next.js 14 + Tailwind + Framer Motion + Lucide-react).
- Local skill reference used for Content Engine behavior:
  - `/Users/joy/pm-claude-skills/skills/linkedin-post-writer/SKILL.md`
- Key files:
  - `knowledge-work-center/src/app/page.tsx`
  - `knowledge-work-center/src/app/layout.tsx`
  - `knowledge-work-center/src/app/globals.css`
- Verification:
  - `cd '/Users/joy/Opportunity Research/knowledge-work-center' && npm run build` passed.

## Single-Project Merge Plan (Root Next.js)
- [x] Make repository root the single deployable Next.js 14 app.
- [x] Simplify Vercel config to standard root Next.js detection/build.
- [x] Preserve previous Flask/Vite implementations as legacy artifacts (non-deployment).
- [x] Run root build verification and document deployment expectations.
- [x] Capture lessons learned in `tasks/lessons.md` for future structure decisions.

## Single-Project Merge Review
- Root Next.js app files promoted from `knowledge-work-center/` to repository root:
  - `src/`
  - `package.json`
  - `package-lock.json`
  - `next.config.mjs`
  - `postcss.config.mjs`
  - `tailwind.config.ts`
  - `tsconfig.json`
  - `.eslintrc.json`
  - `next-env.d.ts`
- Root deployment config simplified:
  - `vercel.json` now only declares Next.js framework.
- Repository clarity improvements:
  - Added root `README.md` documenting single deploy target and legacy folders.
  - Updated root `.gitignore` for Next.js + project outputs.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm install` succeeded.
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Idea Validator Integration Plan
- [x] Add `Idea Validator` to sidebar navigation and command palette switching.
- [x] Build a dedicated Idea Validator workspace panel with input form, scored validation output, and recommendation blocks.
- [x] Add Idea Validator status visibility in header and terminal startup logs.
- [x] Verify the unified app still builds successfully from repository root.
- [x] Add a lesson entry for avoiding skill omission when expanding the workspace shell.

## Idea Validator Integration Review
- Updated unified shell in `src/app/page.tsx`:
  - Added new skill route: `Idea Validator`.
  - Added sidebar + command palette support through shared `sidebarItems`.
  - Added dedicated `SkillIdeaValidator` panel with:
    - founder input capture (idea, audience, current solution, edge, monetization),
    - 5-dimension scoring framework (Problem, Market, Differentiation, Feasibility, Viability),
    - verdict output (`GO` / `ITERATE` / `STOP`),
    - quick competitor scan table,
    - killer questions and de-risking experiments.
  - Added global status chip and terminal boot log for local `idea-validator` skill context.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Agent Workflow Panel Plan
- [x] Parse `agent-workflow.skill` content and map the relevant UX structure.
- [x] Add a new `Agent Workflow` panel to the Knowledge Work Center navigation and command palette.
- [x] Build an interactive workflow-designer view using the skill's 9-step and 8-layer framework.
- [x] Add runtime status/log entries for the new panel in the global context and terminal.
- [x] Verify root build and document the integration results.

## Agent Workflow Panel Review
- Skill package source inspected:
  - `/Users/joy/Downloads/agent-workflow.skill` (`SKILL.md` + references)
- Integration completed in:
  - `src/app/page.tsx`
- Added capabilities:
  - New `Agent Workflow` workspace in sidebar + Command+K search.
  - Interactive workflow designer panel with:
    - problem/outcome/constraints/success-metric inputs,
    - complexity selector (`single`, `multi`, `integration`),
    - generated architecture recommendation,
    - generated 9-step implementation plan,
    - generated 8-layer priority map,
    - system prompt scaffold block.
  - Global status chip + terminal startup log entry for the workflow skill source.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Product + Prompt Skills Plan
- [x] Parse `prd-writer.skill` and `prompt-engineering.skill` and map UX behaviors.
- [x] Upgrade existing `Product Intelligence` panel to include a functional PRD Writer flow.
- [x] Add a dedicated `Prompt Engineering` panel for prompt optimization and evaluation planning.
- [x] Wire both skills into sidebar, command palette, global status, and terminal logs.
- [x] Verify root build and document integration evidence.

## Product + Prompt Skills Review
- Skill packages used:
  - `/Users/joy/Downloads/prd-writer.skill`
  - `/Users/joy/Downloads/prompt-engineering.skill`
- Integrated in unified app:
  - `src/app/page.tsx`
- New implementations:
  - Replaced `Product Intelligence` placeholder with `SkillProductIntelligence`:
    - decision-first PRD input form,
    - generated PRD sections (opportunity framing, scope, non-goals, metrics, rollout, risks),
    - metric contract + rollout/risk views,
    - markdown PRD output panel.
  - Added `SkillPromptEngineering`:
    - target model selector,
    - prompt + failure mode inputs,
    - generated hard-constraint prompt rewrite,
    - 20/60/20 eval plan,
    - token estimate and reduction summary.
  - Added shell-level integration:
    - sidebar/command-palette route for Prompt Engineering,
    - global status chips for PRD Writer and Prompt Engineering,
    - terminal startup logs for both skill sources.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Product Intelligence Expansion Plan
- [x] Integrate remaining product skills into the existing Product Intelligence module: Competitive Analysis, Launch Checklist, Metrics Definer, Sprint Planner, User Research Synthesizer.
- [x] Keep PRD Writer as-is inside Product Intelligence and add a sub-skill switcher UI for all six tools.
- [x] Implement deterministic input/output workflows for each added skill panel.
- [x] Add source references for the five new `SKILL*.md` files in the Product Intelligence UI.
- [x] Verify root build and document completion evidence.

## Product Intelligence Expansion Review
- Parsed skill files:
  - `/Users/joy/Downloads/SKILL.md` (User Research Synthesizer)
  - `/Users/joy/Downloads/SKILL (1).md` (Sprint Planner)
  - `/Users/joy/Downloads/SKILL (2).md` (Metrics Definer)
  - `/Users/joy/Downloads/SKILL (3).md` (Launch Checklist)
  - `/Users/joy/Downloads/SKILL (4).md` (Competitive Analysis)
- Updated module:
  - `src/app/page.tsx`
- Product Intelligence now includes sub-skill switching for:
  - PRD Writer (existing)
  - Competitive Analysis
  - Launch Checklist
  - Metrics Definer
  - Sprint Planner
  - User Research Synthesizer
- Each added skill has:
  - dedicated inputs,
  - deterministic generated outputs,
  - run-status logging via terminal log feed.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Content Engine Viral Upgrade Plan
- [x] Replace lightweight draft refinement with full viral post generation workflow.
- [x] Implement hook lab (10+ hooks), three-act post assembly, and funnel mode selector (ToF/MoF/BoF).
- [x] Add output package sections: selected hook, final post, CTA, hashtags, and quality checklist.
- [x] Add basic quality guardrails for specificity/CTA clarity in generated output.
- [x] Verify root build and document completion evidence.

## Content Engine Viral Upgrade Review
- Source skill read in detail:
  - `/Users/joy/Downloads/linkedin-viral-post-writer.skill` (`SKILL.md`, `references/post-examples.md`, `references/hook-templates.md`)
- Updated implementation:
  - `src/app/page.tsx`
- Key upgrades to Content Engine:
  - Replaced "Refine Draft" behavior with full "Generate Viral Post" workflow.
  - Added funnel mode selector: `ToF`, `MoF`, `BoF`.
  - Added hook lab with 12 generated hook options and selectable apply flow.
  - Added final post package output with CTA + hashtags + publish checklist.
  - Added quality guardrail checks for specificity and CTA clarity.
  - Updated visible status/source labels to `linkedin-viral-post-writer.skill`.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Omnibar Refactor Plan
- [x] Replace static multi-panel layout with a light-theme omnibar-first shell (no permanent sidebar).
- [x] Implement `SkillWrapper` driven by declarative skill config JSON (name, icon, input fields, local script path).
- [x] Add transient workspace morph transitions (Framer Motion `layoutId`) for selected skills.
- [x] Add output drawer overlay for generated artifacts with close/escape interactions.
- [x] Seed skills list for: Play Store Market Engine, LinkedIn Content Engine, Leadership IDP Engine, Chronos Timesheet.
- [x] Verify build and document refactor results.

## Omnibar Refactor Review
- Refactor scope completed in:
  - `src/app/page.tsx`
  - `src/app/globals.css`
- Major architecture changes:
  - Removed static sidebar-first shell and replaced with centered omnibar router.
  - Added reusable `SkillWrapper` that renders from declarative skill JSON config.
  - Added transient workspace morph with `layoutId=\"omnibar-shell\"` transitions.
  - Added output drawer (bottom slide-up) with overlay and close/escape behavior.
  - Added `Cmd+K` shortcut behavior to return to omnibar and focus input.
- Seeded skills now routed by omnibar:
  - Play Store Market Engine
  - LinkedIn Content Engine
  - Leadership IDP Engine
  - Chronos Timesheet
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Leadership IDP Engine Upgrade Plan
- [x] Refactor Leadership IDP skill output to strict executive synthesis Markdown format.
- [x] Enforce top-down summary, MECE strengths/bottlenecks, and measurable action items in generated output.
- [x] Accept raw 1:1 brain-dump input and derive trajectory status plus next-quarter focus.
- [x] Verify build and document completion evidence.

## Leadership IDP Engine Upgrade Review
- Updated implementation:
  - `src/app/page.tsx`
- Leadership IDP engine now:
  - accepts raw 1:1 notes as primary input,
  - generates strict markdown in requested structure:
    - executive summary (top-down),
    - MECE leverage categories,
    - structural bottlenecks with impact,
    - measurable action resolutions.
  - infers trajectory status (`Accelerating` / `Steady` / `Requires Pivot`) from synthesized bottleneck pattern.
  - uses deterministic category mapping to keep outputs structured and scannable.
- Verification:
  - `cd '/Users/joy/Opportunity Research' && npm run build` succeeded (Next.js 14.2.35).

## Signal Engine Step 1 Plan
- [x] Create `backend/signal_engine.py` with Substack RSS extraction (last 48h default), X placeholder fetch via Apify actor, and Claude synthesis.
- [x] Enforce strict output shape of exactly 5 markdown bullets and write to `daily_signal.md` at project root.
- [x] Add `.env.example` documenting required API keys and feed/handle configuration.
- [x] Run a backend syntax validation check and capture evidence.

## Signal Engine Step 1 Review
- Files added:
  - `backend/signal_engine.py`
  - `backend/.env.example`
- Verification:
  - `python3 -m py_compile '/Users/joy/Opportunity Research/backend/signal_engine.py'` (passes)

## Signal Engine Step 2 Plan
- [x] Initialize dedicated Next.js 14 App Router project in `/frontend` with Tailwind CSS and Framer Motion.
- [x] Build an intent-driven omnibar landing view with smooth transitions into the Signal workspace.
- [x] Implement Signal workspace with markdown rendering via `react-markdown`.
- [x] Add API routes to read `daily_signal.md` and refresh by triggering `backend/signal_engine.py`.
- [x] Verify frontend production build.

## Signal Engine Step 2 Review
- Added frontend app scaffold in:
  - `frontend/package.json`
  - `frontend/next.config.mjs`
  - `frontend/postcss.config.mjs`
  - `frontend/tailwind.config.ts`
  - `frontend/tsconfig.json`
  - `frontend/.eslintrc.json`
  - `frontend/src/app/layout.tsx`
  - `frontend/src/app/globals.css`
  - `frontend/src/app/page.tsx`
  - `frontend/src/app/api/signal/route.ts`
  - `frontend/src/app/api/signal/refresh/route.ts`
- Verification:
  - `cd '/Users/joy/Opportunity Research/frontend' && npm install` completed.
  - `cd '/Users/joy/Opportunity Research/frontend' && npm run build` passed (Next.js 14.2.35).

## Signal Engine Step 3 Plan
- [x] Add dependency installer script for Python backend and frontend npm dependencies.
- [x] Add start script for frontend runtime with clear daily cron setup instructions for 7:00 AM.
- [x] Validate script syntax and dry-run cron guidance output.
- [x] Execute setup script once to verify dependency installation path works.

## Signal Engine Step 3 Review
- Added files:
  - `backend/requirements.txt`
  - `setup.sh`
  - `start.sh`
- Updated:
  - `.gitignore` to allow checked-in `.env.example` templates.
- Verification:
  - `bash -n '/Users/joy/Opportunity Research/setup.sh' '/Users/joy/Opportunity Research/start.sh'` passed.
  - `'/Users/joy/Opportunity Research/start.sh' --print-cron` printed valid 7:00 AM cron instructions.
  - `'/Users/joy/Opportunity Research/setup.sh'` completed and installed backend + frontend dependencies.

## Signal Engine Step 1 Revision Plan (India Memo + Apify Actor)
- [x] Update Apify integration to use `apidojo/tweet-scraper` with required `twitterHandles` run input.
- [x] Replace bullet-point synthesis behavior with long-form 3-4 paragraph memo output.
- [x] Enforce India-specific framing in prompt (Indian fintech, RBI, enterprise AI, lending/compliance/automation).
- [x] Update `.env.example` to reflect revised X handle defaults and remove deprecated actor env key.
- [x] Re-run backend syntax verification.

## Signal Engine Step 1 Revision Review
- Updated files:
  - `backend/signal_engine.py`
  - `backend/.env.example`
- Verification:
  - `python3 -m py_compile '/Users/joy/Opportunity Research/backend/signal_engine.py'` passed.

## Signal Engine Step 1 Revision (Provider Switch) Plan
- [x] Replace Anthropic client usage with OpenAI client usage in backend synthesis flow.
- [x] Update environment variables to `OPENAI_API_KEY` and `OPENAI_MODEL`.
- [x] Update Python requirements to include `openai` instead of `anthropic`.
- [x] Re-run backend syntax verification.

## Signal Engine Step 1 Revision (Provider Switch) Review
- Updated files:
  - `backend/signal_engine.py`
  - `backend/.env.example`
  - `backend/requirements.txt`
- Verification:
  - `python3 -m py_compile '/Users/joy/Opportunity Research/backend/signal_engine.py'` passed.

## Signal Engine Step 2 Revision Plan
- [x] Validate `/frontend` still matches intent-driven omnibar architecture and Signal workspace routing.
- [x] Improve long-form memo readability (line length, line-height, spacing) for markdown rendering.
- [x] Ensure "Signal" query transitions directly into the Signal workspace.
- [x] Keep refresh wiring (`/api/signal/refresh` -> `backend/signal_engine.py`) unchanged and verified.
- [x] Run frontend production build verification.

## Signal Engine Step 2 Revision Review
- Updated files:
  - `frontend/src/app/page.tsx`
  - `frontend/src/app/globals.css`
  - `frontend/src/app/api/signal/route.ts`
- Verification:
  - `cd '/Users/joy/Opportunity Research/frontend' && npm run build` passed (Next.js 14.2.35).

## Signal Engine Step 3 Finalization Plan
- [x] Align setup/start script messaging with OpenAI-based backend configuration.
- [x] Keep start flow explicit for cron setup and local launch.
- [x] Re-validate shell script syntax.

## Signal Engine Step 3 Finalization Review
- Updated files:
  - `setup.sh`
  - `start.sh`
- Verification:
  - `bash -n '/Users/joy/Opportunity Research/setup.sh' '/Users/joy/Opportunity Research/start.sh'` passed.

## Signal Engine Step 4 Plan (Runtime Hardening)
- [x] Ensure refresh API uses project virtualenv Python when available to avoid module mismatch.
- [x] Improve refresh error details for quicker debugging.
- [x] Add a lightweight local runtime checker script.

## Signal Engine Step 4 Review
- Updated files:
  - `frontend/src/app/api/signal/refresh/route.ts`
- Added files:
  - `run_signal_once.sh`
- Verification:
  - `'/Users/joy/Opportunity Research/run_signal_once.sh' --check` passed.

## Signal Engine Step 5 Plan (Operational Runbook)
- [x] Add a single runbook documenting setup, run, refresh, and cron scheduling.
- [x] Include explicit file paths and command snippets for local execution.
- [x] Re-run frontend build as end-to-end UI/API sanity check.

## Signal Engine Step 5 Review
- Added files:
  - `SIGNAL_ENGINE_RUNBOOK.md`
- Verification:
  - `cd '/Users/joy/Opportunity Research/frontend' && npm run build` passed (Next.js 14.2.35).

## Signal Engine Source Expansion Plan (AI News)
- [x] Add Code Newsletter AI feed as an additional signal ingestion source.
- [x] Expose feed URL via env config for easy overrides.
- [x] Update runbook docs and verify backend syntax.

## Signal Engine Source Expansion Review (AI News)
- Updated files:
  - `backend/signal_engine.py`
  - `backend/.env.example`
  - `SIGNAL_ENGINE_RUNBOOK.md`
- Runtime config updated:
  - `backend/.env` now includes `AI_NEWS_FEED_URL=https://codenewsletter.ai/feed`.
- Verification:
  - `python3 -m py_compile '/Users/joy/Opportunity Research/backend/signal_engine.py'` passed.

## Signal Engine Connector Upgrade Plan (Serper)
- [x] Refactor backend ingestion into connector modes (`SOURCE_MODE`) to support scalable connectors.
- [x] Add Serper News connector with configurable queries and geo/language parameters.
- [x] Make APIFY optional and non-default to keep low-cost/high-reliability baseline.
- [x] Update env template and runbook for Serper setup and connector routing.
- [x] Verify runtime with current env and capture behavior with/without Serper key.

## Signal Engine Connector Upgrade Review (Serper)
- Updated files:
  - `backend/signal_engine.py`
  - `backend/.env.example`
  - `SIGNAL_ENGINE_RUNBOOK.md`
- Runtime config updated:
  - `backend/.env` now includes `SOURCE_MODE=rss_serper` and Serper connector variables.
- Verification:
  - `python3 -m py_compile '/Users/joy/Opportunity Research/backend/signal_engine.py'` passed.
  - `'/Users/joy/Opportunity Research/run_signal_once.sh'` passed.
  - Observed expected runtime behavior with no Serper key: `SERPER_API_KEY not set. Skipping Serper connector.`

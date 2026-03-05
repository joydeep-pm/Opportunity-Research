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

# Lessons

## 2026-03-05 - Avoid multi-app deployment ambiguity
- Trigger: User reported repeated Vercel detection/build errors and confusion from multiple app directories.
- Mistake pattern: Keeping multiple deployable app roots in one repo without a clearly enforced single deployment target.
- Preventive rule: Default to one canonical app at repository root for production deploys; keep experiments in clearly named legacy folders and document non-deploy status.
- Preventive rule: Keep `vercel.json` minimal unless custom build routing is truly required.
- Preventive rule: Validate with root `npm run build` before asking user to redeploy.

## 2026-03-05 - Include all named skills in unified workspace
- Trigger: User pointed out missing `Idea Validator` skill in Knowledge Work Center.
- Mistake pattern: Shipping shell navigation without validating every named skill is represented as an actual module.
- Preventive rule: Before finalizing multi-skill dashboards, cross-check user-requested skills against sidebar items and command palette entries.
- Preventive rule: Add status chip + startup log entry for each active skill so omissions are visually obvious.

## 2026-03-06 - Integrate user-provided .skill packages into existing modules
- Trigger: User requested adding `prd-writer.skill` and `prompt-engineering.skill` into existing workspaces.
- Mistake pattern: Leaving requested skills as external references instead of first-class UI modules.
- Preventive rule: When user shares `.skill` files, inspect archive structure first (`SKILL.md` + references), then map concrete behaviors into dedicated panels.
- Preventive rule: If user says "add into existing skill", upgrade the existing module rather than adding another placeholder.

## 2026-03-06 - Respect exclusion constraints during bulk skill adds
- Trigger: User clarified "excluding PRD writer, add the rest into Product Intelligence."
- Mistake pattern: Risk of reworking already-added modules instead of extending only missing skill coverage.
- Preventive rule: When user says "barring X", preserve X as-is and focus only on missing requested modules.
- Preventive rule: Before edits, explicitly map requested skills into "already present" vs "to add" lists.

## 2026-03-06 - Match perceived UX promise to implemented depth
- Trigger: User expected rough idea input to produce a full viral LinkedIn post package, but existing UI felt like a shallow refiner.
- Mistake pattern: Implementing minimal scaffolding under a high-capability skill label.
- Preventive rule: If skill name implies expert output ("viral post writer"), ship complete generation package (hooks + final post + CTA + quality checks), not a single text transform.
- Preventive rule: Read `SKILL.md` + references before implementing behavior so UX matches documented workflow depth.

## 2026-03-06 - Validate model-provider constraints and cost preference early
- Trigger: User asked to switch from Anthropic to OpenAI due to cost concerns after Step 1 was implemented.
- Mistake pattern: Locking API provider too early without confirming user cost preference.
- Preventive rule: For LLM-integrated pipelines, confirm preferred provider (OpenAI/Anthropic) and pricing sensitivity before finalizing backend wiring.
- Preventive rule: Keep synthesis module provider-agnostic where possible to reduce rework when key/provider changes.

## 2026-03-06 - Lock source identities before scraping integrations
- Trigger: User corrected X handles and Elena Substack source (`@aakashgupta`, `@shreyas`, `plgrowth` feed).
- Mistake pattern: Using inferred/default handles instead of the user’s exact creator identifiers.
- Preventive rule: Confirm and lock exact account handles/feed URLs before finalizing scraper defaults.
- Preventive rule: Apply source updates in both runtime `.env` and `.env.example`, and align code fallbacks with the same values.

## 2026-03-06 - Add connector strategy when user requests freshness
- Trigger: User asked for connectors and explicitly requested Serper for fresher, updated output.
- Mistake pattern: Relying only on initial RSS/API setup without a configurable connector strategy.
- Preventive rule: When freshness is a priority, implement pluggable connector routing (`SOURCE_MODE`) and expose connector credentials/settings via env.
- Preventive rule: Keep a low-cost default mode and make higher-cost connectors opt-in.

## 2026-03-06 - Isolate TypeScript scope in monorepo-like layouts
- Trigger: Vercel root build failed because root `tsconfig.json` type-checked `frontend/` files and could not resolve `react-markdown` from root deps.
- Mistake pattern: Broad include patterns (`**/*.ts`, `**/*.tsx`) in a repo containing multiple app trees.
- Preventive rule: In root Next.js apps, scope TypeScript `include` to `src/**` and explicitly exclude sibling app directories.
- Preventive rule: When adding a second app directory, immediately verify root build type-check boundaries.

## 2026-03-06 - Avoid discoverability debt in omnibar UIs
- Trigger: User reported high cognitive load and confusion (had to remember module names and type manually).
- Mistake pattern: Over-indexing on command-palette purity and under-providing visible module entry points.
- Preventive rule: Always include one-click quick-launch buttons/list for all modules in addition to search.
- Preventive rule: Remove unrequested modules quickly when user calls them out and ensure requested modules are first-class entries.

## 2026-03-06 - Handle serverless process spawn failures explicitly
- Trigger: Signal refresh on Vercel surfaced as vague \"Network error\" due unhandled spawn failure path.
- Mistake pattern: Assuming local process execution semantics in serverless runtime and not handling `child_process` error events.
- Preventive rule: Always wire `child.on('error')` and return structured JSON errors with actionable guidance.
- Preventive rule: In client fetch handlers, guard non-JSON responses to avoid masking backend failures as generic network errors.

## 2026-03-06 - Avoid serverless-local persistence assumptions
- Trigger: User could open Signal workspace but refresh/read failed in deployed runtime because Python/file persistence assumptions did not hold.
- Mistake pattern: Building API flows that require local scripts and writable repo files in serverless.
- Preventive rule: Default cloud-facing refresh routes to pure Node/HTTP pipelines; treat local script execution as local-dev only.
- Preventive rule: Add memory fallback for freshly generated outputs when persistent disk is unavailable.

## 2026-03-06 - Optimize output readability, not just correctness
- Trigger: User asked "how will I read" after seeing dense single-block memo text and requested separate windows.
- Mistake pattern: Delivering technically correct output in an unreadable presentation.
- Preventive rule: Narrative outputs must render with wrapped paragraph layout and visual grouping, never raw monospaced blocks.
- Preventive rule: When users request separated thinking modes (e.g., Fintech/RBI vs Product), represent them as explicit, independently readable sections.

## 2026-03-06 - Verify remote divergence before blocking on dirty worktree
- Trigger: User clarified they had already revamped the UI and wanted pull/commit/push flow.
- Mistake pattern: Pausing early on dirty local state before checking whether remote actually has new commits.
- Preventive rule: First run `git fetch` + divergence check (`main...origin/main`) to verify if pull is needed; then proceed with the correct integration path.
- Preventive rule: If remote is unchanged and local contains intended user edits, validate, commit, and push those edits directly.

## 2026-03-06 - Never leave primary CTAs as static placeholders
- Trigger: User reported that none of the visible buttons were working in the antigravity UI.
- Mistake pattern: Shipping presentational controls (`Run Tool`, filter toggles, command bar) without actual handlers.
- Preventive rule: Before release, test every visible CTA once and confirm state change, navigation, or output mutation.
- Preventive rule: If a control is intentionally non-functional, label it explicitly as preview-only.

## 2026-03-06 - Do not replace functional skill runtime with placeholders
- Trigger: User reported most developed features disappeared from the UI.
- Mistake pattern: Shipping a visual revamp that replaced real module implementations with placeholder panels.
- Preventive rule: Visual refactors must preserve functional parity; placeholders are only acceptable behind explicit feature flags.
- Preventive rule: Keep the full skill runtime as the default rendering path unless user explicitly asks for a reduced demo mode.

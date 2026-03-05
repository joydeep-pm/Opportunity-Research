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

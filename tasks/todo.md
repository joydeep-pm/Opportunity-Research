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

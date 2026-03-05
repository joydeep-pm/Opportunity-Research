---
name: play-store-opportunity-research
description: Research Google Play Store opportunities to find underserved Android app ideas, analyze competitors, and generate ranked opportunity reports plus an MVP PRD. Use when users ask for Play Store market research, Android opportunity discovery, category gap analysis, or "what Android app should I build" style requests.
---

# Play Store Opportunity Research

Run this skill as a 7-step pipeline:
1. Define category scope.
2. Research top Play Store charts in that scope.
3. Deep-dive into 5-8 competitors.
4. Produce a gap analysis matrix.
5. Rank top 3 opportunities.
6. Write an MVP PRD for the selected opportunity.
7. Offer scaffolding handoff.

## 1) Define Category Scope

Narrow broad categories into a specific problem space before data collection.

Use this pattern:
- `User segment`: who the app is for.
- `Primary job`: what repetitive problem they need solved.
- `High-value context`: where money/time/friction is highest.

Use examples like:
- "Credit card optimization for points-heavy US consumers."
- "Household energy usage optimizer for smart-meter homes."
- "AI habit tracker for shift workers with irregular schedules."

Reject vague prompts like "finance apps" until scope is concrete.

## 2) Play Store Charts Research

Collect top 25-50 apps from `https://play.google.com/store/apps/category/{CATEGORY}` or `https://play.google.com/store/apps/top`.

Capture for each app:
- App name and developer.
- Install bracket.
- Star rating and review count.
- Price / IAP / ads.
- 1-line value proposition.

Use two collection options:
- Browser automation for visible-store verification.
- Scripted extraction for structured JSON:

```bash
python scripts/play_store_research.py charts \
  --category FINANCE \
  --country us \
  --limit 50 \
  --out outputs/charts_finance_us.json
```

Interpret signal bands:
- `10M+ installs`: saturated, usually incumbent-heavy.
- `100K-1M installs`: proven demand with room for better UX.
- `<10K installs` with high ratings: emerging niche candidates.

## 3) Competitor Deep-Dive

Select 5-8 promising apps from chart data and collect:
- Install bracket, star rating, total ratings.
- Price/IAP/ads.
- Core features (from description/screenshots).
- Complaint themes from low-star reviews.

Run scripted deep-dive:

```bash
python scripts/play_store_research.py deep-dive \
  --charts-json outputs/charts_finance_us.json \
  --top 8 \
  --reviews 250 \
  --out outputs/deep_dive_finance_us.json
```

Green flags:
- `100K+ installs` and `<3.5` rating.
- Repeated missing-feature complaints across multiple apps.
- Clear monetization in a high-value workflow.

## 4) Gap Analysis

Build a feature matrix using [references/research_templates.md](references/research_templates.md):
- Map competitor support for core and missing features.
- Mark "YOUR APP" as explicit differentiator for unmet needs.
- Focus on repeated pain, not one-off requests.

## 5) Top 3 Opportunity Report

Rank opportunities using demand, pain intensity, monetization, and build complexity.

For each opportunity, include:
- One-line pitch.
- Market gap.
- Target user + willingness to pay.
- Monetization assumptions.
- Competitive position and why this can win.
- Build complexity (`Low` / `Medium` / `High`).

Use the report template in [references/research_templates.md](references/research_templates.md).

## 6) MVP PRD

After user selects an opportunity, generate a complete PRD using [references/mvp_prd_template.md](references/mvp_prd_template.md).

Always include:
- Executive summary.
- Market opportunity and competitor table.
- 3 target personas with pain points.
- 5-8 MVP feature groups.
- Tech stack recommendation (Kotlin/Compose, Flutter, or React Native with reasoning).
- Design direction for app UI and Play Store graphics.
- Monetization + launch strategy.
- Core data model interfaces.

## 7) Scaffold Handoff

After PRD approval, ask whether to scaffold the app immediately.

If approved:
- Choose stack from PRD.
- Create base directory structure and setup commands.
- Generate starter modules for core feature groups.

## Output Contract

Deliverables should be emitted in this order:
1. Scope statement.
2. Chart research table.
3. Deep-dive findings.
4. Gap matrix.
5. Ranked top-3 opportunities.
6. Full MVP PRD for chosen concept.
7. Optional scaffold plan/execution.

If data confidence is low (e.g., sparse reviews), call it out explicitly and recommend a focused re-run with adjusted category, country, or review volume.

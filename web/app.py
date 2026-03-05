#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import io
import json
import re
import uuid
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from flask import Flask, jsonify, render_template, request, send_file
from google_play_scraper import Sort, app, reviews, search

app_server = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
RUNS_DIR = PROJECT_ROOT / "outputs" / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)

CATEGORIES = [
    "HEALTH_AND_FITNESS",
    "LIFESTYLE",
    "PRODUCTIVITY",
    "FINANCE",
    "EDUCATION",
    "BUSINESS",
]

THEME_PATTERNS = {
    "bugs_stability": ("bug", "crash", "freeze", "lag", "slow", "error", "stuck"),
    "ads_intrusion": ("ad", "ads", "advert", "popup"),
    "pricing_paywall": ("price", "pricing", "paywall", "expensive", "subscription"),
    "sync_login": ("login", "sign in", "sync", "account", "password"),
    "missing_feature": ("missing", "feature", "option", "can't", "cannot", "wish"),
    "support_trust": ("support", "response", "privacy", "data", "scam", "refund"),
    "ux_confusion": ("confusing", "difficult", "hard", "interface", "ui", "ux"),
}

NON_PRD_DOCS = [
    "scope-brief",
    "chart-research",
    "competitor-deep-dive",
    "gap-analysis",
    "top-3-opportunity-report",
]
ALL_DOCS = NON_PRD_DOCS + ["prd"]
FILE_MIME = {
    "md": "text/markdown; charset=utf-8",
    "json": "application/json",
    "pdf": "application/pdf",
}


def api_error(message: str, status: int, code: str) -> tuple[Any, int]:
    return jsonify({"error": message, "code": code}), status


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def create_run_id() -> str:
    ts = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d-%H%M%S")
    return f"{ts}-{uuid.uuid4().hex[:6]}"


def is_valid_run_id(run_id: str) -> bool:
    return bool(re.fullmatch(r"\d{8}-\d{6}-[a-f0-9]{6}", run_id))


def run_dir(run_id: str) -> Path:
    return RUNS_DIR / run_id


def documents_dir(run_id: str) -> Path:
    return run_dir(run_id) / "documents"


def run_meta_path(run_id: str) -> Path:
    return run_dir(run_id) / "run_meta.json"


def research_path(run_id: str) -> Path:
    return run_dir(run_id) / "research.json"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def fetch_chart_app_ids_via_html(category: str, country: str, lang: str, limit: int) -> list[str]:
    hl = lang if "-" in lang else f"{lang}-US"
    gl = country.upper()
    url = (
        f"https://play.google.com/store/apps/category/{quote_plus(category.upper())}"
        f"?hl={quote_plus(hl)}&gl={quote_plus(gl)}"
    )
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=45) as response:
        html = response.read().decode("utf-8", errors="ignore")

    matches = re.findall(r"/store/apps/details\?id=([A-Za-z0-9._]+)", html)
    app_ids: list[str] = []
    seen: set[str] = set()
    for app_id in matches:
        if app_id in seen:
            continue
        seen.add(app_id)
        app_ids.append(app_id)
        if len(app_ids) >= limit:
            break
    return app_ids


def normalize_app(raw: dict[str, Any], app_id: str) -> dict[str, Any]:
    return {
        "appId": app_id,
        "title": raw.get("title"),
        "developer": raw.get("developer"),
        "installs": raw.get("installs"),
        "minInstalls": raw.get("minInstalls"),
        "score": raw.get("score"),
        "reviews": raw.get("reviews"),
        "containsAds": raw.get("containsAds"),
        "offersIAP": raw.get("offersIAP"),
        "free": raw.get("free"),
        "price": raw.get("price"),
        "currency": raw.get("currency"),
        "summary": raw.get("summary"),
        "genre": raw.get("genre"),
        "url": raw.get("url") or f"https://play.google.com/store/apps/details?id={app_id}",
    }


def review_theme_summary(raw_reviews: list[dict[str, Any]]) -> dict[str, int]:
    one_star = [r for r in raw_reviews if int(r.get("score", 0) or 0) == 1]
    joined = " ".join((r.get("content") or "").lower() for r in one_star)
    themes: dict[str, int] = {}
    for theme, keywords in THEME_PATTERNS.items():
        score = 0
        for keyword in keywords:
            score += len(re.findall(rf"\b{re.escape(keyword)}\b", joined))
        if score:
            themes[theme] = score
    return dict(sorted(themes.items(), key=lambda kv: kv[1], reverse=True))


def score_distribution(raw_reviews: list[dict[str, Any]]) -> dict[str, int]:
    counter = Counter(str(int(r.get("score", 0) or 0)) for r in raw_reviews)
    return {str(star): counter.get(str(star), 0) for star in range(1, 6)}


def get_review_summary(app_id: str, country: str, lang: str, count: int) -> dict[str, Any]:
    raw_reviews, _ = reviews(
        app_id=app_id,
        country=country,
        lang=lang,
        count=count,
        sort=Sort.NEWEST,
    )
    compact = [
        {
            "score": r.get("score"),
            "content": r.get("content"),
        }
        for r in raw_reviews
    ]
    return {
        "sampleSize": len(compact),
        "scoreDistribution": score_distribution(compact),
        "oneStarThemes": review_theme_summary(compact),
    }


def collect_chart(category: str, country: str, lang: str, limit: int) -> list[dict[str, Any]]:
    app_ids = fetch_chart_app_ids_via_html(category=category, country=country, lang=lang, limit=limit)
    rows: list[dict[str, Any]] = []
    for idx, app_id in enumerate(app_ids, start=1):
        try:
            raw = app(app_id=app_id, country=country, lang=lang)
            item = normalize_app(raw, app_id)
            item["rank"] = idx
            rows.append(item)
        except Exception as exc:
            rows.append({"rank": idx, "appId": app_id, "error": str(exc)})
    return rows


def collect_shortlist(query: str, country: str, lang: str, n_hits: int) -> list[dict[str, Any]]:
    found = search(query=query, n_hits=n_hits, country=country, lang=lang)
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for idx, item in enumerate(found, start=1):
        app_id = item.get("appId")
        if not app_id or app_id in seen:
            continue
        seen.add(app_id)
        try:
            raw = app(app_id=app_id, country=country, lang=lang)
            entry = normalize_app(raw, app_id)
            entry["queryRank"] = idx
            rows.append(entry)
        except Exception as exc:
            rows.append({"queryRank": idx, "appId": app_id, "error": str(exc)})
    return rows


def feature_supported(text: str, keywords: tuple[str, ...]) -> bool:
    low = text.lower()
    return any(word in low for word in keywords)


def build_gap_analysis(deep_dive: list[dict[str, Any]], opportunities: list[dict[str, Any]]) -> dict[str, Any]:
    apps = [x.get("app", {}) for x in deep_dive if x.get("app")]
    app_labels = [a.get("title") or a.get("appId") for a in apps[:3]]
    while len(app_labels) < 3:
        app_labels.append(f"Competitor {len(app_labels) + 1}")

    features = [
        ("Adaptive AI planning", ("ai", "coach", "recommend", "smart", "personal")),
        ("Offline logging", ("offline", "without internet", "local")),
        ("Reliable sync", ("sync", "backup", "cloud")),
        ("Privacy controls", ("privacy", "data", "permission", "security")),
        ("Local language support", ("hindi", "regional", "language", "hinglish")),
    ]

    matrix_rows = []
    for feature_name, feature_keys in features:
        row: dict[str, str] = {"feature": feature_name}
        for idx in range(3):
            summary = (apps[idx].get("summary") if idx < len(apps) else "") or ""
            row[f"app{idx+1}"] = "Yes" if feature_supported(summary, feature_keys) else "No"
        row["yourApp"] = "YES"
        matrix_rows.append(row)

    return {
        "appLabels": app_labels,
        "rows": matrix_rows,
        "recommendedOpportunity": opportunities[0] if opportunities else None,
    }


def build_opportunities(deep_dive: list[dict[str, Any]], query: str, category: str, country: str) -> list[dict[str, Any]]:
    theme_totals = Counter()
    for row in deep_dive:
        theme_totals.update(row.get("reviewSummary", {}).get("oneStarThemes", {}))

    missing = theme_totals.get("missing_feature", 0)
    sync = theme_totals.get("sync_login", 0)
    trust = theme_totals.get("support_trust", 0)
    pricing = theme_totals.get("pricing_paywall", 0)
    ux = theme_totals.get("ux_confusion", 0)

    query_label = query.title()
    candidates = [
        {
            "name": f"Adaptive {query_label} Coach",
            "pitch": "Context-aware AI plans that auto-adjust based on behavior.",
            "gap": "Competing apps under-deliver on adaptive personalization and workflow relevance.",
            "targetUser": "Users with inconsistent schedules who need practical daily guidance.",
            "monetization": "Freemium + premium coaching tier (INR 149-299/month equivalent).",
            "competition": "Existing trackers are broad; this wins with tighter adaptive loops and simplicity.",
            "complexity": "Medium",
            "score": 42 + (missing * 2) + ux,
        },
        {
            "name": f"Offline-First {query_label} Tracker",
            "pitch": "Never lose progress with local-first tracking and robust sync recovery.",
            "gap": "Login and sync friction repeatedly appear in low-star complaints.",
            "targetUser": "Android users across variable network quality and multiple devices.",
            "monetization": "Free core, paid sync/backup/export bundle (INR 99-199/month).",
            "competition": "Most apps optimize for cloud-first UX; this optimizes reliability first.",
            "complexity": "Medium",
            "score": 39 + (sync * 2) + ux,
        },
        {
            "name": f"Trust-First {query_label} Assistant",
            "pitch": "Transparent AI recommendations with strong privacy and support posture.",
            "gap": "Support/trust complaints are common but poorly addressed across competitors.",
            "targetUser": "Users who value accountability, privacy controls, and dependable support.",
            "monetization": "Subscription + annual plan with support priority (INR 199-349/month).",
            "competition": "Competitors chase growth features, leaving trust and support quality behind.",
            "complexity": "High",
            "score": 36 + trust + pricing,
        },
        {
            "name": f"Localized {query_label} Programs",
            "pitch": "Low-cost localized habit programs in Hindi and Hinglish.",
            "gap": "Pricing sensitivity and local context adaptation remain under-served.",
            "targetUser": "Tier-2/3 users and students seeking practical low-cost guidance.",
            "monetization": "Micro-subscription packs and annual bundle (INR 49-149/month).",
            "competition": "Current apps skew generic English-first experiences.",
            "complexity": "Low",
            "score": 30 + (pricing * 3) + missing,
        },
    ]

    ranked = sorted(candidates, key=lambda x: x["score"], reverse=True)[:3]
    for idx, item in enumerate(ranked, start=1):
        item["rank"] = idx
        item["context"] = {
            "country": country.upper(),
            "category": category,
            "query": query,
        }
    return ranked


def run_research_pipeline(inputs: dict[str, Any]) -> dict[str, Any]:
    category = str(inputs.get("category", "HEALTH_AND_FITNESS")).upper()
    country = str(inputs.get("country", "in")).lower()
    lang = str(inputs.get("lang", "en")).lower()
    query = str(inputs.get("query", "AI habit tracker")).strip()
    chart_limit = int(inputs.get("chartLimit", 25))
    shortlist_limit = int(inputs.get("shortlistLimit", 12))
    deep_dive_count = int(inputs.get("deepDiveCount", 8))
    review_count = int(inputs.get("reviewCount", 200))

    chart_rows = collect_chart(category=category, country=country, lang=lang, limit=chart_limit)
    shortlist_rows = collect_shortlist(
        query=query,
        country=country,
        lang=lang,
        n_hits=shortlist_limit,
    )

    deep_dive: list[dict[str, Any]] = []
    for row in shortlist_rows[:deep_dive_count]:
        app_id = row.get("appId")
        if not app_id:
            continue
        try:
            summary = get_review_summary(app_id=app_id, country=country, lang=lang, count=review_count)
            weak_at_scale = bool((row.get("score") or 0) < 3.5 and (row.get("minInstalls") or 0) >= 100000)
            repeated = bool(summary.get("oneStarThemes") and max(summary["oneStarThemes"].values()) >= 8)
            deep_dive.append(
                {
                    "app": row,
                    "reviewSummary": summary,
                    "opportunitySignals": {
                        "weakRatingAtScale": weak_at_scale,
                        "repeatedComplaintTheme": repeated,
                    },
                }
            )
        except Exception as exc:
            deep_dive.append({"app": row, "error": str(exc)})

    opportunities = build_opportunities(deep_dive=deep_dive, query=query, category=category, country=country)
    gap_analysis = build_gap_analysis(deep_dive=deep_dive, opportunities=opportunities)
    install_counter = Counter(str(x.get("installs") or "unknown") for x in chart_rows if "installs" in x)

    return {
        "generatedAt": now_iso(),
        "inputs": {
            "category": category,
            "country": country,
            "lang": lang,
            "query": query,
            "chartLimit": chart_limit,
            "shortlistLimit": shortlist_limit,
            "deepDiveCount": deep_dive_count,
            "reviewCount": review_count,
        },
        "marketSummary": {
            "chartAppsCollected": len(chart_rows),
            "shortlistedApps": len(shortlist_rows),
            "deepDiveApps": len(deep_dive),
            "installBracketDistribution": dict(install_counter.most_common()),
        },
        "charts": chart_rows,
        "shortlist": shortlist_rows,
        "deepDive": deep_dive,
        "gapAnalysis": gap_analysis,
        "opportunities": opportunities,
    }


def mk_table(headers: list[str], rows: list[list[str]]) -> str:
    header_line = "| " + " | ".join(headers) + " |"
    sep_line = "|" + "|".join(["---"] * len(headers)) + "|"
    row_lines = ["| " + " | ".join(r) + " |" for r in rows]
    return "\n".join([header_line, sep_line] + row_lines)


def scope_markdown(research: dict[str, Any]) -> str:
    inp = research["inputs"]
    return "\n".join(
        [
            "# Scope Brief",
            "",
            f"- Category: `{inp['category']}`",
            f"- Country: `{inp['country'].upper()}`",
            f"- Language: `{inp['lang']}`",
            f"- Query Focus: `{inp['query']}`",
            "",
            "## Why This Scope",
            "This run focuses on finding underserved opportunity pockets from install/rating/review signals and repeat complaint themes.",
        ]
    )


def chart_markdown(research: dict[str, Any]) -> str:
    rows = []
    for item in research["charts"][:25]:
        rows.append(
            [
                str(item.get("rank", "-")),
                item.get("title") or item.get("appId") or "-",
                item.get("developer") or "-",
                str(item.get("installs") or "-"),
                str(item.get("score") or "-"),
                str(item.get("reviews") or "-"),
            ]
        )
    table = mk_table(["Rank", "App", "Developer", "Installs", "Rating", "Reviews"], rows)
    return "\n".join(["# Chart Research", "", table])


def deep_dive_markdown(research: dict[str, Any]) -> str:
    lines = ["# Competitor Deep-Dive", ""]
    for idx, item in enumerate(research["deepDive"], start=1):
        app_row = item.get("app", {})
        lines.extend(
            [
                f"## {idx}. {app_row.get('title') or app_row.get('appId')}",
                f"- Installs: {app_row.get('installs', '-')}",
                f"- Rating: {app_row.get('score', '-')}",
                f"- Reviews: {app_row.get('reviews', '-')}",
                f"- Weak rating at scale: {item.get('opportunitySignals', {}).get('weakRatingAtScale', False)}",
                f"- Repeated complaint theme: {item.get('opportunitySignals', {}).get('repeatedComplaintTheme', False)}",
            ]
        )
        themes = item.get("reviewSummary", {}).get("oneStarThemes", {})
        if themes:
            lines.append("- One-star themes:")
            for key, value in list(themes.items())[:6]:
                lines.append(f"  - {key}: {value}")
        lines.append("")
    return "\n".join(lines)


def gap_markdown(research: dict[str, Any]) -> str:
    matrix = research["gapAnalysis"]
    labels = matrix["appLabels"]
    rows = []
    for r in matrix["rows"]:
        rows.append([r["feature"], r["app1"], r["app2"], r["app3"], r["yourApp"]])
    table = mk_table(["Feature", labels[0], labels[1], labels[2], "YOUR APP"], rows)
    return "\n".join(["# Gap Analysis", "", table])


def top3_markdown(research: dict[str, Any]) -> str:
    lines = ["# Top 3 Opportunity Report", ""]
    for opp in research["opportunities"]:
        lines.extend(
            [
                f"## {opp['rank']}. {opp['name']}",
                f"- Pitch: {opp['pitch']}",
                f"- Gap: {opp['gap']}",
                f"- Target User: {opp['targetUser']}",
                f"- Monetization: {opp['monetization']}",
                f"- Competition: {opp['competition']}",
                f"- Build Complexity: {opp['complexity']}",
                f"- Score: {opp['score']}",
                "",
            ]
        )
    return "\n".join(lines)


def prd_markdown(research: dict[str, Any], meta: dict[str, Any]) -> str:
    init_cfg = meta.get("initConfig", {})
    selected_rank = int(init_cfg.get("selectedOpportunityRank", 1))
    selected = next((x for x in research["opportunities"] if int(x["rank"]) == selected_rank), research["opportunities"][0])

    project_name = init_cfg.get("projectName", "Opportunity App")
    stack = init_cfg.get("stackPreference", "Flutter")

    lines = [
        "# MVP Product Requirements Document (PRD)",
        "",
        f"Project: **{project_name}**",
        f"Selected Opportunity: **{selected['name']}**",
        f"Preferred Stack: **{stack}**",
        "",
        "## 1) Executive Summary",
        f"{selected['name']} targets users with repeated pain in {research['inputs']['query']} workflows. The product focuses on solving high-frequency complaints surfaced in Play Store reviews while providing clear monetization and a focused Android-first launch strategy.",
        "",
        "## 2) Market Opportunity",
        f"- Category: {research['inputs']['category']}",
        f"- Market: {research['inputs']['country'].upper()}",
        f"- Shortlisted Apps: {research['marketSummary']['shortlistedApps']}",
        f"- Deep-Dive Apps: {research['marketSummary']['deepDiveApps']}",
        "",
        "## 3) Target Users",
        "1. Working professional with variable daily schedule and low consistency.",
        "2. Student wanting low-friction habit tracking and visible progress loops.",
        "3. Privacy-conscious user expecting reliable sync and clear support.",
        "",
        "## 4) MVP Feature Set",
        "1. Guided onboarding and goal setup.",
        "2. Habit logging engine with reminders and streak handling.",
        "3. AI recommendation block for adaptive daily plans.",
        "4. Insight dashboard with progress and risk indicators.",
        "5. Reliability layer: offline queue + sync reconciliation.",
        "6. Subscription and entitlement handling.",
        "7. Privacy and data controls.",
        "",
        "## 5) Tech Stack Recommendation",
        f"- Proposed: {stack}",
        "- State: Riverpod/Bloc (Flutter) or equivalent for predictable state transitions.",
        "- Backend: Supabase/Firebase for auth, storage, and lightweight APIs.",
        "- Analytics: event instrumentation for onboarding, retention, and subscription conversion.",
        "",
        "## 6) Design Direction",
        "- Visual style: modern editorial minimalism with bold cards and clear hierarchy.",
        "- Typography: strong heading scale, compact readable body text.",
        "- Color system: neutral canvas + one confident accent + status colors.",
        "- Store graphics: high-contrast benefit-led screenshots and one-line hooks.",
        "",
        "## 7) Monetization and Launch",
        f"- Core strategy: {selected['monetization']}",
        "- Launch channels: Play Store ASO, creator micro-partnerships, community groups.",
        "- 30-day KPIs: activation rate, D7 retention, trial-start conversion, paid conversion.",
        "",
        "## 8) Data Models",
        "```ts",
        "interface UserProfile {",
        "  id: string;",
        "  goal: string;",
        "  locale: string;",
        "  createdAt: string;",
        "}",
        "",
        "interface HabitItem {",
        "  id: string;",
        "  userId: string;",
        "  title: string;",
        "  frequency: 'daily' | 'weekly';",
        "  active: boolean;",
        "}",
        "",
        "interface HabitLog {",
        "  id: string;",
        "  habitId: string;",
        "  completedAt: string;",
        "  source: 'manual' | 'reminder' | 'suggestion';",
        "}",
        "",
        "interface Recommendation {",
        "  id: string;",
        "  userId: string;",
        "  title: string;",
        "  rationale: string;",
        "  confidence: number;",
        "}",
        "```",
        "",
        "## 9) Non-Goals and Risks",
        "- Non-goals: social network features, marketplace modules, web client parity in MVP.",
        "- Risks: recommendation trust, false-positive reminders, subscription friction.",
        "",
        "## 10) Acceptance Criteria",
        "- Research-backed feature scope implemented.",
        "- Initialization flow and PRD generation audited.",
        "- Analytics and billing critical paths verified.",
    ]
    return "\n".join(lines)


def markdown_to_html(markdown_text: str, title: str) -> str:
    try:
        import markdown as md_lib
    except Exception:
        body = f"<pre>{markdown_text}</pre>"
    else:
        body = md_lib.markdown(markdown_text, extensions=["tables", "fenced_code"])

    return f"""<!doctype html>
<html>
<head>
<meta charset=\"utf-8\">
<title>{title}</title>
<style>
body {{ font-family: Arial, sans-serif; padding: 24px; color: #142018; }}
h1, h2, h3 {{ color: #1f5d42; }}
table {{ border-collapse: collapse; width: 100%; margin: 12px 0; }}
th, td {{ border: 1px solid #d7e1da; padding: 8px; text-align: left; vertical-align: top; }}
code {{ background: #f5f7f6; padding: 2px 4px; border-radius: 4px; }}
pre {{ background: #f6f8f7; padding: 10px; border-radius: 6px; overflow: auto; }}
</style>
</head>
<body>
{body}
</body>
</html>
"""


def generate_pdf_from_html(html_content: str, out_path: Path) -> str | None:
    try:
        from fpdf import FPDF, HTMLMixin
    except Exception as exc:
        return f"PDF dependency missing: {exc}. Install fpdf2."

    body_match = re.search(r"<body[^>]*>(.*)</body>", html_content, flags=re.IGNORECASE | re.DOTALL)
    html_body = body_match.group(1) if body_match else html_content

    class PdfWriter(FPDF, HTMLMixin):
        pass

    try:
        pdf = PdfWriter()
        pdf.set_auto_page_break(auto=True, margin=12)
        pdf.add_page()
        pdf.write_html(html_body)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        pdf.output(str(out_path))
        return None
    except Exception as exc:
        return f"PDF rendering failed via fpdf2: {exc}"


def build_non_prd_docs(research: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        "scope-brief": {
            "title": "Scope Brief",
            "markdown": scope_markdown(research),
            "json": {
                "inputs": research["inputs"],
                "marketSummary": research["marketSummary"],
            },
        },
        "chart-research": {
            "title": "Chart Research",
            "markdown": chart_markdown(research),
            "json": {
                "inputs": research["inputs"],
                "charts": research["charts"],
            },
        },
        "competitor-deep-dive": {
            "title": "Competitor Deep-Dive",
            "markdown": deep_dive_markdown(research),
            "json": {
                "inputs": research["inputs"],
                "deepDive": research["deepDive"],
            },
        },
        "gap-analysis": {
            "title": "Gap Analysis",
            "markdown": gap_markdown(research),
            "json": {
                "inputs": research["inputs"],
                "gapAnalysis": research["gapAnalysis"],
            },
        },
        "top-3-opportunity-report": {
            "title": "Top 3 Opportunity Report",
            "markdown": top3_markdown(research),
            "json": {
                "inputs": research["inputs"],
                "opportunities": research["opportunities"],
            },
        },
    }


def persist_document(run_id: str, doc_key: str, title: str, markdown_text: str, json_payload: Any) -> dict[str, Any]:
    docs_dir = documents_dir(run_id)
    md_path = docs_dir / f"{doc_key}.md"
    json_path = docs_dir / f"{doc_key}.json"
    pdf_path = docs_dir / f"{doc_key}.pdf"

    write_text(md_path, markdown_text)
    write_json(json_path, json_payload)

    html = markdown_to_html(markdown_text, title)
    pdf_error = generate_pdf_from_html(html, pdf_path)

    available_formats = ["md", "json"]
    if pdf_error is None and pdf_path.exists():
        available_formats.append("pdf")

    return {
        "docKey": doc_key,
        "title": title,
        "formats": available_formats,
        "pdfError": pdf_error,
    }


def list_documents(run_id: str) -> list[dict[str, Any]]:
    meta = read_json(run_meta_path(run_id))
    output = []
    for doc_key in ALL_DOCS:
        doc_state = meta.get("documents", {}).get(doc_key, {})
        if not doc_state.get("generated"):
            output.append(
                {
                    "docKey": doc_key,
                    "title": doc_state.get("title") or doc_key,
                    "generated": False,
                    "formats": [],
                    "pdfError": doc_state.get("pdfError"),
                }
            )
            continue

        formats = []
        for ext in ["md", "json", "pdf"]:
            if (documents_dir(run_id) / f"{doc_key}.{ext}").exists():
                formats.append(ext)

        output.append(
            {
                "docKey": doc_key,
                "title": doc_state.get("title") or doc_key,
                "generated": True,
                "formats": formats,
                "pdfError": doc_state.get("pdfError"),
            }
        )
    return output


def build_run_response(run_id: str) -> dict[str, Any]:
    meta = read_json(run_meta_path(run_id))
    research = read_json(research_path(run_id))
    return {
        "runId": run_id,
        "generatedAt": meta.get("generatedAt"),
        "initialized": bool(meta.get("initialized")),
        "initializedAt": meta.get("initializedAt"),
        "prdGenerated": bool(meta.get("prdGenerated")),
        "initConfig": meta.get("initConfig"),
        "inputs": research.get("inputs"),
        "marketSummary": research.get("marketSummary"),
        "opportunities": research.get("opportunities"),
        "gapAnalysis": research.get("gapAnalysis"),
        "documents": list_documents(run_id),
    }


@app_server.get("/")
def home() -> str:
    return render_template("index.html", categories=CATEGORIES)


@app_server.post("/api/research")
def api_research() -> Any:
    body = request.get_json(silent=True) or {}
    research = run_research_pipeline(body)

    run_id = create_run_id()
    run_root = run_dir(run_id)
    run_root.mkdir(parents=True, exist_ok=True)

    docs_meta: dict[str, Any] = {}
    docs = build_non_prd_docs(research)
    for doc_key, spec in docs.items():
        result = persist_document(
            run_id=run_id,
            doc_key=doc_key,
            title=spec["title"],
            markdown_text=spec["markdown"],
            json_payload=spec["json"],
        )
        docs_meta[doc_key] = {
            "generated": True,
            "title": spec["title"],
            "pdfError": result.get("pdfError"),
        }

    docs_meta["prd"] = {
        "generated": False,
        "title": "MVP PRD",
        "pdfError": None,
    }

    meta = {
        "runId": run_id,
        "generatedAt": research["generatedAt"],
        "initialized": False,
        "initializedAt": None,
        "prdGenerated": False,
        "initConfig": None,
        "documents": docs_meta,
    }

    write_json(run_meta_path(run_id), meta)
    write_json(research_path(run_id), research)

    return jsonify(build_run_response(run_id))


@app_server.get("/api/runs/<run_id>")
def api_get_run(run_id: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")
    if not run_meta_path(run_id).exists() or not research_path(run_id).exists():
        return api_error("Run not found.", 404, "run_not_found")
    return jsonify(build_run_response(run_id))


@app_server.post("/api/runs/<run_id>/initialize")
def api_initialize(run_id: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")
    meta_path = run_meta_path(run_id)
    if not meta_path.exists():
        return api_error("Run not found.", 404, "run_not_found")

    body = request.get_json(silent=True) or {}
    selected_rank = int(body.get("selectedOpportunityRank", 1))
    project_name = str(body.get("projectName", "Opportunity App")).strip()
    platform = str(body.get("platform", "android")).strip().lower()
    stack = str(body.get("stackPreference", "Flutter")).strip()

    if not project_name:
        return api_error("projectName is required.", 400, "invalid_project_name")

    research = read_json(research_path(run_id))
    ranks = {int(x["rank"]) for x in research.get("opportunities", []) if "rank" in x}
    if selected_rank not in ranks:
        return api_error("selectedOpportunityRank must match one of the ranked opportunities.", 400, "invalid_opportunity_rank")

    meta = read_json(meta_path)
    meta["initialized"] = True
    meta["initializedAt"] = now_iso()
    meta["initConfig"] = {
        "selectedOpportunityRank": selected_rank,
        "projectName": project_name,
        "platform": platform,
        "stackPreference": stack,
    }
    write_json(meta_path, meta)

    return jsonify(
        {
            "runId": run_id,
            "initialized": True,
            "initializedAt": meta["initializedAt"],
            "initConfig": meta["initConfig"],
        }
    )


@app_server.post("/api/runs/<run_id>/prd")
def api_generate_prd(run_id: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")
    meta_path = run_meta_path(run_id)
    if not meta_path.exists():
        return api_error("Run not found.", 404, "run_not_found")

    meta = read_json(meta_path)
    if not meta.get("initialized"):
        return api_error("Project must be initialized before PRD generation.", 409, "prd_locked")

    body = request.get_json(silent=True) or {}
    include_tech = bool(body.get("includeTechStackNotes", True))
    include_launch = bool(body.get("includeLaunchPlan", True))

    research = read_json(research_path(run_id))
    markdown_text = prd_markdown(research=research, meta=meta)

    prd_json = {
        "runId": run_id,
        "generatedAt": now_iso(),
        "includeTechStackNotes": include_tech,
        "includeLaunchPlan": include_launch,
        "initConfig": meta.get("initConfig"),
        "inputs": research.get("inputs"),
        "marketSummary": research.get("marketSummary"),
        "selectedOpportunity": next(
            (
                x
                for x in research.get("opportunities", [])
                if int(x.get("rank", 0))
                == int(meta.get("initConfig", {}).get("selectedOpportunityRank", 1))
            ),
            research.get("opportunities", [None])[0],
        ),
        "prdMarkdown": markdown_text,
    }

    result = persist_document(
        run_id=run_id,
        doc_key="prd",
        title="MVP PRD",
        markdown_text=markdown_text,
        json_payload=prd_json,
    )

    meta["prdGenerated"] = True
    meta.setdefault("documents", {})["prd"] = {
        "generated": True,
        "title": "MVP PRD",
        "pdfError": result.get("pdfError"),
    }
    write_json(meta_path, meta)

    return jsonify(
        {
            "runId": run_id,
            "prdGenerated": True,
            "document": {
                "docKey": "prd",
                "formats": result.get("formats", []),
                "pdfError": result.get("pdfError"),
            },
        }
    )


@app_server.get("/api/runs/<run_id>/documents")
def api_documents(run_id: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")
    if not run_meta_path(run_id).exists():
        return api_error("Run not found.", 404, "run_not_found")

    meta = read_json(run_meta_path(run_id))
    return jsonify(
        {
            "runId": run_id,
            "initialized": bool(meta.get("initialized")),
            "prdGenerated": bool(meta.get("prdGenerated")),
            "documents": list_documents(run_id),
        }
    )


@app_server.get("/api/runs/<run_id>/documents/<path:doc_file>")
def api_document_file(run_id: str, doc_file: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")

    match = re.fullmatch(r"([a-z0-9\-]+)\.(md|json|pdf)", doc_file)
    if not match:
        return api_error("Document path must be <docKey>.<ext>", 400, "invalid_document_path")

    doc_key, ext = match.group(1), match.group(2)
    if doc_key not in ALL_DOCS:
        return api_error("Unknown document key.", 404, "unknown_document")

    meta_path = run_meta_path(run_id)
    if not meta_path.exists():
        return api_error("Run not found.", 404, "run_not_found")

    meta = read_json(meta_path)
    doc_state = meta.get("documents", {}).get(doc_key, {})
    if not doc_state.get("generated"):
        return api_error("Document is not generated yet.", 404, "document_not_generated")

    path = documents_dir(run_id) / f"{doc_key}.{ext}"
    if not path.exists():
        if ext == "pdf" and doc_state.get("pdfError"):
            return api_error(
                f"PDF unavailable: {doc_state['pdfError']}",
                409,
                "pdf_unavailable",
            )
        return api_error("Document file not found.", 404, "document_not_found")

    return send_file(
        path,
        mimetype=FILE_MIME[ext],
        as_attachment=True,
        download_name=path.name,
    )


@app_server.get("/api/runs/<run_id>/download/all")
def api_download_all(run_id: str) -> Any:
    if not is_valid_run_id(run_id):
        return api_error("Invalid run ID format.", 400, "invalid_run_id")
    if not run_meta_path(run_id).exists():
        return api_error("Run not found.", 404, "run_not_found")

    docs_listing = list_documents(run_id)
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("run_meta.json", run_meta_path(run_id).read_text(encoding="utf-8"))
        zf.writestr("research.json", research_path(run_id).read_text(encoding="utf-8"))

        for doc in docs_listing:
            if not doc.get("generated"):
                continue
            doc_key = doc["docKey"]
            for ext in ["md", "json", "pdf"]:
                file_path = documents_dir(run_id) / f"{doc_key}.{ext}"
                if file_path.exists():
                    zf.write(file_path, arcname=f"documents/{file_path.name}")

    buffer.seek(0)
    return send_file(
        buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"playstore-research-{run_id}.zip",
    )


if __name__ == "__main__":
    app_server.run(host="127.0.0.1", port=5050, debug=True)

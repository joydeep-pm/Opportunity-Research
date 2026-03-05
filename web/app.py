#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import re
from collections import Counter
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from flask import Flask, jsonify, render_template, request
from google_play_scraper import Sort, app, reviews, search

app_server = Flask(__name__)


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


def fetch_chart_app_ids_via_html(category: str, country: str, lang: str, limit: int) -> list[str]:
    hl = lang if "-" in lang else f"{lang}-US"
    gl = country.upper()
    url = (
        f"https://play.google.com/store/apps/category/{quote_plus(category.upper())}"
        f"?hl={quote_plus(hl)}&gl={quote_plus(gl)}"
    )
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
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


def build_opportunities(
    deep_dive: list[dict[str, Any]], query: str, category: str, country: str
) -> list[dict[str, Any]]:
    theme_totals = Counter()
    for row in deep_dive:
        theme_totals.update(row.get("reviewSummary", {}).get("oneStarThemes", {}))

    missing = theme_totals.get("missing_feature", 0)
    sync = theme_totals.get("sync_login", 0)
    trust = theme_totals.get("support_trust", 0)
    pricing = theme_totals.get("pricing_paywall", 0)
    ux = theme_totals.get("ux_confusion", 0)

    candidates = [
        {
            "name": "AI Habit Coach for Indian Daily Routines",
            "pitch": "Personalized habit plans with context-aware daily adaptation.",
            "gap": "Current apps under-deliver on adaptive routines and culturally local defaults.",
            "targetUser": "Urban professionals and students balancing variable schedules.",
            "monetization": "Freemium; INR 149-299/month for advanced AI coaching.",
            "complexity": "Medium",
            "score": 45 + (missing * 2) + ux,
        },
        {
            "name": "Offline-First Habit Tracker with Reliable Sync",
            "pitch": "Never lose streaks with local-first tracking and resilient sync.",
            "gap": "Users repeatedly complain about login/sync reliability and account friction.",
            "targetUser": "Users on unstable networks and multi-device Android usage.",
            "monetization": "Free core + INR 99/month backup, exports, and multi-device history.",
            "complexity": "Medium",
            "score": 40 + (sync * 2) + ux,
        },
        {
            "name": "Transparent Habit App with Human-in-the-Loop Support",
            "pitch": "AI nudges plus trustworthy support and clear privacy controls.",
            "gap": "Trust/support and refund-like complaints appear frequently in reviews.",
            "targetUser": "Privacy-conscious users willing to pay for dependable guidance.",
            "monetization": "INR 199/month coaching plan + annual discount.",
            "complexity": "High",
            "score": 35 + trust + pricing,
        },
        {
            "name": "Low-Cost Habit Micro-Programs in Hindi and Hinglish",
            "pitch": "Localized bite-size habit programs with accessible pricing.",
            "gap": "Pricing/paywall frustration suggests need for transparent low-cost tiers.",
            "targetUser": "Tier-2/3 India smartphone users and young earners.",
            "monetization": "INR 49-99/month regional packs, optional lifetime plan.",
            "complexity": "Low",
            "score": 30 + (pricing * 3) + missing,
        },
    ]

    ranked = sorted(candidates, key=lambda x: x["score"], reverse=True)[:3]
    for idx, item in enumerate(ranked, start=1):
        item["rank"] = idx
        item["context"] = {"country": country.upper(), "category": category, "query": query}
    return ranked


@app_server.get("/")
def home() -> str:
    return render_template("index.html", categories=CATEGORIES)


@app_server.post("/api/research")
def run_research() -> Any:
    body = request.get_json(silent=True) or {}
    category = str(body.get("category", "HEALTH_AND_FITNESS")).upper()
    country = str(body.get("country", "in")).lower()
    lang = str(body.get("lang", "en")).lower()
    query = str(body.get("query", "AI habit tracker")).strip()
    chart_limit = int(body.get("chartLimit", 25))
    shortlist_limit = int(body.get("shortlistLimit", 12))
    deep_dive_count = int(body.get("deepDiveCount", 8))
    review_count = int(body.get("reviewCount", 200))

    chart_rows = collect_chart(category=category, country=country, lang=lang, limit=chart_limit)
    shortlist_rows = collect_shortlist(
        query=query, country=country, lang=lang, n_hits=shortlist_limit
    )

    deep_dive: list[dict[str, Any]] = []
    for row in shortlist_rows[:deep_dive_count]:
        app_id = row.get("appId")
        if not app_id:
            continue
        try:
            summary = get_review_summary(
                app_id=app_id, country=country, lang=lang, count=review_count
            )
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

    install_counter = Counter(str(x.get("installs") or "unknown") for x in chart_rows if "installs" in x)
    opportunities = build_opportunities(
        deep_dive=deep_dive, query=query, category=category, country=country
    )

    return jsonify(
        {
            "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
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
            "opportunities": opportunities,
        }
    )


if __name__ == "__main__":
    app_server.run(host="127.0.0.1", port=5050, debug=True)

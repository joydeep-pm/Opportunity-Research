#!/usr/bin/env python3
"""Google Play opportunity research helper.

This CLI wraps common data collection tasks needed for Play Store opportunity
analysis. It uses `google-play-scraper` when available.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen


COLLECTION_MAP = {
    "TOP_FREE": "topselling_free",
    "TOP_PAID": "topselling_paid",
    "GROSSING": "topgrossing",
    "NEW_FREE": "new_free",
    "NEW_PAID": "new_paid",
}

THEME_PATTERNS = {
    "bugs_stability": (
        "bug",
        "crash",
        "freeze",
        "lag",
        "slow",
        "error",
        "stuck",
    ),
    "ads_intrusion": ("ad", "ads", "advert", "popup"),
    "pricing_paywall": ("price", "pricing", "paywall", "expensive", "subscription"),
    "sync_login": ("login", "sign in", "sync", "account", "password"),
    "missing_feature": ("missing", "feature", "option", "can't", "cannot", "wish"),
    "support_trust": ("support", "response", "privacy", "data", "scam", "refund"),
    "ux_confusion": ("confusing", "difficult", "hard", "interface", "ui", "ux"),
}


def load_scraper() -> Any:
    try:
        import google_play_scraper as gps  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: google-play-scraper\n"
            "Install with: pip install google-play-scraper"
        ) from exc
    return gps


def write_json(data: Any, out_path: str | None) -> None:
    payload = json.dumps(data, indent=2, ensure_ascii=True, default=str)
    if not out_path:
        print(payload)
        return
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(payload + "\n", encoding="utf-8")


def extract_app_id(item: dict[str, Any]) -> str | None:
    app_id = item.get("appId")
    if app_id:
        return str(app_id)
    url = str(item.get("url", ""))
    match = re.search(r"[?&]id=([A-Za-z0-9._]+)", url)
    return match.group(1) if match else None


def fetch_chart_app_ids_via_html(category: str, country: str, lang: str, limit: int) -> list[str]:
    hl = lang if "-" in lang else f"{lang}-US"
    gl = country.upper()
    category = category.upper()

    if category == "TOP":
        url = f"https://play.google.com/store/apps/top?hl={quote_plus(hl)}&gl={quote_plus(gl)}"
    else:
        url = (
            f"https://play.google.com/store/apps/category/{quote_plus(category)}"
            f"?hl={quote_plus(hl)}&gl={quote_plus(gl)}"
        )

    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
        html = response.read().decode("utf-8", errors="ignore")

    matches = re.findall(r"/store/apps/details\?id=([A-Za-z0-9._]+)", html)
    seen: set[str] = set()
    app_ids: list[str] = []
    for app_id in matches:
        if app_id not in seen:
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
        "ratings": raw.get("ratings"),
        "reviews": raw.get("reviews"),
        "free": raw.get("free"),
        "price": raw.get("price"),
        "currency": raw.get("currency"),
        "containsAds": raw.get("containsAds"),
        "offersIAP": raw.get("offersIAP"),
        "summary": raw.get("summary"),
        "genre": raw.get("genre"),
        "genreId": raw.get("genreId"),
        "url": raw.get("url"),
    }


def review_theme_summary(reviews_payload: list[dict[str, Any]]) -> dict[str, int]:
    one_star = [r for r in reviews_payload if int(r.get("score", 0) or 0) == 1]
    joined = " ".join((r.get("content") or "").lower() for r in one_star)
    theme_counts: dict[str, int] = {}
    for theme, keywords in THEME_PATTERNS.items():
        count = 0
        for keyword in keywords:
            count += len(re.findall(rf"\b{re.escape(keyword)}\b", joined))
        if count:
            theme_counts[theme] = count
    return dict(sorted(theme_counts.items(), key=lambda kv: kv[1], reverse=True))


def score_distribution(reviews_payload: list[dict[str, Any]]) -> dict[str, int]:
    counter = Counter(str(int(r.get("score", 0) or 0)) for r in reviews_payload)
    return {str(star): counter.get(str(star), 0) for star in range(1, 6)}


def fetch_reviews(
    gps: Any, app_id: str, country: str, lang: str, count: int, sort_name: str
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    sort_value = None
    try:
        sort_value = getattr(gps.Sort, sort_name.upper())
    except Exception:
        sort_value = None

    kwargs: dict[str, Any] = {
        "app_id": app_id,
        "lang": lang,
        "country": country,
        "count": count,
    }
    if sort_value is not None:
        kwargs["sort"] = sort_value

    reviews_payload, _ = gps.reviews(**kwargs)
    compact_reviews = [
        {
            "userName": r.get("userName"),
            "score": r.get("score"),
            "content": r.get("content"),
            "at": r.get("at"),
            "thumbsUpCount": r.get("thumbsUpCount"),
            "reviewCreatedVersion": r.get("reviewCreatedVersion"),
        }
        for r in reviews_payload
    ]

    summary = {
        "sampleSize": len(compact_reviews),
        "scoreDistribution": score_distribution(compact_reviews),
        "oneStarThemes": review_theme_summary(compact_reviews),
    }
    return compact_reviews, summary


def run_charts(args: argparse.Namespace) -> None:
    gps = load_scraper()
    category_value = args.category.upper()
    ranked: list[dict[str, Any]] = []
    collection_value = COLLECTION_MAP[args.collection.upper()]

    if hasattr(gps, "collection"):
        ranked = gps.collection(
            collection=collection_value,
            category=category_value,
            lang=args.lang,
            country=args.country,
            results=args.limit,
        )
    else:
        app_ids = fetch_chart_app_ids_via_html(
            category=category_value,
            country=args.country,
            lang=args.lang,
            limit=args.limit,
        )
        ranked = [
            {
                "appId": app_id,
                "url": f"https://play.google.com/store/apps/details?id={app_id}",
            }
            for app_id in app_ids
        ]

    rows: list[dict[str, Any]] = []
    for idx, item in enumerate(ranked, start=1):
        app_id = extract_app_id(item)
        row = {
            "rank": idx,
            "appId": app_id,
            "title": item.get("title"),
            "url": item.get("url"),
        }
        if args.hydrate and app_id:
            try:
                raw_app = gps.app(app_id=app_id, lang=args.lang, country=args.country)
                row.update(normalize_app(raw_app, app_id))
            except Exception as exc:  # pragma: no cover - remote/network failures
                row["hydrateError"] = str(exc)
        rows.append(row)

    output = {
        "kind": "charts",
        "category": category_value,
        "collection": args.collection.upper(),
        "country": args.country,
        "lang": args.lang,
        "total": len(rows),
        "apps": rows,
    }
    write_json(output, args.out)


def run_app(args: argparse.Namespace) -> None:
    gps = load_scraper()
    raw_app = gps.app(app_id=args.app_id, lang=args.lang, country=args.country)
    app_payload = normalize_app(raw_app, args.app_id)

    reviews_payload: list[dict[str, Any]] = []
    review_summary: dict[str, Any] = {}
    if args.reviews > 0:
        reviews_payload, review_summary = fetch_reviews(
            gps=gps,
            app_id=args.app_id,
            country=args.country,
            lang=args.lang,
            count=args.reviews,
            sort_name=args.sort,
        )

    output = {
        "kind": "app",
        "country": args.country,
        "lang": args.lang,
        "app": app_payload,
        "reviewSummary": review_summary,
        "reviews": reviews_payload if args.include_reviews else [],
    }
    write_json(output, args.out)


def load_app_ids(args: argparse.Namespace) -> list[str]:
    app_ids: list[str] = []
    if args.app_ids:
        app_ids.extend([x.strip() for x in args.app_ids.split(",") if x.strip()])

    if args.charts_json:
        charts_payload = json.loads(Path(args.charts_json).read_text(encoding="utf-8"))
        for app in charts_payload.get("apps", []):
            app_id = app.get("appId")
            if app_id:
                app_ids.append(str(app_id))

    # Preserve order while removing duplicates.
    seen: set[str] = set()
    ordered_unique: list[str] = []
    for app_id in app_ids:
        if app_id not in seen:
            seen.add(app_id)
            ordered_unique.append(app_id)
    return ordered_unique


def run_deep_dive(args: argparse.Namespace) -> None:
    gps = load_scraper()
    app_ids = load_app_ids(args)
    if not app_ids:
        raise SystemExit("No app IDs provided. Use --app-ids or --charts-json.")

    app_ids = app_ids[: args.top]
    entries: list[dict[str, Any]] = []
    for app_id in app_ids:
        try:
            raw_app = gps.app(app_id=app_id, lang=args.lang, country=args.country)
            app_payload = normalize_app(raw_app, app_id)
            _, review_summary = fetch_reviews(
                gps=gps,
                app_id=app_id,
                country=args.country,
                lang=args.lang,
                count=args.reviews,
                sort_name=args.sort,
            )

            score = app_payload.get("score") or 0
            min_installs = app_payload.get("minInstalls") or 0
            weak_rating_and_scale = bool(score < 3.5 and min_installs >= 100000)
            repeated_pain = bool(
                review_summary.get("oneStarThemes")
                and max(review_summary["oneStarThemes"].values()) >= 8
            )

            entries.append(
                {
                    "app": app_payload,
                    "reviewSummary": review_summary,
                    "opportunitySignals": {
                        "weakRatingAtScale": weak_rating_and_scale,
                        "repeatedComplaintTheme": repeated_pain,
                    },
                }
            )
        except Exception as exc:  # pragma: no cover - remote/network failures
            entries.append({"appId": app_id, "error": str(exc)})

    output = {
        "kind": "deep-dive",
        "country": args.country,
        "lang": args.lang,
        "appsAnalyzed": len(entries),
        "entries": entries,
    }
    write_json(output, args.out)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Collect Google Play data for opportunity research."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    charts = subparsers.add_parser("charts", help="Fetch ranked apps from category charts.")
    charts.add_argument("--category", required=True, help="Category constant, e.g. FINANCE.")
    charts.add_argument(
        "--collection",
        default="TOP_FREE",
        choices=sorted(COLLECTION_MAP.keys()),
        help="Chart type.",
    )
    charts.add_argument("--country", default="us")
    charts.add_argument("--lang", default="en")
    charts.add_argument("--limit", type=int, default=50)
    charts.add_argument(
        "--hydrate",
        action="store_true",
        help="Fetch full metadata for each chart app.",
    )
    charts.add_argument("--out", help="Output JSON path.")
    charts.set_defaults(func=run_charts)

    app = subparsers.add_parser("app", help="Fetch detailed metadata for one app.")
    app.add_argument("--app-id", required=True)
    app.add_argument("--country", default="us")
    app.add_argument("--lang", default="en")
    app.add_argument("--reviews", type=int, default=200)
    app.add_argument("--sort", default="NEWEST", help="Review sort value.")
    app.add_argument(
        "--include-reviews",
        action="store_true",
        help="Include review text payload in output.",
    )
    app.add_argument("--out", help="Output JSON path.")
    app.set_defaults(func=run_app)

    deep_dive = subparsers.add_parser(
        "deep-dive", help="Analyze a shortlist of apps with review signal extraction."
    )
    deep_dive.add_argument(
        "--app-ids",
        help="Comma-separated app IDs. Example: com.foo,com.bar",
    )
    deep_dive.add_argument(
        "--charts-json",
        help="Path to charts output JSON to source app IDs from.",
    )
    deep_dive.add_argument("--top", type=int, default=8)
    deep_dive.add_argument("--reviews", type=int, default=250)
    deep_dive.add_argument("--sort", default="NEWEST")
    deep_dive.add_argument("--country", default="us")
    deep_dive.add_argument("--lang", default="en")
    deep_dive.add_argument("--out", help="Output JSON path.")
    deep_dive.set_defaults(func=run_deep_dive)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())

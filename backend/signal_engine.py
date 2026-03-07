#!/usr/bin/env python3
"""Signal Engine backend pipeline.

Connectors:
- RSS feeds (Substack + AI newsletter)
- Serper News API (optional)
- Apify X actor (optional)

Synthesis:
- OpenAI model -> 3-4 paragraph India-focused strategic memo

Output:
- Writes markdown digest to project root: daily_signal.md
"""

from __future__ import annotations

import html
import json
import logging
import os
import re
import ssl
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

import certifi
import feedparser
from apify_client import ApifyClient
from dotenv import load_dotenv
from openai import OpenAI

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = PROJECT_ROOT / "daily_signal.md"
SERPER_BASE_URL = "https://google.serper.dev"


def setup_env() -> None:
    load_dotenv(BACKEND_DIR / ".env")
    load_dotenv(PROJECT_ROOT / ".env", override=False)


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )


def clean_text(raw: str, max_len: int = 900) -> str:
    if not raw:
        return ""
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_len]


def parse_entry_datetime(entry: Any) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        struct_time = entry.get(key)
        if struct_time:
            return datetime(*struct_time[:6], tzinfo=timezone.utc)
    return None


def parse_iso_datetime(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        normalized = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def bounded_int(env_name: str, default: int, low: int, high: int) -> int:
    try:
        value = int(os.getenv(env_name, str(default)))
    except Exception:
        value = default
    return max(low, min(high, value))


def get_substack_feeds() -> dict[str, str]:
    return {
        "Lenny Rachitsky": os.getenv("SUBSTACK_FEED_LENNY", "https://www.lennysnewsletter.com/feed"),
        "John Cutler": os.getenv("SUBSTACK_FEED_JOHN", "https://cutlefish.substack.com/feed"),
        "Elena Verna": os.getenv("SUBSTACK_FEED_ELENA", "https://plgrowth.substack.com/feed"),
        "Code Newsletter AI": os.getenv("AI_NEWS_FEED_URL", "https://codenewsletter.ai/feed"),
    }


def get_x_handles() -> list[str]:
    handles_raw = os.getenv("X_HANDLES", "shreyas,aakashgupta")
    handles = [h.strip().lstrip("@") for h in handles_raw.split(",") if h.strip()]
    return handles or ["shreyas", "aakashgupta"]


def get_source_mode() -> str:
    return os.getenv("SOURCE_MODE", "rss_serper").strip().lower()


def connector_enabled(mode: str, connector: str) -> bool:
    mode_map = {
        "rss": {"rss"},
        "serper": {"serper"},
        "apify": {"apify"},
        "rss_serper": {"rss", "serper"},
        "serper_apify": {"serper", "apify"},
        "hybrid": {"rss", "serper", "apify"},
        "all": {"rss", "serper", "apify"},
    }
    enabled = mode_map.get(mode, mode_map["rss_serper"])
    return connector in enabled


def get_serper_queries() -> list[str]:
    configured = os.getenv("SERPER_QUERIES", "").strip()
    if configured:
        queries = [q.strip() for q in configured.split("||") if q.strip()]
        if queries:
            return queries

    return [
        "Lenny Rachitsky product management latest",
        "John Cutler product strategy latest",
        "Elena Verna growth product latest",
        "India fintech RBI AI lending automation latest",
    ]


def fetch_substack_content(cutoff_utc: datetime) -> list[str]:
    logging.info("Fetching RSS entries since %s", cutoff_utc.isoformat())
    collected: list[tuple[datetime, str]] = []

    for author, feed_url in get_substack_feeds().items():
        try:
            ssl_context = ssl.create_default_context(cafile=certifi.where())
            request = urllib.request.Request(
                feed_url,
                headers={"User-Agent": "Mozilla/5.0 (SignalEngine/1.0)"},
            )
            with urllib.request.urlopen(request, context=ssl_context, timeout=20) as response:
                feed_bytes = response.read()
            parsed = feedparser.parse(feed_bytes)
        except Exception as exc:
            logging.warning("RSS HTTPS fetch fallback for %s (%s): %s", author, feed_url, exc)
            parsed = feedparser.parse(feed_url)

        if parsed.bozo:
            logging.warning("RSS parse warning for %s (%s): %s", author, feed_url, parsed.bozo_exception)

        for entry in parsed.entries:
            published_at = parse_entry_datetime(entry)
            if published_at and published_at < cutoff_utc:
                continue

            title = clean_text(entry.get("title", "Untitled"), max_len=240)
            summary = clean_text(entry.get("summary", ""), max_len=700)
            link = entry.get("link", "")
            published_str = published_at.isoformat() if published_at else "unknown"

            block = "\n".join(
                [
                    f"Source: {author} (RSS)",
                    f"Title: {title}",
                    f"Published: {published_str}",
                    f"Summary: {summary or 'No summary provided.'}",
                    f"URL: {link}",
                ]
            )
            collected.append((published_at or datetime.now(timezone.utc), block))

    collected.sort(key=lambda row: row[0], reverse=True)
    results = [block for _, block in collected]
    logging.info("Collected %d RSS items", len(results))
    return results


def parse_serper_date(raw: str | None, now_utc: datetime) -> datetime | None:
    if not raw:
        return None

    text = raw.strip().lower()
    if not text:
        return None

    match = re.search(r"(\d+)\s*(minute|hour|day|week|month|year)s?\s+ago", text)
    if match:
        qty = int(match.group(1))
        unit = match.group(2)
        if unit == "minute":
            return now_utc - timedelta(minutes=qty)
        if unit == "hour":
            return now_utc - timedelta(hours=qty)
        if unit == "day":
            return now_utc - timedelta(days=qty)
        if unit == "week":
            return now_utc - timedelta(weeks=qty)
        if unit == "month":
            return now_utc - timedelta(days=30 * qty)
        if unit == "year":
            return now_utc - timedelta(days=365 * qty)

    cleaned = raw.replace("Sept ", "Sep ").strip()
    for fmt in ("%b %d, %Y", "%B %d, %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(cleaned, fmt).replace(tzinfo=timezone.utc)
        except Exception:
            continue
    return None


def serper_post(endpoint: str, payload: dict[str, Any], api_key: str) -> dict[str, Any]:
    url = f"{SERPER_BASE_URL}/{endpoint.lstrip('/')}"
    data = json.dumps(payload).encode("utf-8")
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    request = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "X-API-KEY": api_key,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (SignalEngine/1.0)",
        },
    )
    with urllib.request.urlopen(request, context=ssl_context, timeout=20) as response:
        body = response.read().decode("utf-8", errors="ignore")

    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Unexpected Serper response format")
    return parsed


def fetch_serper_content(cutoff_utc: datetime) -> list[str]:
    enabled = os.getenv("SERPER_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"}
    if not enabled:
        logging.info("SERPER_ENABLED is false. Skipping Serper connector.")
        return []

    api_key = os.getenv("SERPER_API_KEY")
    if not api_key:
        logging.info("SERPER_API_KEY not set. Skipping Serper connector.")
        return []

    gl = os.getenv("SERPER_GL", "in").strip() or "in"
    hl = os.getenv("SERPER_HL", "en").strip() or "en"
    num = bounded_int("SERPER_NUM", default=5, low=1, high=10)
    max_queries = bounded_int("SERPER_MAX_QUERIES", default=4, low=1, high=12)
    queries = get_serper_queries()[:max_queries]

    logging.info("Fetching Serper news for %d queries (gl=%s, hl=%s, num=%d)", len(queries), gl, hl, num)

    now_utc = datetime.now(timezone.utc)
    collected: list[tuple[datetime, str, str]] = []
    seen_urls: set[str] = set()

    for query in queries:
        payload = {"q": query, "gl": gl, "hl": hl, "num": num}
        try:
            response = serper_post("news", payload, api_key)
            items = response.get("news", []) if isinstance(response.get("news"), list) else []

            for item in items:
                if not isinstance(item, dict):
                    continue

                link = str(item.get("link", "")).strip()
                if not link or link in seen_urls:
                    continue

                published_at = parse_serper_date(item.get("date"), now_utc)
                if published_at and published_at < cutoff_utc:
                    continue

                title = clean_text(str(item.get("title", "Untitled")), max_len=260)
                snippet = clean_text(str(item.get("snippet", "")), max_len=700)
                source_name = clean_text(str(item.get("source", "Serper")), max_len=90)
                date_str = published_at.isoformat() if published_at else str(item.get("date", "unknown"))

                block = "\n".join(
                    [
                        f"Source: {source_name} (Serper News)",
                        f"Query: {query}",
                        f"Title: {title}",
                        f"Published: {date_str}",
                        f"Summary: {snippet or 'No summary provided.'}",
                        f"URL: {link}",
                    ]
                )
                collected.append((published_at or now_utc, link, block))
                seen_urls.add(link)
        except Exception as exc:
            logging.warning("Serper query failed (%s): %s", query, exc)

    collected.sort(key=lambda row: row[0], reverse=True)
    results = [block for _, _, block in collected]
    logging.info("Collected %d Serper news items", len(results))
    return results


def fetch_x_threads_apify(cutoff_utc: datetime) -> list[str]:
    """Fetch recent X posts using Apify tweet scraper actor."""

    token = os.getenv("APIFY_API_TOKEN")
    handles = get_x_handles()

    if not token:
        logging.info("APIFY_API_TOKEN not set. Skipping Apify X connector.")
        return []

    client = ApifyClient(token)
    collected: list[str] = []
    run_input = {
        "twitterHandles": handles,
        "maxItems": 20,
        "sort": "Latest",
    }

    try:
        logging.info("Running Apify actor apidojo/tweet-scraper for handles: %s", ", ".join(handles))
        run = client.actor("apidojo/tweet-scraper").call(run_input=run_input)
        dataset_id = run.get("defaultDatasetId")
        if not dataset_id:
            logging.warning("No dataset returned by Apify actor.")
            return []

        dataset = client.dataset(dataset_id)
        for item in dataset.iterate_items():
            created_at = parse_iso_datetime(
                item.get("createdAt")
                or item.get("created_at")
                or item.get("timestamp")
            )
            if created_at and created_at < cutoff_utc:
                continue

            text = clean_text(
                item.get("fullText")
                or item.get("text")
                or item.get("content")
                or "",
                max_len=900,
            )
            if not text:
                continue

            source_handle = (
                item.get("author", {}).get("userName")
                if isinstance(item.get("author"), dict)
                else item.get("userName")
            ) or "unknown"

            url = (
                item.get("url")
                or item.get("tweetUrl")
                or item.get("permanentUrl")
                or f"https://x.com/{source_handle}"
            )

            collected.append(
                "\n".join(
                    [
                        f"Source: {source_handle} (X)",
                        f"Thread: {text}",
                        f"Published: {(created_at.isoformat() if created_at else 'unknown')}",
                        f"URL: {url}",
                    ]
                )
            )
    except Exception as exc:
        logging.warning("Apify fetch failed for handles %s: %s", ", ".join(handles), exc)
        return []

    logging.info("Collected %d X items", len(collected))
    return collected


def enforce_narrative_memo(raw_text: str) -> str:
    """Normalize model output to 3-4 prose paragraphs and strip list formatting."""
    cleaned_lines: list[str] = []
    for line in raw_text.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if not stripped:
            cleaned_lines.append("")
            continue
        stripped = re.sub(r"^([-*•]|\d+[.)])\s+", "", stripped)
        cleaned_lines.append(stripped)

    cleaned_text = "\n".join(cleaned_lines).strip()
    paragraphs = [
        re.sub(r"\s+", " ", paragraph).strip()
        for paragraph in re.split(r"\n\s*\n", cleaned_text)
        if paragraph.strip()
    ]

    if len(paragraphs) >= 3:
        return "\n\n".join(paragraphs[:4]) + "\n"

    combined = re.sub(r"\s+", " ", cleaned_text).strip()
    if not combined:
        combined = (
            "Signal inputs are currently sparse. Re-run ingestion once more source content is available, "
            "then synthesize implications for Indian fintech execution, RBI compliance, and enterprise AI rollout."
        )

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", combined) if s.strip()]
    while len(sentences) < 6:
        sentences.append(
            "Prioritize India-specific validation by combining RBI-aligned guardrails with customer workflow testing."
        )

    first_cut = max(1, len(sentences) // 3)
    second_cut = max(first_cut + 1, (2 * len(sentences)) // 3)
    normalized = [
        " ".join(sentences[:first_cut]).strip(),
        " ".join(sentences[first_cut:second_cut]).strip(),
        " ".join(sentences[second_cut:]).strip(),
    ]

    return "\n\n".join([p for p in normalized if p]) + "\n"


def synthesize_with_openai(content_blocks: Iterable[str]) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to backend/.env or project .env")

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    payload = "\n\n---\n\n".join(content_blocks)
    if not payload.strip():
        payload = "No source content collected in the configured window."

    system_prompt = (
        "You are a strategic analyst curating a daily newsletter for an Indian fintech/AI product leader. "
        "Extract 3-5 KEY SIGNALS from the source material and format each as a distinct newsletter item. "
        "Each signal should have: (1) catchy title, (2) source attribution, (3) exactly 2 concise paragraphs. "
        "Filter everything through Indian fintech, RBI regulations, lending automation, and enterprise AI applications. "
        "Focus on actionable insights, not generic trends."
    )

    user_prompt = (
        "Extract 3-5 key signals from the content below and format as a newsletter.\n\n"
        "FORMAT (use this exact structure):\n"
        "---\n"
        "## 🎯 [Catchy Signal Title]\n"
        "**Source:** [Author Name] | [Publication/Platform]\n\n"
        "[Paragraph 1: What's the core insight or development?]\n\n"
        "[Paragraph 2: Why does this matter for Indian fintech/AI product leaders? What's the action?]\n"
        "---\n\n"
        "HARD CONSTRAINTS:\n"
        "- 3-5 signals maximum\n"
        "- Each signal: title, source, exactly 2 paragraphs\n"
        "- India fintech + RBI + enterprise AI lens throughout\n"
        "- Make titles specific and compelling\n\n"
        f"SOURCE CONTENT:\n{payload}"
    )

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=model,
        max_output_tokens=1200,
        temperature=0.2,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    synthesized = (getattr(response, "output_text", None) or "").strip()
    if not synthesized:
        synthesized = str(response)

    # Return newsletter format directly without forcing paragraph structure
    if not synthesized or len(synthesized) < 50:
        return (
            "## 🎯 No Signals Available\n"
            "**Source:** System\n\n"
            "Signal inputs are currently sparse. Re-run ingestion once more source content is available.\n\n"
            "Prioritize India-specific validation by combining RBI-aligned guardrails with customer workflow testing.\n"
        )

    return synthesized


def write_output(markdown: str) -> None:
    OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    logging.info("Wrote signal digest to %s", OUTPUT_PATH)


def main() -> None:
    setup_env()
    configure_logging()

    window_hours = bounded_int("SIGNAL_WINDOW_HOURS", default=48, low=1, high=10000)
    cutoff_utc = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    source_mode = get_source_mode()

    logging.info("Signal window: last %d hours", window_hours)
    logging.info("Source mode: %s", source_mode)

    combined_blocks: list[str] = []
    if connector_enabled(source_mode, "rss"):
        combined_blocks.extend(fetch_substack_content(cutoff_utc))
    if connector_enabled(source_mode, "serper"):
        combined_blocks.extend(fetch_serper_content(cutoff_utc))
    if connector_enabled(source_mode, "apify"):
        combined_blocks.extend(fetch_x_threads_apify(cutoff_utc))

    markdown = synthesize_with_openai(combined_blocks)
    write_output(markdown)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Signal Engine backend pipeline.

- Pulls recent Substack RSS posts (last N hours).
- Pulls recent X content via Apify actor (placeholder-compatible).
- Synthesizes into a strategic long-form memo via OpenAI.
- Writes output markdown to project root: daily_signal.md
"""

from __future__ import annotations

import html
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


def setup_env() -> None:
    # Prefer backend/.env, then root .env.
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


def get_substack_feeds() -> dict[str, str]:
    return {
        "Lenny Rachitsky": os.getenv("SUBSTACK_FEED_LENNY", "https://www.lennysnewsletter.com/feed"),
        "John Cutler": os.getenv("SUBSTACK_FEED_JOHN", "https://cutlefish.substack.com/feed"),
        "Elena Verna": os.getenv("SUBSTACK_FEED_ELENA", "https://plgrowth.substack.com/feed"),
        "Code Newsletter AI": os.getenv("AI_NEWS_FEED_URL", "https://codenewsletter.ai/feed"),
    }


def fetch_substack_content(cutoff_utc: datetime) -> list[str]:
    logging.info("Fetching Substack RSS entries since %s", cutoff_utc.isoformat())
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
            logging.warning("Feed HTTPS fetch fallback for %s (%s): %s", author, feed_url, exc)
            parsed = feedparser.parse(feed_url)

        if parsed.bozo:
            logging.warning("Feed parse warning for %s (%s): %s", author, feed_url, parsed.bozo_exception)

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
                    f"Source: {author} (Substack)",
                    f"Title: {title}",
                    f"Published: {published_str}",
                    f"Summary: {summary or 'No summary provided.'}",
                    f"URL: {link}",
                ]
            )
            collected.append((published_at or datetime.now(timezone.utc), block))

    collected.sort(key=lambda row: row[0], reverse=True)
    results = [block for _, block in collected]
    logging.info("Collected %d Substack items", len(results))
    return results


def get_x_handles() -> list[str]:
    handles_raw = os.getenv("X_HANDLES", "shreyas,aakashgupta")
    handles = [h.strip().lstrip("@") for h in handles_raw.split(",") if h.strip()]
    return handles or ["shreyas", "aakashgupta"]


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


def fetch_x_threads_placeholder(cutoff_utc: datetime) -> list[str]:
    """Fetch recent X posts using Apify tweet scraper actor.

    If APIFY_API_TOKEN is not set, returns synthetic placeholders to keep pipeline runnable.
    """

    token = os.getenv("APIFY_API_TOKEN")
    handles = get_x_handles()

    if not token:
        logging.warning("APIFY_API_TOKEN not set. Using placeholder X content.")
        return [
            "\n".join(
                [
                    f"Source: {handle} (X)",
                    "Thread: [PLACEHOLDER] Configure APIFY_API_TOKEN to fetch live content.",
                    "Published: unknown",
                    "URL: unavailable",
                ]
            )
            for handle in handles
        ]

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
            return collected

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
        collected.extend(
            [
                "\n".join(
                    [
                        f"Source: {handle} (X)",
                        f"Thread: [PLACEHOLDER] Apify fetch failed: {exc}",
                        "Published: unknown",
                        f"URL: https://x.com/{handle}",
                    ]
                )
                for handle in handles
            ]
        )

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
        "You are a Fintech/AI Product Leader writing a strategic memo for an Indian leadership team. "
        "Synthesize the source material into a cohesive long-form narrative briefing in Markdown. "
        "Return exactly 3 to 4 paragraphs. "
        "Do not use bullet points, numbered lists, headings, or section labels. "
        "Build one storyline that connects product strategy, growth leverage, and execution implications. "
        "Filter all analysis through Indian fintech realities, RBI regulatory context, and enterprise AI applications. "
        "Explicitly connect ideas to scaling lending products, compliance management, and AI automation in India."
    )

    user_prompt = (
        "Create today's strategic signal memo from the source content below.\n"
        "Hard constraints:\n"
        "- 3 to 4 paragraphs only\n"
        "- No bullets or numbered lists\n"
        "- India fintech + RBI + enterprise AI lens throughout\n\n"
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
    return enforce_narrative_memo(synthesized)


def write_output(markdown: str) -> None:
    OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    logging.info("Wrote signal digest to %s", OUTPUT_PATH)


def main() -> None:
    setup_env()
    configure_logging()

    window_hours = int(os.getenv("SIGNAL_WINDOW_HOURS", "48"))
    cutoff_utc = datetime.now(timezone.utc) - timedelta(hours=window_hours)

    logging.info("Signal window: last %d hours", window_hours)

    substack_blocks = fetch_substack_content(cutoff_utc)
    x_blocks = fetch_x_threads_placeholder(cutoff_utc)
    combined_blocks = substack_blocks + x_blocks

    markdown = synthesize_with_openai(combined_blocks)
    write_output(markdown)


if __name__ == "__main__":
    main()

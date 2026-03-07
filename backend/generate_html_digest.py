#!/usr/bin/env python3
"""
Generate HTML digest in fintech_rbi_digest.html format
Curated: 2 PM Leaders + 2 AI + 1 RBI = 5 signals max
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SIGNAL_FILE = PROJECT_ROOT / "daily_signal.md"
OUTPUT_DIR = Path("/Users/joy/gws")  # Use user's home gws folder
OUTPUT_FILE = OUTPUT_DIR / "fintech_rbi_digest.html"

# Category mappings
PM_TOPICS = {"ProductManagement", "Strategy", "Execution", "Teams", "Growth", "GTM"}
AI_TOPICS = {"AI", "MachineLearning", "LLM", "Automation", "Enterprise"}
RBI_TOPICS = {"RBI", "Compliance", "Regulatory", "NBFC"}

PM_AUTHORS = ["lenny rachitsky", "shreyas", "shreyas doshi", "john cutler", "elena verna", "aakash gupta"]

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fintech & RBI Digest - {date}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}

        .header h1 {{
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }}

        .header .date {{
            font-size: 16px;
            opacity: 0.9;
        }}

        .header .subtitle {{
            font-size: 14px;
            opacity: 0.8;
            margin-top: 8px;
        }}

        .content {{
            padding: 30px;
        }}

        .section {{
            margin-bottom: 40px;
        }}

        .section:last-child {{
            margin-bottom: 0;
        }}

        .section-header {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e5e5;
        }}

        .section-icon {{
            font-size: 24px;
        }}

        .section-title {{
            font-size: 20px;
            font-weight: 700;
            color: #2d3748;
        }}

        .section-count {{
            background: #edf2f7;
            color: #4a5568;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }}

        .signal-card {{
            background: #f9fafb;
            border-left: 4px solid #cbd5e0;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            transition: all 0.2s;
        }}

        .signal-card:hover {{
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }}

        .signal-card.pm {{
            border-left-color: #667eea;
            background: #f7fafc;
        }}

        .signal-card.ai {{
            border-left-color: #f6ad55;
            background: #fffaf0;
        }}

        .signal-card.rbi {{
            border-left-color: #fc8181;
            background: #fff5f5;
        }}

        .signal-meta {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }}

        .signal-source {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #4a5568;
        }}

        .signal-topics {{
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }}

        .topic-tag {{
            background: #e2e8f0;
            color: #2d3748;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }}

        .signal-title {{
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 12px;
            line-height: 1.4;
        }}

        .signal-body {{
            font-size: 15px;
            line-height: 1.8;
            color: #4a5568;
        }}

        .signal-body p {{
            margin-bottom: 12px;
        }}

        .signal-body p:last-child {{
            margin-bottom: 0;
        }}

        .footer {{
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }}

        .footer p {{
            font-size: 14px;
            opacity: 0.8;
        }}

        .no-signals {{
            text-align: center;
            padding: 40px;
            color: #718096;
            font-size: 15px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Fintech & RBI Digest</h1>
            <div class="date">{date}</div>
            <div class="subtitle">Curated insights for Indian fintech product leaders</div>
        </div>

        <div class="content">
            {sections}
        </div>

        <div class="footer">
            <p>Generated with Signal Engine · {timestamp}</p>
        </div>
    </div>
</body>
</html>
"""

SECTION_TEMPLATE = """
<div class="section">
    <div class="section-header">
        <div class="section-icon">{icon}</div>
        <div class="section-title">{title}</div>
        <div class="section-count">{count} {label}</div>
    </div>
    {cards}
</div>
"""

SIGNAL_CARD_TEMPLATE = """
<div class="signal-card {category}">
    <div class="signal-meta">
        <div class="signal-source">{source}</div>
        {topics}
    </div>
    <div class="signal-title">{title}</div>
    <div class="signal-body">
        {body}
    </div>
</div>
"""


def parse_signal_markdown(markdown: str) -> list[dict]:
    """Parse signals from markdown."""
    signals = []
    blocks = markdown.split("---")

    for block in blocks:
        block = block.strip()
        if not block or len(block) < 50:
            continue

        signal = {}

        # Extract title
        title_match = re.search(r"^##\s+(.+)$", block, re.MULTILINE)
        if title_match:
            signal["title"] = title_match.group(1).replace("🎯", "").strip()
        else:
            continue

        # Extract source
        source_match = re.search(r"\*\*Source:\*\*\s+(.+?)$", block, re.MULTILINE)
        if source_match:
            signal["source"] = source_match.group(1).strip()

        # Extract topics
        topics_match = re.search(r"\*\*Topics:\*\*\s+(.+?)$", block, re.MULTILINE)
        if topics_match:
            topics_raw = topics_match.group(1).strip()
            signal["topics"] = [t.replace("#", "").strip() for t in topics_raw.split() if t.startswith("#")]
        else:
            signal["topics"] = []

        # Extract body (everything after topics)
        if topics_match:
            body_start = block.find(topics_match.group(0)) + len(topics_match.group(0))
            body = block[body_start:].strip()
        elif source_match:
            body_start = block.find(source_match.group(0)) + len(source_match.group(0))
            body = block[body_start:].strip()
        else:
            body = block

        signal["body"] = body
        signals.append(signal)

    return signals


def categorize_signal(signal: dict) -> str | None:
    """Categorize signal as PM, AI, or RBI."""
    topics = set(signal.get("topics", []))
    source = signal.get("source", "").lower()
    author = source.split("|")[0].strip().lower()

    # Check RBI first (highest priority)
    if topics & RBI_TOPICS:
        return "rbi"
    if "rbi" in source.lower() or "regulatory" in source.lower():
        return "rbi"

    # Check PM leaders
    if author in PM_AUTHORS:
        return "pm"
    if topics & PM_TOPICS:
        return "pm"

    # Check AI
    if topics & AI_TOPICS:
        return "ai"

    return None


def curate_signals(signals: list[dict]) -> dict[str, list[dict]]:
    """Curate signals: 2 PM + 2 AI + 1 RBI."""
    pm_signals = []
    ai_signals = []
    rbi_signals = []

    for signal in signals:
        category = categorize_signal(signal)
        if category == "pm":
            pm_signals.append(signal)
        elif category == "ai":
            ai_signals.append(signal)
        elif category == "rbi":
            rbi_signals.append(signal)

    return {
        "pm": pm_signals[:2],  # Top 2 PM
        "ai": ai_signals[:2],  # Top 2 AI
        "rbi": rbi_signals[:1],  # Top 1 RBI
    }


def format_signal_body(body: str) -> str:
    """Format signal body as HTML paragraphs."""
    paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
    return "\n".join(f"<p>{p}</p>" for p in paragraphs[:2])  # Max 2 paragraphs


def generate_html(curated: dict[str, list[dict]]) -> str:
    """Generate HTML digest."""
    sections = []

    # PM Leaders section
    if curated["pm"]:
        cards = []
        for signal in curated["pm"]:
            topics_html = "".join(
                f'<span class="topic-tag">#{topic}</span>' for topic in signal.get("topics", [])[:3]
            )
            topics_html = f'<div class="signal-topics">{topics_html}</div>' if topics_html else ""

            card = SIGNAL_CARD_TEMPLATE.format(
                category="pm",
                source=signal.get("source", "Unknown"),
                topics=topics_html,
                title=signal["title"],
                body=format_signal_body(signal["body"]),
            )
            cards.append(card)

        section = SECTION_TEMPLATE.format(
            icon="👥",
            title="Product Leaders",
            count=len(curated["pm"]),
            label="insights",
            cards="\n".join(cards),
        )
        sections.append(section)

    # AI & ML section
    if curated["ai"]:
        cards = []
        for signal in curated["ai"]:
            topics_html = "".join(
                f'<span class="topic-tag">#{topic}</span>' for topic in signal.get("topics", [])[:3]
            )
            topics_html = f'<div class="signal-topics">{topics_html}</div>' if topics_html else ""

            card = SIGNAL_CARD_TEMPLATE.format(
                category="ai",
                source=signal.get("source", "Unknown"),
                topics=topics_html,
                title=signal["title"],
                body=format_signal_body(signal["body"]),
            )
            cards.append(card)

        section = SECTION_TEMPLATE.format(
            icon="🤖",
            title="AI & Machine Learning",
            count=len(curated["ai"]),
            label="updates",
            cards="\n".join(cards),
        )
        sections.append(section)

    # RBI & Regulatory section
    if curated["rbi"]:
        cards = []
        for signal in curated["rbi"]:
            topics_html = "".join(
                f'<span class="topic-tag">#{topic}</span>' for topic in signal.get("topics", [])[:3]
            )
            topics_html = f'<div class="signal-topics">{topics_html}</div>' if topics_html else ""

            card = SIGNAL_CARD_TEMPLATE.format(
                category="rbi",
                source=signal.get("source", "Unknown"),
                topics=topics_html,
                title=signal["title"],
                body=format_signal_body(signal["body"]),
            )
            cards.append(card)

        section = SECTION_TEMPLATE.format(
            icon="🏛️",
            title="RBI & Regulatory",
            count=len(curated["rbi"]),
            label="update",
            cards="\n".join(cards),
        )
        sections.append(section)

    if not sections:
        sections_html = '<div class="no-signals">No signals available. Run Signal Engine to generate.</div>'
    else:
        sections_html = "\n".join(sections)

    now = datetime.now()
    return HTML_TEMPLATE.format(
        date=now.strftime("%B %d, %Y"),
        timestamp=now.strftime("%I:%M %p"),
        sections=sections_html,
    )


def main():
    import re

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Read signal file
    if not SIGNAL_FILE.exists():
        print(f"Signal file not found: {SIGNAL_FILE}")
        print("Run Signal Engine first to generate signals.")
        return

    markdown = SIGNAL_FILE.read_text(encoding="utf-8")

    # Parse signals
    signals = parse_signal_markdown(markdown)
    if not signals:
        print("No signals found in daily_signal.md")
        return

    print(f"Found {len(signals)} signals")

    # Curate signals
    curated = curate_signals(signals)
    print(f"Curated: {len(curated['pm'])} PM + {len(curated['ai'])} AI + {len(curated['rbi'])} RBI")

    # Generate HTML
    html = generate_html(curated)

    # Write output
    OUTPUT_FILE.write_text(html, encoding="utf-8")
    print(f"✓ Generated: {OUTPUT_FILE}")
    print(f"  Total signals: {len(curated['pm']) + len(curated['ai']) + len(curated['rbi'])}")


if __name__ == "__main__":
    main()

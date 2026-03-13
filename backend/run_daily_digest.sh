#!/bin/bash
# Daily Signal Digest Generator
# Runs at 7am daily via cron

set -euo pipefail

# Change to project root
cd "$(dirname "$0")/.."

VENV_PYTHON="$(pwd)/.venv/bin/python"
PYTHON_BIN="python3"

if [ -x "$VENV_PYTHON" ]; then
  PYTHON_BIN="$VENV_PYTHON"
fi

echo "=== Daily Signal Digest $(date) ==="

# Step 1: Run signal engine to fetch fresh data
echo "1. Fetching signals from all sources..."
"$PYTHON_BIN" backend/signal_engine.py

# Step 2: Generate HTML digest
if [ -f backend/generate_html_digest.py ]; then
  echo "2. Generating HTML digest..."
  "$PYTHON_BIN" backend/generate_html_digest.py
  echo "✓ Digest generated: gws/fintech_rbi_digest.html"
else
  echo "2. HTML digest generator not found; skipped."
fi

echo "=== Complete $(date) ==="

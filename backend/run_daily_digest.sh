#!/bin/bash
# Daily Signal Digest Generator
# Runs at 9pm daily via cron

set -e

# Change to project root
cd "$(dirname "$0")/.."

echo "=== Daily Signal Digest $(date) ==="

# Step 1: Run signal engine to fetch fresh data
echo "1. Fetching signals from all sources..."
python3 backend/signal_engine.py

# Step 2: Generate HTML digest
echo "2. Generating HTML digest..."
python3 backend/generate_html_digest.py

# Step 3: Log completion
echo "✓ Digest generated: gws/fintech_rbi_digest.html"
echo "=== Complete $(date) ==="

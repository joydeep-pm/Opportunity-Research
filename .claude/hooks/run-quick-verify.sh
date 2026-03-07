#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "[hook] Running quick verification..."
npm run build

echo "[hook] Quick verification passed."

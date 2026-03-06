#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$ROOT_DIR/.venv/bin/python"
SIGNAL_SCRIPT="$ROOT_DIR/backend/signal_engine.py"

print_cron_instructions() {
  cat <<MSG

Daily 7:00 AM cron setup (macOS):
1. Run: crontab -e
2. Add this line:
   0 7 * * * cd "$ROOT_DIR" && "$VENV_PYTHON" "$SIGNAL_SCRIPT" >> "$ROOT_DIR/signal_engine.log" 2>&1
3. Save and exit.
4. Verify with: crontab -l

MSG
}

if [[ "${1:-}" == "--print-cron" ]]; then
  print_cron_instructions
  exit 0
fi

if [ ! -x "$VENV_PYTHON" ]; then
  echo "[start] Missing virtualenv python at $VENV_PYTHON"
  echo "[start] Run ./setup.sh first."
  exit 1
fi

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  echo "[start] Missing backend/.env"
  echo "[start] Copy backend/.env.example to backend/.env and add OPENAI_API_KEY + APIFY_API_TOKEN."
  exit 1
fi

if [ ! -f "$ROOT_DIR/frontend/package.json" ]; then
  echo "[start] frontend/package.json not found."
  exit 1
fi

print_cron_instructions

echo "[start] Launching Next.js frontend on http://localhost:3000"
(
  cd "$ROOT_DIR/frontend"
  npm run dev
)

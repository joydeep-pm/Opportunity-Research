#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$ROOT_DIR/.venv/bin/python"
SIGNAL_SCRIPT="$ROOT_DIR/backend/signal_engine.py"
ENV_FILE="$ROOT_DIR/backend/.env"

if [ ! -x "$VENV_PYTHON" ]; then
  echo "[signal] Missing $VENV_PYTHON"
  echo "[signal] Run ./setup.sh first."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[signal] Missing $ENV_FILE"
  echo "[signal] Copy backend/.env.example to backend/.env and add keys."
  exit 1
fi

if [[ "${1:-}" == "--check" ]]; then
  echo "[signal] Environment check OK"
  echo "[signal] Python: $VENV_PYTHON"
  echo "[signal] Script: $SIGNAL_SCRIPT"
  echo "[signal] Env: $ENV_FILE"
  exit 0
fi

cd "$ROOT_DIR"
"$VENV_PYTHON" "$SIGNAL_SCRIPT"

echo "[signal] Wrote /Users/joy/Opportunity Research/daily_signal.md"

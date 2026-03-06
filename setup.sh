#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
VENV_DIR="$ROOT_DIR/.venv"

printf '\n[setup] Root: %s\n' "$ROOT_DIR"
printf '[setup] Python: %s\n' "$PYTHON_BIN"

if [ ! -d "$VENV_DIR" ]; then
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

python -m pip install --upgrade pip
python -m pip install -r "$ROOT_DIR/backend/requirements.txt"

cd "$ROOT_DIR/frontend"
npm install

cat <<MSG

[setup] Completed.

Next:
1. Copy /Users/joy/Opportunity Research/backend/.env.example -> /Users/joy/Opportunity Research/backend/.env
2. Add your OpenAI and Apify keys in backend/.env
3. Start the app with: ./start.sh

MSG

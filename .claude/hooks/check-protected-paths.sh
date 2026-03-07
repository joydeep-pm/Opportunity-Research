#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "[hook] Not a git repository; skipping protected path check."
  exit 0
fi

PROTECTED_REGEX='^(prisma/migrations/|src/app/api/auth/|src/app/api/billing/|infra/)'
ALLOW_ENV="${ALLOW_PROTECTED_CHANGES:-false}"

CHANGED_FILES="$(git diff --name-only --cached --diff-filter=ACMR || true)"
if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

VIOLATIONS="$(echo "$CHANGED_FILES" | grep -E "$PROTECTED_REGEX" || true)"
if [ -n "$VIOLATIONS" ] && [ "$ALLOW_ENV" != "true" ]; then
  echo "[hook] Blocked: staged changes touch protected paths:"
  echo "$VIOLATIONS"
  echo "[hook] Set ALLOW_PROTECTED_CHANGES=true only when intentional."
  exit 1
fi

echo "[hook] Protected path check passed."

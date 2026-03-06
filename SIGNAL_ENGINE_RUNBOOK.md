# Signal Engine Runbook

## Step 1: Backend Synthesis Pipeline
- Script: `/Users/joy/Opportunity Research/backend/signal_engine.py`
- Sources:
  - Substack: Lenny, John Cutler, Elena (PLGrowth)
  - X: `@shreyas`, `@aakashgupta` via `apidojo/tweet-scraper`
- Model: OpenAI (`OPENAI_MODEL`, default `gpt-4.1-mini`)
- Output: `/Users/joy/Opportunity Research/daily_signal.md`

## Step 2: Frontend Dashboard
- App: `/Users/joy/Opportunity Research/frontend`
- Intent-driven Omnibar with Signal workspace
- Reads signal markdown via `/api/signal`
- Regenerates via `/api/signal/refresh`

## Step 3: Setup and Start Scripts
- Install deps:
  ```bash
  cd /Users/joy/Opportunity\ Research
  ./setup.sh
  ```
- Start app:
  ```bash
  cd /Users/joy/Opportunity\ Research
  ./start.sh
  ```

## Step 4: Reliability Checks
- Validate runtime wiring without calling the model:
  ```bash
  cd /Users/joy/Opportunity\ Research
  ./run_signal_once.sh --check
  ```
- API refresh route uses project venv Python if present (`.venv/bin/python`) and falls back to `python3`.

## Step 5: Daily Scheduling (macOS cron)
- Print cron instructions:
  ```bash
  cd /Users/joy/Opportunity\ Research
  ./start.sh --print-cron
  ```
- Recommended line:
  ```cron
  0 7 * * * cd "/Users/joy/Opportunity Research" && "/Users/joy/Opportunity Research/.venv/bin/python" "/Users/joy/Opportunity Research/backend/signal_engine.py" >> "/Users/joy/Opportunity Research/signal_engine.log" 2>&1
  ```

## Environment File
Create `/Users/joy/Opportunity Research/backend/.env` from `.env.example` and set:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (keep `gpt-4.1-mini` for lower cost)
- `APIFY_API_TOKEN`
- `SIGNAL_WINDOW_HOURS` (default `48`)
- `AI_NEWS_FEED_URL` (default `https://codenewsletter.ai/feed`)

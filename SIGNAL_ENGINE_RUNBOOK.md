# Signal Engine Runbook

## Step 1: Backend Synthesis Pipeline
- Script: `/Users/joy/Opportunity Research/backend/signal_engine.py`
- Sources:
  - RSS: Lenny, John Cutler, Elena (PLGrowth), Code Newsletter AI
  - Serper News API (optional, recommended for freshness)
  - X: `@shreyas`, `@aakashgupta` via `apidojo/tweet-scraper` (optional)
- Connector mode is controlled by `SOURCE_MODE` (`rss`, `serper`, `apify`, `rss_serper`, `serper_apify`, `hybrid`/`all`).
- Model: OpenAI (`OPENAI_MODEL`, default `gpt-4.1-mini`)
- Output: `/Users/joy/Opportunity Research/daily_signal.md`

## Step 2: Frontend Dashboard
- App: `/Users/joy/Opportunity Research` (root Next.js app)
- PM Knowledge OS dashboard with Home, Signals, Research, Write, and Vault surfaces
- Reads signal markdown via `/api/signal`
- Preferred manual refresh path: `/api/signal/python-refresh`
- Fallback refresh path: `/api/signal/refresh`

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
- Canonical local schedule: run `backend/signal_engine.py` every day at 7:00 AM.
- Install the cron entry:
  ```bash
  cd /Users/joy/Opportunity\ Research
  ./backend/setup_cron.sh
  ```
- Recommended line:
  ```cron
  0 7 * * * cd "/Users/joy/Opportunity Research" && "/Users/joy/Opportunity Research/.venv/bin/python" "/Users/joy/Opportunity Research/backend/signal_engine.py" >> "/Users/joy/Opportunity Research/logs/digest_cron.log" 2>&1
  ```
- Operational log file: `/Users/joy/Opportunity Research/logs/digest_cron.log`

## Environment File
Create `/Users/joy/Opportunity Research/backend/.env` from `.env.example` and set:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (keep `gpt-4.1-mini` for lower cost)
- `SOURCE_MODE` (recommended: `rss_serper`)
- `SERPER_API_KEY` (recommended)
- `APIFY_API_TOKEN` (optional)
- `SERPER_ENABLED`, `SERPER_QUERIES`, `SERPER_GL`, `SERPER_HL`, `SERPER_NUM`
- `SIGNAL_WINDOW_HOURS` (default `48`)
- `AI_NEWS_FEED_URL` (default `https://codenewsletter.ai/feed`)

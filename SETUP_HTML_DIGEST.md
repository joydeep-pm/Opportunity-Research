# HTML Digest Setup Guide

## 🎯 What You Get

**Daily 9pm automatic generation** of `fintech_rbi_digest.html` with:
- **2 PM Leader signals** (Lenny, Shreyas, Aakash, John, Elena)
- **2 AI/ML signals** (AI, automation, enterprise AI)
- **1 RBI/Regulatory signal** (RBI, compliance, NBFC)

**Total: 5 curated signals** (not 5-8 random)

**Output location:** `/Users/joy/gws/fintech_rbi_digest.html`

---

## ⚡ Quick Setup (5 minutes)

### 1. Install Python Dependencies
```bash
cd "/Users/joy/Opportunity Research/backend"
pip3 install -r requirements.txt
```

**This installs:**
- feedparser (RSS feeds)
- openai (GPT synthesis)
- apify-client (Twitter scraping)
- duckduckgo-search (free search)
- google-api-python-client (optional)
- certifi, python-dotenv

### 2. Test Manual Generation
```bash
cd "/Users/joy/Opportunity Research"

# Step 1: Generate signals from all sources
python3 backend/signal_engine.py

# Step 2: Generate HTML digest (2 PM + 2 AI + 1 RBI)
python3 backend/generate_html_digest.py

# Check output
open /Users/joy/gws/fintech_rbi_digest.html
```

### 3. Setup Daily 9pm Automation
```bash
cd "/Users/joy/Opportunity Research"
bash backend/setup_cron.sh
```

**This creates a cron job that runs daily at 9:00 PM:**
- Fetches fresh signals from all sources (RSS + Serper + DuckDuckGo + Twitter)
- Curates 2 PM + 2 AI + 1 RBI signals
- Generates `/Users/joy/gws/fintech_rbi_digest.html`
- Logs to `logs/digest_cron.log`

---

## 🔧 Configuration

### Data Sources (backend/.env)

Current configuration:
```bash
# Mode: hybrid = RSS + Serper + DuckDuckGo + Twitter
SOURCE_MODE=hybrid

# Twitter handles to scrape
X_HANDLES=shreyas,aakashgupta,lennysan,elenaverna

# RSS feeds
SUBSTACK_FEED_LENNY=https://www.lennysnewsletter.com/feed
SUBSTACK_FEED_JOHN=https://cutlefish.substack.com/feed
SUBSTACK_FEED_ELENA=https://plgrowth.substack.com/feed
AI_NEWS_FEED_URL=https://codenewsletter.ai/feed
RBI_PRESS_RELEASES=https://www.rbi.org.in/Scripts/RSSFeed.aspx
INC42_FINTECH=https://inc42.com/buzz/feed/
YOURSTORY_FINTECH=https://yourstory.com/feed
MEDIANAMA_TECH=https://www.medianama.com/feed/

# Search APIs
DUCKDUCKGO_ENABLED=true
SERPER_ENABLED=true
```

### Curation Rules (backend/generate_html_digest.py)

**PM Leader signals** come from:
- Authors: Lenny Rachitsky, Shreyas Doshi, Aakash Gupta, John Cutler, Elena Verna
- OR topics: #ProductManagement, #Strategy, #Execution, #Teams, #Growth

**AI signals** come from:
- Topics: #AI, #MachineLearning, #LLM, #Automation, #Enterprise

**RBI signals** come from:
- Topics: #RBI, #Compliance, #Regulatory, #NBFC
- OR source contains "RBI", "regulatory"

---

## 🐛 Troubleshooting

### Issue: "No signals found in daily_signal.md"
**Solution:** Run signal engine first
```bash
python3 backend/signal_engine.py
```

### Issue: "ModuleNotFoundError: No module named 'feedparser'"
**Solution:** Install dependencies
```bash
cd backend
pip3 install -r requirements.txt
```

### Issue: "Aakash's X posts not appearing"
**Possible causes:**
1. Twitter scraping disabled (check `SOURCE_MODE=hybrid`)
2. Apify token invalid (check `APIFY_API_TOKEN` in backend/.env)
3. Aakash not posting with product/AI topics

**Debug:**
```bash
# Run signal engine and check logs
python3 backend/signal_engine.py 2>&1 | grep -i "apify\|twitter\|aakash"

# Check if Apify is enabled
grep "SOURCE_MODE\|APIFY" backend/.env
```

### Issue: "PM Leader view shows nothing in web UI"
**Cause:** Old signals in `daily_signal.md` don't have newsletter format

**Solution:** Generate fresh signals
```bash
# Delete old signals
rm daily_signal.md

# Generate fresh signals with newsletter format
python3 backend/signal_engine.py

# Now web UI should work
npm run dev
# Visit http://localhost:3000, click Signal Engine, wait for it to load
```

---

## 📊 How It Works

### Data Flow
```
┌─────────────────────────────────────────┐
│ 1. Signal Engine (Python)              │
│    - Scrapes RSS (8 feeds)              │
│    - Scrapes Serper (India fintech)     │
│    - Scrapes DuckDuckGo (free search)   │
│    - Scrapes Twitter (@aakash, @shreyas)│
│    - Synthesizes with OpenAI (5-8 sigs) │
│    - Writes: daily_signal.md            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. HTML Generator (Python)              │
│    - Reads: daily_signal.md             │
│    - Filters PM leaders (Lenny, etc.)   │
│    - Filters AI topics                  │
│    - Filters RBI topics                 │
│    - Curates: 2 PM + 2 AI + 1 RBI       │
│    - Writes: /Users/joy/gws/fintech_... │
└─────────────────────────────────────────┘
                    ↓
         fintech_rbi_digest.html
         (Clean, curated, 5 signals)
```

### Cron Schedule
```
0 21 * * *  = Every day at 9:00 PM
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Dependencies installed: `pip3 list | grep feedparser`
- [ ] Signal engine runs: `python3 backend/signal_engine.py`
- [ ] HTML generated: `ls -la /Users/joy/gws/fintech_rbi_digest.html`
- [ ] Cron job installed: `crontab -l | grep digest`
- [ ] HTML has 5 signals: `grep "<h3>" /Users/joy/gws/fintech_rbi_digest.html | wc -l`

---

## 📁 Files Created

### New Scripts
- `backend/generate_html_digest.py` - HTML generator (2 PM + 2 AI + 1 RBI)
- `backend/run_daily_digest.sh` - Daily automation script
- `backend/setup_cron.sh` - Cron job installer

### Output
- `/Users/joy/gws/fintech_rbi_digest.html` - Daily digest (9pm)
- `logs/digest_cron.log` - Automation logs

---

## 🎬 Demo Commands

### Manual run (test everything)
```bash
cd "/Users/joy/Opportunity Research"

# Full pipeline
bash backend/run_daily_digest.sh

# Just HTML (if signals already exist)
python3 backend/generate_html_digest.py
```

### Check logs
```bash
# Cron log
tail -f logs/digest_cron.log

# Signal engine output (when run manually)
python3 backend/signal_engine.py 2>&1 | tee logs/signal_engine.log
```

---

## 🚀 Next Steps

1. **Install dependencies** (5 min)
2. **Test manual generation** (2 min)
3. **Setup cron job** (1 min)
4. **Wait for 9pm** or run manually to test

**After first run, you'll have:**
- Curated HTML digest with 5 signals
- Daily automatic updates at 9pm
- Clean format matching your existing fintech_rbi_digest.html

---

**Questions or issues?** Check troubleshooting section above.

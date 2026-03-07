# Signal Engine Improvement Plan
**Created:** 2026-03-07
**Owner:** Joy (Product Manager, Digital Lending + AI Native)

---

## 🔴 Critical Issues Found

### 1. Twitter/X Scraping is Disabled
**Problem:**
- Aakash Gupta and Shreyas are configured (`X_HANDLES=shreyas,aakashgupta`)
- But scraping is disabled because:
  - Next.js API route doesn't support Twitter/X at all
  - Python backend has Apify integration but `SOURCE_MODE=rss_serper` excludes it
  - No tweets are being ingested despite Aakash posting frequently

**Impact:** Missing 50%+ of valuable product leader insights

### 2. Wrong Signal Format
**Problem:**
- System generates dense 3-4 paragraph blob instead of structured newsletter
- Next.js route creates TWO windows (Fintech/RBI, Product)
- Python backend creates proper 3-5 signal newsletter format but isn't used
- UI expects newsletter format with `---` separators but receives blob

**Impact:** Signals are unreadable, can't bookmark individual insights, no source attribution

### 3. No Topic Categorization
**Problem:**
- All signals mixed together
- Can't filter by: RBI, Fintech, Product Management, AI/ML, Lending
- No way to see "What did Product leaders say this week?"

**Impact:** Can't efficiently consume relevant insights for your role

### 4. Missing Product Leader Voices
**Configured but not being scraped:**
- Shreyas Doshi (@shreyas) - Product strategy
- Aakash Gupta (@aakashgupta) - AI + Product
- Lenny Rachitsky (RSS only, not Twitter)
- Elena Verna (RSS only, not Twitter)

**Impact:** Missing real-time insights from Twitter threads

---

## 🎯 Improvement Plan

### **Phase 1: Enable Full Data Sources** (Week 1)

#### 1.1 Connect Twitter/X Scraping
**Tasks:**
- [ ] Update `SOURCE_MODE=hybrid` in backend/.env to enable RSS + Serper + Apify
- [ ] Add Twitter scraping to Next.js API route OR switch to Python backend
- [ ] Verify Apify token is valid: `APIFY_API_TOKEN=<set-in-env>`
- [ ] Test with handles: `shreyas,aakashgupta,lennysan,elenaverna`
- [ ] Expand to more product leaders: Marty Cagan, Gibson Biddle, etc.

**Technical Approach:**
```typescript
// Option A: Add Apify to Next.js route
async function fetchTwitterPosts(handles: string[], cutoff: Date) {
  const apifyToken = process.env.APIFY_API_TOKEN;
  // Call Apify actor "apidojo/tweet-scraper"
}

// Option B: Use Python backend (recommended)
// Call backend/signal_engine.py from Next.js route
```

**Success Metric:** Twitter posts appear in next signal refresh

---

#### 1.2 Add LinkedIn Scraping (Optional)
**Rationale:** Many Indian fintech/product leaders active on LinkedIn
- Kunal Shah (CRED)
- Sameer Nigam (PhonePe)
- Bhavish Aggarwal (Ola)

**Technical:** Use Apify LinkedIn scraper or Serper LinkedIn search

---

#### 1.3 Add Regulatory Sources
**RBI-specific sources:**
- RBI Press Releases RSS: `https://www.rbi.org.in/Scripts/RSSFeed.aspx`
- NPCI Updates
- SEBI Circulars (if relevant)

**Fintech News:**
- Inc42 India Fintech: `https://inc42.com/buzz/feed/`
- YourStory Fintech: `https://yourstory.com/feed/fintech`
- Medianama Fintech: RSS or Serper

**Success Metric:** 20+ sources across RSS + Serper + Twitter + LinkedIn

---

### **Phase 2: Fix Signal Structure** (Week 1-2)

#### 2.1 Switch to Newsletter Format
**Current:** Dense 3-4 paragraph blob
**Target:** 5-8 individual signal cards

**Implementation:**
```markdown
---
## 🎯 RBI's New AI Framework for NBFC Lending
**Source:** Aakash Gupta | Twitter
**Topics:** #RBI #AI #Lending #Compliance

[Paragraph 1: What's the insight?]
[Paragraph 2: Why it matters for Indian fintech PMs]
---

## 🎯 Cross-Functional Team Debugging at Scale
**Source:** John Cutler | Product Newsletter
**Topics:** #ProductManagement #Teams #Execution

[Paragraph 1: Core insight]
[Paragraph 2: Action for product leaders]
---
```

**Changes needed:**
- Update OpenAI prompt in `/api/signal/refresh/route.ts` to match Python backend format
- OR switch to Python backend entirely
- Update parser to extract topics/tags from each signal

**Success Metric:** 5-8 distinct signal cards per refresh

---

#### 2.2 Add Topic Tagging
**Tag System:**
- **Regulatory:** #RBI #NPCI #Compliance #Legal
- **Fintech:** #Lending #Payments #UPI #BNPL #Neobank
- **Product:** #ProductManagement #Strategy #Execution #Growth
- **AI/ML:** #AI #MachineLearning #LLM #Automation
- **Technology:** #Engineering #Architecture #DevOps

**Implementation:**
```typescript
type SignalTopic = "RBI" | "Fintech" | "Product" | "AI" | "Tech" | "Growth";

type SignalItem = {
  id: string;
  title: string;
  source: string;
  topics: SignalTopic[];  // NEW
  body: string;
  url?: string;
  publishedAt?: string;
};
```

**AI Prompt Addition:**
```
For each signal, assign 2-3 relevant topics from:
- RBI/Regulatory
- Fintech/Lending
- Product Management
- AI/ML
- Technology/Engineering
- Growth/GTM
```

**Success Metric:** Every signal tagged with 2-3 topics

---

#### 2.3 Add Source Attribution with Author Photos
**Visual Hierarchy:**
```
┌────────────────────────────────────┐
│ [Photo] Aakash Gupta | Twitter     │
│         2h ago                     │
├────────────────────────────────────┤
│ ## RBI's AI Framework              │
│ #RBI #AI #Lending                  │
│                                    │
│ [2 paragraphs]                     │
└────────────────────────────────────┘
```

**Implementation:**
- Add `authorPhoto` field
- Use Gravatar or static mapping for known authors
- Fallback to initials avatar

---

### **Phase 3: Improve Readability & UX** (Week 2)

#### 3.1 Add Filter/Sort Controls
**Filters:**
- [ ] By Topic: All | RBI | Fintech | Product | AI
- [ ] By Source: All | Twitter | Newsletter | News
- [ ] By Author: All | Aakash | Shreyas | Lenny | etc.
- [ ] Bookmarked Only

**Sort:**
- [ ] Newest First (default)
- [ ] Oldest First
- [ ] Most Relevant (AI ranking)

**UI Mockup:**
```
┌─────────────────────────────────────────┐
│ [All Topics ▼] [All Sources ▼] [Sort ▼]│
│ [🔖 Bookmarked Only]                    │
├─────────────────────────────────────────┤
│ Showing 5 signals                       │
│                                         │
│ [Signal Card 1]                         │
│ [Signal Card 2]                         │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

#### 3.2 Reorganize Right Rail
**Current:** Signal History (good but could be better)

**Proposed:**
```
┌─────────────────────────┐
│ Quick Filters           │
├─────────────────────────┤
│ ☑ RBI/Regulatory (3)    │
│ ☑ Fintech (5)           │
│ ☑ Product Mgmt (4)      │
│ ☑ AI/ML (2)             │
├─────────────────────────┤
│ Top Authors This Week   │
├─────────────────────────┤
│ 👤 Aakash (3 posts)     │
│ 👤 Shreyas (2 posts)    │
│ 👤 Lenny (1 post)       │
├─────────────────────────┤
│ 🔖 Bookmarks (12)       │
├─────────────────────────┤
│ 📜 History              │
│ Signal Refresh 2h ago   │
│ Signal Refresh 1d ago   │
└─────────────────────────┘
```

---

#### 3.3 Add "View Modes"
**Options:**
1. **Newsletter View** (default) - Card-based, full text
2. **Compact View** - Title + source + 1-line summary
3. **Topic View** - Group by RBI, Fintech, Product, AI sections
4. **Timeline View** - Chronological with date headers

**Topic View Example:**
```
## RBI & Regulatory (3 signals)
[Signal 1]
[Signal 2]
[Signal 3]

## Product Management (4 signals)
[Signal 4]
[Signal 5]
...

## AI & ML (2 signals)
[Signal 8]
[Signal 9]
```

---

### **Phase 4: PM-Specific Features** (Week 3)

#### 4.1 "Product Leader Digest"
**Special View:**
- Filter to only Product Management thought leaders
- Group by author
- Show all Aakash posts, all Shreyas posts, etc.

**UI:**
```
┌──────────────────────────────────────┐
│ Product Leader Insights This Week   │
├──────────────────────────────────────┤
│ Aakash Gupta (3 posts)              │
│ • AI product velocity framework      │
│ • Enterprise AI ROI metrics          │
│ • Building AI-first product teams    │
├──────────────────────────────────────┤
│ Shreyas Doshi (2 posts)             │
│ • Product strategy for hypergrowth   │
│ • Decision-making frameworks         │
└──────────────────────────────────────┘
```

---

#### 4.2 "Indian Fintech Regulatory Pulse"
**Dedicated View:**
- All RBI circulars, press releases
- Regulatory analysis from experts
- Compliance deadlines/timelines
- Impact analysis for lending products

**Features:**
- [ ] Highlight breaking regulatory changes
- [ ] Timeline of upcoming compliance dates
- [ ] Historical context for new circulars

---

#### 4.3 Smart Summaries & Insights
**AI-Generated Meta-Insights:**

After each refresh, generate:
```markdown
## This Week's Themes

**Regulatory:** RBI is tightening AI governance for NBFCs.
New circular expected March 15th on model explainability.

**Product Strategy:** Thought leaders emphasizing team debugging
over individual blame. Waterline Model gaining traction.

**AI Adoption:** Enterprise AI focus shifting from POCs to
production at scale. Compliance automation emerging as killer use case.

**Key Takeaway for Digital Lending PMs:**
Prepare for RBI AI audit framework by implementing model
governance and audit trail systems now.
```

**Implementation:**
- Second AI call after signal synthesis
- Input: All signals
- Output: Meta-analysis with themes, trends, key takeaways

---

#### 4.4 Export & Share
**Features:**
- [ ] Export bookmarked signals as Markdown
- [ ] Export as PDF (formatted newsletter)
- [ ] Generate shareable link to specific signal
- [ ] Email weekly digest of bookmarked signals
- [ ] Slack/Teams integration for team sharing

---

### **Phase 5: Advanced Intelligence** (Week 4+)

#### 5.1 Personalized Relevance Scoring
**Track your interests:**
- Implicit: Which signals you bookmark, read fully
- Explicit: Topic preferences, author follows

**AI Ranking:**
- Rank signals by relevance to your interests
- Highlight "High Priority" signals at top
- Dim or collapse low-relevance signals

---

#### 5.2 Cross-Signal Connections
**Link Related Signals:**
```
This signal relates to:
→ "RBI AI Framework" from 2 days ago
→ "Compliance Automation" from last week
```

**Implementation:**
- Semantic similarity search (embeddings)
- Show "Related Signals" section in each card

---

#### 5.3 Historical Trend Analysis
**Features:**
- "RBI regulatory activity is up 40% this month"
- "Product leaders discussing AI 3x more than last quarter"
- Graph of topic frequency over time

---

#### 5.4 Slack/Email Alerts
**Real-Time Notifications:**
- New RBI circular detected → Instant Slack alert
- Aakash posts about AI governance → Email digest
- Breaking fintech news → Push notification

---

## 📊 Success Metrics

### Data Quality
- [ ] 20+ sources connected (RSS + Twitter + LinkedIn + News)
- [ ] 50+ signals per week
- [ ] 90%+ signals have proper source attribution
- [ ] 100% signals have topic tags

### User Experience
- [ ] Signals displayed in newsletter format (not blob)
- [ ] Filter by topic works
- [ ] Bookmark feature works
- [ ] Export to PDF/Markdown works

### Product Manager Workflow
- [ ] Can see "What did Product leaders say this week?" in <30 seconds
- [ ] Can filter to "RBI + Lending" signals in 1 click
- [ ] Can bookmark and export key insights for team sharing
- [ ] Weekly digest sent to email automatically

---

## 🚀 Implementation Roadmap

### **Week 1: Data Foundation**
1. Enable Twitter/X scraping (SOURCE_MODE=hybrid)
2. Add RBI RSS feeds
3. Switch to newsletter format
4. Add topic tagging to AI prompt

**Deliverable:** 5-8 signals per refresh with topics, from all sources

### **Week 2: UX Polish**
1. Add filter/sort controls
2. Reorganize right rail with topic filters
3. Add "Topic View" mode
4. Add author photos and better visual hierarchy

**Deliverable:** Can filter signals by topic and author

### **Week 3: PM Features**
1. Build "Product Leader Digest" view
2. Build "RBI Regulatory Pulse" view
3. Add AI meta-insights (weekly themes)
4. Export to PDF/Markdown

**Deliverable:** PM-specific workflows optimized

### **Week 4: Intelligence Layer**
1. Personalized relevance scoring
2. Cross-signal connections
3. Historical trend graphs
4. Slack/Email alerts

**Deliverable:** Smart, personalized signal intelligence

---

## 🔧 Technical Implementation

### Option A: Enhance Next.js Route (Faster)
**File:** `src/app/api/signal/refresh/route.ts`

**Changes:**
1. Add Twitter scraping via Apify client
2. Add LinkedIn scraping (optional)
3. Update OpenAI prompt to newsletter format
4. Add topic extraction to prompt
5. Return structured signals with topics

**Pros:** Self-contained, serverless-friendly
**Cons:** Duplicates logic from Python backend

---

### Option B: Use Python Backend (Recommended)
**File:** `backend/signal_engine.py`

**Changes:**
1. Update SOURCE_MODE to `hybrid`
2. Add topic tagging to synthesis
3. Create `/api/signal/python-refresh` route that calls Python script
4. Parse and return structured output

**Pros:** Full-featured, better scraping, cleaner separation
**Cons:** Requires Python runtime (already have it)

**Implementation:**
```typescript
// src/app/api/signal/python-refresh/route.ts
export async function POST() {
  // Call Python backend
  const result = await exec('python3 backend/signal_engine.py');

  // Parse output
  const markdown = await fs.readFile('daily_signal.md', 'utf8');
  const signals = parseNewsletterFormat(markdown);

  // Add to state
  setLatestSignalSnapshot({ signals, updatedAt: new Date() });

  return NextResponse.json({ ok: true, signals });
}
```

---

## 📁 File Changes Required

### New Files
- [ ] `src/components/SignalFilters.tsx` - Topic/source/author filters
- [ ] `src/components/SignalTopicView.tsx` - Grouped by topic view
- [ ] `src/components/ProductLeaderDigest.tsx` - PM-specific view
- [ ] `src/components/RBIPulse.tsx` - Regulatory-specific view
- [ ] `src/lib/signalTopics.ts` - Topic taxonomy and utilities

### Modified Files
- [ ] `backend/.env` - Change SOURCE_MODE to `hybrid`
- [ ] `backend/signal_engine.py` - Add topic tagging
- [ ] `src/app/api/signal/refresh/route.ts` - Add Twitter OR call Python
- [ ] `src/app/api/signal/route.ts` - Parse topics from signals
- [ ] `src/components/SignalNewsletter.tsx` - Add topic badges, filters
- [ ] `src/app/layout.tsx` - Update right rail with topic filters

---

## 🎯 Quick Wins (Do First)

### 1. Enable Twitter Scraping (30 min)
```bash
# Edit backend/.env
SOURCE_MODE=hybrid  # was rss_serper

# Test
python3 backend/signal_engine.py
```

**Expected:** Aakash and Shreyas posts appear in next refresh

---

### 2. Fix Signal Format (1 hour)
**Update:** `src/app/api/signal/refresh/route.ts` line 342-363

**Change prompt to:**
```javascript
const systemPrompt = [
  "You are a strategic analyst curating a daily newsletter for an Indian fintech/AI product leader.",
  "Extract 5-8 KEY SIGNALS from the source material and format each as a distinct newsletter item.",
  "Each signal should have: (1) catchy title, (2) source attribution, (3) 2-3 topic tags, (4) exactly 2 paragraphs.",
].join(" ");

const userPrompt = [
  "Extract 5-8 key signals and format as newsletter.\n",
  "FORMAT:\n",
  "---\n",
  "## 🎯 [Title]\n",
  "**Source:** [Author] | [Platform]\n",
  "**Topics:** #RBI #AI #Lending\n\n",
  "[Paragraph 1]\n\n",
  "[Paragraph 2]\n",
  "---\n\n",
  "Choose topics from: RBI, Compliance, Fintech, Lending, Payments, ProductManagement, AI, ML, Engineering, Growth\n\n",
  "SOURCE CONTENT:\n",
  context,
].join("");
```

**Expected:** Newsletter cards appear instead of blob

---

### 3. Add Topic Filters (2 hours)
Create `src/components/SignalFilters.tsx`:
```typescript
export default function SignalFilters({
  signals,
  onFilterChange
}: SignalFiltersProps) {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const topics = extractUniqueTopics(signals);

  return (
    <div className="flex gap-2">
      {topics.map(topic => (
        <button
          key={topic}
          onClick={() => toggleTopic(topic)}
          className={selectedTopics.has(topic) ? 'active' : ''}
        >
          {topic} ({countByTopic(signals, topic)})
        </button>
      ))}
    </div>
  );
}
```

**Expected:** Can click "RBI" and see only RBI-related signals

---

## ❓ Questions for You

1. **Priority Order:** Which phase do you want first?
   - Option A: Week 1 (Data + Format) → Week 2 (UX) → Week 3 (PM Features)
   - Option B: Quick wins only (Twitter + Format + Filters)
   - Option C: Custom priority

2. **Additional Sources:** Any other thought leaders or sources to add?
   - Indian fintech founders (Kunal Shah, Sameer Nigam)?
   - International voices (Marty Cagan, Teresa Torres)?
   - Specific publications (TechCrunch India, VentureBeat AI)?

3. **View Preferences:** Which view mode is most important?
   - Newsletter view (current)
   - Topic view (grouped by RBI/Fintech/Product)
   - Author view (all Aakash posts together)
   - Timeline view (chronological)

4. **Integration:** Do you want Slack/Email alerts?
   - Real-time alerts for RBI circulars?
   - Daily digest email?
   - Weekly summary?

---

## 📝 Next Steps

**Immediate Actions:**
1. Review this plan
2. Confirm priorities
3. I'll implement Phase 1 (Data + Format fixes)
4. Test with you
5. Iterate on UX based on feedback

**Timeline:**
- Quick wins: Today (2-3 hours)
- Week 1: Data foundation (4-6 hours)
- Week 2: UX polish (6-8 hours)
- Week 3+: PM features (ongoing)

---

**Ready to proceed? Which phase should I start with?**

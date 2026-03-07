import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { setLatestSignalSnapshot, type SignalSection } from "../state";

export const runtime = "nodejs";

type SignalItem = {
  source: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  channel: "rss" | "serper";
};

type ChatContentPart = {
  text?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | ChatContentPart[];
    };
  }>;
};

const repoRoot = process.cwd();
const signalPath = path.join(repoRoot, "daily_signal.md");

const DEFAULT_RSS_FEEDS = [
  "https://www.lennysnewsletter.com/feed",
  "https://cutlefish.substack.com/feed",
  "https://plgrowth.substack.com/feed",
  "https://codenewsletter.ai/feed",
];

const DEFAULT_SERPER_QUERIES = [
  "India fintech RBI compliance enterprise AI lending automation",
  "NBFC digital lending India RBI circular AI risk management",
  "UPI payments fraud prevention AI India fintech product strategy",
];

function toEnvList(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  const values = raw
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length ? values : fallback;
}

function parseInteger(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clampText(raw: string, maxLen: number): string {
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen - 1).trimEnd()}…`;
}

function decodeEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'");
}

function stripHtml(raw: string): string {
  return decodeEntities(raw)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTagValue(block: string, tags: string[]): string {
  for (const tag of tags) {
    const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = block.match(pattern);
    if (match?.[1]) {
      return stripHtml(match[1]);
    }
  }
  return "";
}

function getLinkValue(block: string): string {
  const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (hrefMatch?.[1]) return hrefMatch[1].trim();
  const textLink = getTagValue(block, ["link", "id"]);
  return textLink.trim();
}

function extractBlocks(xml: string): string[] {
  const collect = (pattern: RegExp): string[] => {
    const blocks: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(xml)) !== null) {
      blocks.push(match[0]);
    }
    return blocks;
  };

  const itemBlocks = collect(/<item\b[\s\S]*?<\/item>/gi);
  if (itemBlocks.length) return itemBlocks;
  return collect(/<entry\b[\s\S]*?<\/entry>/gi);
}

function toIsoDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function parseRss(xml: string, sourceUrl: string, startDate: Date, maxItems: number): SignalItem[] {
  const sourceHost = (() => {
    try {
      return new URL(sourceUrl).hostname;
    } catch {
      return sourceUrl;
    }
  })();

  const blocks = extractBlocks(xml);
  const items: SignalItem[] = [];

  for (const block of blocks) {
    if (items.length >= maxItems) break;

    const title = getTagValue(block, ["title"]);
    const url = getLinkValue(block);
    const publishedRaw = getTagValue(block, ["pubDate", "published", "updated"]);
    const publishedAt = toIsoDate(publishedRaw);

    if (!title || !url) continue;

    if (publishedAt) {
      const published = new Date(publishedAt);
      if (published < startDate) continue;
    }

    const snippet =
      getTagValue(block, ["description", "summary", "content:encoded", "content"]) ||
      "No summary available.";

    items.push({
      source: sourceHost,
      title: clampText(title, 180),
      url,
      snippet: clampText(snippet, 380),
      publishedAt,
      channel: "rss",
    });
  }

  return items;
}

async function fetchRssFeed(feedUrl: string, startDate: Date, maxItems: number): Promise<SignalItem[]> {
  const response = await fetch(feedUrl, {
    headers: {
      "User-Agent": "SignalEngine/1.0 (+https://opportunity-research.vercel.app)",
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed (${response.status}) for ${feedUrl}`);
  }

  const xml = await response.text();
  return parseRss(xml, feedUrl, startDate, maxItems);
}

function formatDateForQuery(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function fetchSerperNews(query: string, startDate: Date): Promise<SignalItem[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  const gl = (process.env.SERPER_GL || "in").trim();
  const hl = (process.env.SERPER_HL || "en").trim();
  const num = parseInteger(process.env.SERPER_NUM, 10);
  const afterDate = formatDateForQuery(startDate);

  const response = await fetch("https://google.serper.dev/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      q: `${query} after:${afterDate}`,
      gl,
      hl,
      num,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Serper failed (${response.status}) for query "${query}": ${details}`);
  }

  const json = (await response.json()) as {
    news?: Array<{ title?: string; link?: string; snippet?: string; date?: string; source?: string }>;
  };

  const rows = json.news || [];
  return rows
    .filter((row) => Boolean(row.title && row.link))
    .map((row) => ({
      source: row.source || "serper.news",
      title: clampText((row.title || "").trim(), 180),
      url: (row.link || "").trim(),
      snippet: clampText((row.snippet || "No summary available.").trim(), 380),
      publishedAt: toIsoDate(row.date),
      channel: "serper",
    }));
}

function dedupeAndSort(items: SignalItem[]): SignalItem[] {
  const seen = new Set<string>();
  const deduped: SignalItem[] = [];

  for (const item of items) {
    const key = item.url || `${item.title}::${item.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function buildInputContext(items: SignalItem[], startDate: Date): string {
  const windowNote = `Signal window starts: ${startDate.toISOString()}`;
  const lines = items.map((item, index) => {
    const time = item.publishedAt ? item.publishedAt : "unknown-time";
    return [
      `Item ${index + 1}`,
      `Channel: ${item.channel}`,
      `Source: ${item.source}`,
      `Published: ${time}`,
      `Title: ${item.title}`,
      `URL: ${item.url}`,
      `Snippet: ${item.snippet}`,
    ].join("\n");
  });

  return [windowNote, ...lines].join("\n\n");
}

function normalizeModelOutput(content: string | ChatContentPart[] | undefined): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  const text = content
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return text;
}

function parseSignalSections(raw: string): SignalSection[] {
  // Parse newsletter format: signals separated by "---"
  const signalBlocks = raw.split(/\n?---\n?/).filter((s) => s.trim());

  if (signalBlocks.length === 0) {
    return [
      {
        key: "signal-0",
        title: "Daily Signal",
        body: raw.trim(),
      },
    ];
  }

  return signalBlocks.map((block, index) => {
    const trimmed = block.trim();

    // Extract title (## heading)
    const titleMatch = trimmed.match(/^##\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/🎯\s*/, "").trim() : `Signal ${index + 1}`;

    // Extract source (**Source:** ...)
    const sourceMatch = trimmed.match(/\*\*Source:\*\*\s+(.+?)$/m);
    const source = sourceMatch ? sourceMatch[1].trim() : "";

    // Extract topics (**Topics:** #Tag1 #Tag2)
    const topicsMatch = trimmed.match(/\*\*Topics:\*\*\s+(.+?)$/m);
    const topicsRaw = topicsMatch ? topicsMatch[1].trim() : "";
    const topics = topicsRaw
      .split(/\s+/)
      .filter((t) => t.startsWith("#"))
      .map((t) => t.replace(/^#/, ""));

    // Get body (everything after topics line, or after source if no topics)
    let bodyStart = 0;
    if (topicsMatch) {
      bodyStart = trimmed.indexOf(topicsMatch[0]) + topicsMatch[0].length;
    } else if (sourceMatch) {
      bodyStart = trimmed.indexOf(sourceMatch[0]) + sourceMatch[0].length;
    }
    const body = trimmed.slice(bodyStart).trim();

    // Generate unique ID for bookmarking
    const timestamp = Date.now();
    const id = `signal-${timestamp}-${index}`;

    return {
      key: `signal-${index}`,
      title,
      body,
      source,
      topics,
      id,
    };
  });
}

function sectionsToMarkdown(sections: SignalSection[]): string {
  return sections.map((section) => `## ${section.title}\n\n${section.body}`).join("\n\n");
}

async function synthesizeSignalSections(payload: {
  model: string;
  focusLens: string;
  context: string;
}): Promise<SignalSection[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const systemPrompt = [
    "You are a strategic analyst curating a daily newsletter for an Indian fintech/AI product leader.",
    "Extract 5-8 KEY SIGNALS from the source material and format each as a distinct newsletter item.",
    "Each signal should have: (1) catchy title, (2) source attribution, (3) 2-3 topic tags, (4) exactly 2 concise paragraphs.",
    "Filter everything through Indian fintech, RBI regulations, lending automation, and enterprise AI applications.",
    "Focus on actionable insights, not generic trends. Be concrete and opinionated.",
  ].join(" ");

  const userPrompt = [
    `Focus lens: ${payload.focusLens}`,
    "",
    "Extract 5-8 key signals from the content below and format as a newsletter.",
    "",
    "FORMAT (use this exact structure):",
    "---",
    "## 🎯 [Catchy Signal Title]",
    "**Source:** [Author Name] | [Publication/Platform]",
    "**Topics:** #[Topic1] #[Topic2] #[Topic3]",
    "",
    "[Paragraph 1: What's the core insight or development?]",
    "",
    "[Paragraph 2: Why does this matter for Indian fintech/AI product leaders? What's the action?]",
    "---",
    "",
    "TOPIC OPTIONS (choose 2-3 most relevant per signal):",
    "#RBI #Compliance #Regulatory #Fintech #Lending #Payments #NBFC #UPI",
    "#ProductManagement #Strategy #Execution #Teams #Growth #GTM",
    "#AI #MachineLearning #LLM #Automation #Enterprise",
    "#Engineering #Architecture #DevOps #Technology",
    "",
    "HARD CONSTRAINTS:",
    "- Extract 5-8 signals maximum (focus on most impactful)",
    "- Each signal: title, source, 2-3 topics, exactly 2 paragraphs",
    "- India fintech + RBI + enterprise AI lens throughout",
    "- Make titles specific and compelling (not generic)",
    "- Attribute source accurately from digest below",
    "",
    "SOURCE DIGEST:",
    payload.context,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: payload.model,
      temperature: 0.35,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${details}`);
  }

  const json = (await response.json()) as ChatCompletionResponse;
  const content = normalizeModelOutput(json.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error("OpenAI returned an empty synthesis response.");
  }

  return parseSignalSections(content);
}

function jsonError(status: number, error: string, details: string, help?: string) {
  return NextResponse.json({ ok: false, error, details, help }, { status });
}

function getStartDate(): Date {
  const fromEnv = process.env.SIGNAL_START_DATE?.trim();
  if (fromEnv) {
    const parsed = new Date(fromEnv);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const windowHours = parseInteger(process.env.SIGNAL_WINDOW_HOURS, 48);
  return new Date(Date.now() - windowHours * 60 * 60 * 1000);
}

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError(
        500,
        "Missing OPENAI_API_KEY",
        "OPENAI_API_KEY is required for signal synthesis.",
        "Set OPENAI_API_KEY in your Vercel project environment variables, then redeploy.",
      );
    }

    const startDate = getStartDate();
    const perFeedLimit = parseInteger(process.env.SIGNAL_RSS_LIMIT_PER_FEED, 8);
    const rssFeeds = toEnvList(process.env.SIGNAL_RSS_FEEDS, DEFAULT_RSS_FEEDS);
    const serperQueries = toEnvList(process.env.SERPER_QUERIES, DEFAULT_SERPER_QUERIES);
    const focusLens =
      process.env.SIGNAL_FOCUS_LENS ||
      "Indian fintech, RBI regulatory posture, enterprise AI operations, lending scale";
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const rssResults = await Promise.allSettled(
      rssFeeds.map((feed) => fetchRssFeed(feed, startDate, perFeedLimit)),
    );

    const serperResults = process.env.SERPER_API_KEY
      ? await Promise.allSettled(serperQueries.map((query) => fetchSerperNews(query, startDate)))
      : [];

    const rssItems = rssResults
      .filter((result): result is PromiseFulfilledResult<SignalItem[]> => result.status === "fulfilled")
      .flatMap((result) => result.value);
    const serperItems = serperResults
      .filter((result): result is PromiseFulfilledResult<SignalItem[]> => result.status === "fulfilled")
      .flatMap((result) => result.value);

    const rssErrors = rssResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason?.message || String(result.reason));
    const serperErrors = serperResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason?.message || String(result.reason));

    const items = dedupeAndSort([...rssItems, ...serperItems]).slice(0, 70);

    if (!items.length) {
      return jsonError(
        502,
        "No source items available",
        "RSS and Serper connectors returned zero usable items.",
        "Verify RSS feed URLs and SERPER_API_KEY, then retry refresh.",
      );
    }

    const context = buildInputContext(items, startDate);
    const sections = await synthesizeSignalSections({ model, focusLens, context });
    const markdown = sectionsToMarkdown(sections);
    const updatedAt = new Date().toISOString();

    let filePersisted = false;
    let fileWriteWarning: string | null = null;
    try {
      await fs.writeFile(signalPath, `${markdown}\n`, "utf8");
      filePersisted = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fileWriteWarning = `Could not persist daily_signal.md on this runtime: ${message}`;
    }

    const meta: Record<string, unknown> = {
      model,
      focusLens,
      startDate: startDate.toISOString(),
      itemCount: items.length,
      rssCount: rssItems.length,
      serperCount: serperItems.length,
      rssErrors,
      serperErrors,
      filePersisted,
      fileWriteWarning,
    };

    setLatestSignalSnapshot({
      markdown,
      updatedAt,
      sections,
      meta,
    });

    return NextResponse.json({
      ok: true,
      markdown,
      sections,
      updatedAt,
      meta,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return jsonError(
      500,
      "Signal refresh failed",
      details,
      "Check OPENAI_API_KEY/SERPER_API_KEY and review connector/network limits.",
    );
  }
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLatestSignalSnapshot, type SignalSection } from "./state";

export const runtime = "nodejs";

const repoRoot = process.cwd();
const signalPath = path.join(repoRoot, "daily_signal.md");

function parseSectionsFromMarkdown(markdown: string): SignalSection[] {
  const headingRegex = /^##\s+(.+)\s*$/gm;
  const headings: Array<{ title: string; start: number; end: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({ title: match[1].trim(), start: match.index, end: headingRegex.lastIndex });
  }

  if (!headings.length) {
    return [
      {
        key: "fintech-rbi",
        title: "Fintech / RBI Window",
        body: markdown.trim(),
      },
    ];
  }

  return headings.map((heading, index) => {
    const bodyStart = heading.end;
    const bodyEnd = index + 1 < headings.length ? headings[index + 1].start : markdown.length;
    const rawBody = markdown.slice(bodyStart, bodyEnd).trim();
    const lowerTitle = heading.title.toLowerCase();
    const key: "fintech-rbi" | "product" =
      lowerTitle.includes("fintech") || lowerTitle.includes("rbi") ? "fintech-rbi" : "product";

    return {
      key,
      title: heading.title,
      body: rawBody,
    };
  });
}

export async function GET() {
  try {
    const markdown = await fs.readFile(signalPath, "utf8");
    const stats = await fs.stat(signalPath);

    return NextResponse.json({
      markdown,
      sections: parseSectionsFromMarkdown(markdown),
      exists: true,
      updatedAt: stats.mtime.toISOString(),
      source: "filesystem",
    });
  } catch {
    const snapshot = getLatestSignalSnapshot();
    if (snapshot) {
      return NextResponse.json({
        markdown: snapshot.markdown,
        exists: true,
        updatedAt: snapshot.updatedAt,
        sections: snapshot.sections,
        source: "memory",
        meta: snapshot.meta,
      });
    }

    return NextResponse.json({
      markdown:
        "No signal file found yet.\n\nRun **Signal Engine** from the Quick Launch panel to generate one.",
      exists: false,
      updatedAt: null,
      source: "none",
    });
  }
}

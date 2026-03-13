import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLatestSignalSnapshot, type SignalSection } from "./state";

export const runtime = "nodejs";

const repoRoot = process.cwd();
const signalPath = path.join(repoRoot, "daily_signal.md");

function parseSectionsFromMarkdown(markdown: string): SignalSection[] {
  // Parse newsletter format: signals separated by "---"
  const signals = markdown.split(/\n?---\n?/).filter(s => s.trim());

  if (!signals.length || signals.length === 1) {
    // Fallback to old paragraph format
    return [
      {
        key: "fintech-rbi",
        title: "Daily Signal",
        body: markdown.trim(),
      },
    ];
  }

  return signals.map((signal, index) => {
    const trimmedSignal = signal.trim();

    // Extract title (## heading)
    const titleMatch = trimmedSignal.match(/^##\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Signal ${index + 1}`;

    // Extract source (**Source:** ...)
    const sourceMatch = trimmedSignal.match(/\*\*Source:\*\*\s+(.+)$/m);
    const source = sourceMatch ? sourceMatch[1].trim() : "";

    // Get body (everything after source line)
    const bodyStart = sourceMatch ? trimmedSignal.indexOf(sourceMatch[0]) + sourceMatch[0].length : 0;
    const body = trimmedSignal.slice(bodyStart).trim();

    // Generate unique ID for bookmarking
    const id = `signal-${Date.now()}-${index}`;

    return {
      key: `signal-${index}`,
      title,
      body,
      source,
      id,
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
      freshness: {
        source: "filesystem",
        ageMinutes: Math.max(0, Math.round((Date.now() - stats.mtime.getTime()) / 60000)),
        label: "Persisted snapshot",
      },
    });
  } catch {
    const snapshot = getLatestSignalSnapshot();
    if (snapshot) {
      const updatedAtMs = new Date(snapshot.updatedAt).getTime();
      return NextResponse.json({
        markdown: snapshot.markdown,
        exists: true,
        updatedAt: snapshot.updatedAt,
        sections: snapshot.sections,
        source: "memory",
        meta: snapshot.meta,
        freshness: {
          source: "memory",
          ageMinutes: Number.isFinite(updatedAtMs) ? Math.max(0, Math.round((Date.now() - updatedAtMs) / 60000)) : null,
          label: "In-memory latest run",
        },
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

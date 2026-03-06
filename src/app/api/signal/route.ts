import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLatestSignalSnapshot } from "./state";

export const runtime = "nodejs";

const repoRoot = process.cwd();
const signalPath = path.join(repoRoot, "daily_signal.md");

export async function GET() {
  try {
    const markdown = await fs.readFile(signalPath, "utf8");
    const stats = await fs.stat(signalPath);

    return NextResponse.json({
      markdown,
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

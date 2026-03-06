import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const repoRoot = path.resolve(process.cwd(), "..");
const signalPath = path.join(repoRoot, "daily_signal.md");

export async function GET() {
  try {
    const markdown = await fs.readFile(signalPath, "utf8");
    const stats = await fs.stat(signalPath);

    return NextResponse.json({
      markdown,
      exists: true,
      updatedAt: stats.mtime.toISOString(),
    });
  } catch {
    return NextResponse.json({
      markdown:
        "No signal file found yet.\n\nClick **Refresh Signal** to generate today's strategic digest.\n\nEnsure `backend/.env` is configured first.",
      exists: false,
      updatedAt: null,
    });
  }
}

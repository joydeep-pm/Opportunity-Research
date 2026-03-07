import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { setLatestSignalSnapshot, type SignalSection } from "../state";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for comprehensive data collection

const execAsync = promisify(exec);
const repoRoot = process.cwd();
const signalPath = path.join(repoRoot, "daily_signal.md");
const pythonScript = path.join(repoRoot, "backend", "signal_engine.py");

function parseNewsletterSignals(markdown: string): SignalSection[] {
  // Parse newsletter format: signals separated by "---"
  const signalBlocks = markdown.split(/\n?---\n?/).filter((s) => s.trim());

  if (signalBlocks.length === 0) {
    return [
      {
        key: "signal-0",
        title: "Daily Signal",
        body: markdown.trim(),
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

function jsonError(status: number, error: string, details: string, help?: string) {
  return NextResponse.json({ ok: false, error, details, help }, { status });
}

export async function POST() {
  try {
    // Check if Python backend exists
    try {
      await fs.access(pythonScript);
    } catch {
      return jsonError(
        500,
        "Python backend not found",
        `Signal engine script not found at: ${pythonScript}`,
        "Ensure backend/signal_engine.py exists and is accessible.",
      );
    }

    // Check if required Python packages are installed
    const backendEnv = path.join(repoRoot, "backend", ".env");
    let envExists = false;
    try {
      await fs.access(backendEnv);
      envExists = true;
    } catch {
      // .env doesn't exist, will use defaults
    }

    if (!envExists) {
      return jsonError(
        500,
        "Backend configuration missing",
        "backend/.env file not found.",
        "Create backend/.env with OPENAI_API_KEY and other configuration.",
      );
    }

    // Execute Python backend
    const startTime = Date.now();
    let stdout: string;
    let stderr: string;

    try {
      const result = await execAsync(`python3 "${pythonScript}"`, {
        cwd: repoRoot,
        timeout: 240000, // 4 minutes timeout
        env: {
          ...process.env,
          PYTHONPATH: path.join(repoRoot, "backend"),
        },
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: unknown) {
      const execError = error as { code?: number; stdout?: string; stderr?: string; message?: string };
      const errorMessage = execError.stderr || execError.stdout || execError.message || String(error);

      // Check for common errors
      if (errorMessage.includes("ModuleNotFoundError") || errorMessage.includes("ImportError")) {
        return jsonError(
          500,
          "Python dependencies not installed",
          errorMessage,
          "Run: cd backend && pip install -r requirements.txt",
        );
      }

      if (errorMessage.includes("OPENAI_API_KEY")) {
        return jsonError(
          500,
          "OPENAI_API_KEY missing",
          errorMessage,
          "Add OPENAI_API_KEY to backend/.env file.",
        );
      }

      return jsonError(
        500,
        "Python backend execution failed",
        errorMessage,
        "Check backend logs for details. Ensure Python dependencies are installed.",
      );
    }

    const duration = Date.now() - startTime;

    // Read generated signal file
    let markdown: string;
    try {
      markdown = await fs.readFile(signalPath, "utf8");
    } catch {
      return jsonError(
        500,
        "Signal file not generated",
        "Python backend ran but did not create daily_signal.md",
        "Check Python backend logs for errors during synthesis.",
      );
    }

    // Parse signals
    const sections = parseNewsletterSignals(markdown);
    const updatedAt = new Date().toISOString();

    // Extract metadata from logs
    const logLines = (stdout + stderr).split("\n");
    const itemCountMatch = logLines.find((line) => line.includes("Collected"))?.match(/(\d+)/);
    const itemCount = itemCountMatch ? parseInt(itemCountMatch[1], 10) : 0;

    const meta = {
      backend: "Python",
      duration: `${duration}ms`,
      itemCount,
      sources: [] as string[],
    };

    // Extract sources from logs
    if (stdout.includes("RSS")) meta.sources.push("RSS");
    if (stdout.includes("Serper")) meta.sources.push("Serper");
    if (stdout.includes("DuckDuckGo")) meta.sources.push("DuckDuckGo");
    if (stdout.includes("Google")) meta.sources.push("Google Custom Search");
    if (stdout.includes("Apify") || stdout.includes("X items")) meta.sources.push("Twitter/X");

    // Save to state
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
      logs: {
        stdout: stdout.substring(0, 1000), // First 1000 chars for debugging
        itemCount,
        sources: meta.sources,
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return jsonError(
      500,
      "Signal refresh failed",
      details,
      "Check server logs and ensure Python backend is configured correctly.",
    );
  }
}

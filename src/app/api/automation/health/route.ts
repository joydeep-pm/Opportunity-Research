import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const repoRoot = process.cwd();
const logPath = path.join(repoRoot, "logs", "digest_cron.log");
const envPath = path.join(repoRoot, "backend", ".env");
const venvPythonPath = path.join(repoRoot, ".venv", "bin", "python");

export async function GET() {
  const result = {
    configured: false,
    venvPythonExists: false,
    logExists: false,
    status: "manual_setup_required",
    lastRunAt: null as string | null,
    lastRunStatus: null as string | null,
    logPath: "logs/digest_cron.log",
  };

  try {
    await fs.access(envPath);
    result.configured = true;
  } catch {
    result.configured = false;
  }

  try {
    await fs.access(venvPythonPath);
    result.venvPythonExists = true;
  } catch {
    result.venvPythonExists = false;
  }

  try {
    const logText = await fs.readFile(logPath, "utf8");
    result.logExists = true;

    const lines = logText.split("\n").filter(Boolean);
    const completeLine = [...lines].reverse().find((line) => line.startsWith("=== Complete "));
    const runStartLine = [...lines].reverse().find((line) => line.startsWith("=== Daily Signal Digest "));
    const failureLine = [...lines].reverse().find((line) =>
      line.includes("ModuleNotFoundError") || line.includes("ImportError") || line.includes("Traceback") || line.includes("ERROR"),
    );

    if (completeLine) {
      const raw = completeLine.replace(/^=== Complete\s*/, "").replace(/\s*===$/, "").trim();
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        result.lastRunAt = parsed.toISOString();
      }
      result.lastRunStatus = "success";
    } else if (failureLine) {
      result.lastRunStatus = "failure";

      if (runStartLine) {
        const raw = runStartLine.replace(/^=== Daily Signal Digest\s*/, "").replace(/\s*===$/, "").trim();
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          result.lastRunAt = parsed.toISOString();
        }
      }
    }
  } catch {
    result.logExists = false;
  }

  if (result.lastRunStatus === "success") {
    result.status = "healthy";
  } else if (result.logExists) {
    result.status = "attention_needed";
  } else if (result.configured && result.venvPythonExists) {
    result.status = "ready_local";
  }

  return NextResponse.json(result);
}

import { spawn } from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, "backend", "signal_engine.py");
const signalPath = path.join(repoRoot, "daily_signal.md");
const venvPythonPath = path.join(repoRoot, ".venv", "bin", "python");
const pythonBin = existsSync(venvPythonPath) ? venvPythonPath : "python3";

function runSignalScript() {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    if (!existsSync(scriptPath)) {
      resolve({
        code: 1,
        stdout: "",
        stderr: `Signal script not found at ${scriptPath}`,
      });
      return;
    }

    const child = spawn(pythonBin, [scriptPath], {
      cwd: repoRoot,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finalize = (payload: { code: number; stdout: string; stderr: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(payload);
    };

    const timeout = setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
      finalize({
        code: 1,
        stdout,
        stderr: `${stderr}\nProcess timed out after 120 seconds.`,
      });
    }, 120_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      finalize({
        code: 1,
        stdout,
        stderr: `${stderr}\nProcess spawn error: ${err.message}`,
      });
    });

    child.on("close", (code) => {
      finalize({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function POST() {
  const result = await runSignalScript();

  if (result.code !== 0) {
    const lowered = (result.stderr || "").toLowerCase();
    const likelyServerlessRuntimeIssue =
      lowered.includes("spawn") ||
      lowered.includes("enoent") ||
      lowered.includes("not found");

    return NextResponse.json(
      {
        ok: false,
        error: "signal_engine.py failed",
        details:
          result.stderr ||
          result.stdout ||
          `Signal script failed using ${pythonBin}.`,
        help: likelyServerlessRuntimeIssue
          ? "Runtime could not execute local Python. On Vercel, either deploy a Node-only refresh path or generate daily_signal.md via external job/local runner."
          : undefined,
      },
      { status: likelyServerlessRuntimeIssue ? 503 : 500 }
    );
  }

  try {
    const markdown = await fs.readFile(signalPath, "utf8");
    const stats = await fs.stat(signalPath);

    return NextResponse.json({
      ok: true,
      markdown,
      updatedAt: stats.mtime.toISOString(),
      log: result.stdout.trim(),
      pythonBin,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Signal generated but daily_signal.md was not found.",
      },
      { status: 500 }
    );
  }
}

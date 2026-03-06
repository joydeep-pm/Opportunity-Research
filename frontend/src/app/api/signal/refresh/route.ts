import { spawn } from "node:child_process";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const repoRoot = path.resolve(process.cwd(), "..");
const scriptPath = path.join(repoRoot, "backend", "signal_engine.py");
const signalPath = path.join(repoRoot, "daily_signal.md");
const venvPythonPath = path.join(repoRoot, ".venv", "bin", "python");
const pythonBin = existsSync(venvPythonPath) ? venvPythonPath : "python3";

function runSignalScript() {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(pythonBin, [scriptPath], {
      cwd: repoRoot,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      stderr += "\nProcess timed out after 120 seconds.";
    }, 120_000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function POST() {
  const result = await runSignalScript();

  if (result.code !== 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "signal_engine.py failed",
        details: result.stderr || result.stdout || `Signal script failed using ${pythonBin}`,
      },
      { status: 500 }
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

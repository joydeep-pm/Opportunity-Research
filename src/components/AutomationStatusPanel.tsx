"use client";

import { AlertTriangle, CheckCircle2, Clock3, FileText, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { getSignalHistory } from "@/lib/signalHistory";

type AutomationHealth = {
  configured: boolean;
  venvPythonExists: boolean;
  logExists: boolean;
  status: "manual_setup_required" | "ready_local" | "attention_needed" | "healthy";
  lastRunAt: string | null;
  lastRunStatus: string | null;
  logPath: string;
};

export default function AutomationStatusPanel() {
  const [signalRuns, setSignalRuns] = useState(0);
  const [health, setHealth] = useState<AutomationHealth | null>(null);

  useEffect(() => {
    setSignalRuns(getSignalHistory().length);

    const loadHealth = async () => {
      try {
        const res = await fetch("/api/automation/health", { cache: "no-store" });
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth(null);
      }
    };

    void loadHealth();
  }, []);

  const recommendedCron = `0 7 * * * cd \"/Users/joy/Opportunity Research\" && \"/Users/joy/Opportunity Research/.venv/bin/python\" \"/Users/joy/Opportunity Research/backend/signal_engine.py\" >> \"/Users/joy/Opportunity Research/logs/digest_cron.log\" 2>&1`;

  const statusLabel = health?.status === "healthy"
    ? "Healthy"
    : health?.status === "attention_needed"
      ? "Needs attention"
      : health?.status === "ready_local"
        ? "Ready locally"
        : signalRuns > 0
          ? "Runs detected"
          : "Set up locally";

  const statusClasses = health?.status === "healthy"
    ? "bg-emerald-100 text-emerald-700"
    : health?.status === "attention_needed"
      ? "bg-amber-100 text-amber-700"
      : "bg-zinc-100 text-zinc-600";

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Automation</div>
            <h3 className="mt-1 text-sm font-semibold text-zinc-900">Daily Signal refresh</h3>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses}`}>
            {statusLabel}
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-600">
          Canonical schedule: run <code className="rounded bg-zinc-100 px-1 py-0.5">backend/signal_engine.py</code> every day at 7:00 AM.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
          {health?.configured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> backend/.env found</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><AlertTriangle className="h-3 w-3 text-amber-600" /> backend/.env missing</span>
          )}
          {health?.venvPythonExists ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> .venv python ready</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><AlertTriangle className="h-3 w-3 text-amber-600" /> .venv python missing</span>
          )}
          {health?.logExists ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> cron log detected</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1"><Clock3 className="h-3 w-3 text-zinc-500" /> no cron log yet</span>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <Clock3 className="h-3.5 w-3.5" />
          Local status
        </div>
        <div className="grid gap-3">
          <div className="rounded-md bg-zinc-50 p-3">
            <div className="text-[11px] font-medium text-zinc-500">Saved signal runs</div>
            <div className="mt-1 text-lg font-semibold text-zinc-900">{signalRuns}</div>
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            <div className="text-[11px] font-medium text-zinc-500">Expected log file</div>
            <div className="mt-1 text-xs text-zinc-700">{health?.logPath || 'logs/digest_cron.log'}</div>
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            <div className="text-[11px] font-medium text-zinc-500">Last run</div>
            <div className="mt-1 text-xs text-zinc-700">
              {health?.lastRunAt
                ? new Date(health.lastRunAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : health?.lastRunStatus === 'failure'
                  ? 'Latest log indicates failure'
                  : 'No completed run detected'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <TerminalSquare className="h-3.5 w-3.5" />
          Recommended cron entry
        </div>
        <code className="block overflow-x-auto rounded-lg bg-zinc-950 p-3 text-[11px] leading-5 text-zinc-100">
          {recommendedCron}
        </code>
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <FileText className="h-3.5 w-3.5" />
          Runbook
        </div>
        <p className="text-xs leading-5 text-zinc-600">
          Setup and cron guidance live in <code className="rounded bg-zinc-100 px-1 py-0.5">SIGNAL_ENGINE_RUNBOOK.md</code> and <code className="rounded bg-zinc-100 px-1 py-0.5">backend/setup_cron.sh</code>.
        </p>
      </div>
    </div>
  );
}

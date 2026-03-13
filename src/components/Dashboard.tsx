"use client";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getHistory } from "@/lib/outputHistory";
import { getBookmarkedSignalItems, getSignalHistory } from "@/lib/signalHistory";
import SignalTopicView from "@/components/SignalTopicView";
import AutomationStatusPanel from "@/components/AutomationStatusPanel";
import type { OutputHistoryItem } from "@/lib/outputHistory";

type QuickActionConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  toolId: string;
};

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: "signal",
    label: "Refresh Signals",
    icon: Sparkles,
    description: "Review the latest monitored signals",
    toolId: "signal",
  },
  {
    id: "research",
    label: "Start Research",
    icon: Search,
    description: "Turn bookmarked signals into analysis",
    toolId: "research",
  },
  {
    id: "write",
    label: "Draft Artifact",
    icon: FileText,
    description: "Create a PRD, brief, or memo",
    toolId: "write",
  },
];

function QuickActionCard({ action }: { action: QuickActionConfig }) {
  const router = useRouter();
  const Icon = action.icon;

  return (
    <button
      onClick={() => router.push(action.toolId ? `/?tool=${action.toolId}` : "/")}
      className="group flex flex-col items-start gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-all hover:border-violet-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-zinc-900">{action.label}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">{action.description}</p>
      </div>
    </button>
  );
}

function RecentOutputCard({ output }: { output: OutputHistoryItem }) {
  return (
    <div className="group flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-zinc-300 hover:shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
        <p className="mt-0.5 text-xs text-zinc-500">
          {output.skillLabel} • {formatTimeAgo(output.timestamp)}
        </p>
        {output.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{output.excerpt}</p>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCurrentGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-zinc-500">{message}</p>
    </div>
  );
}

type DashboardSignal = {
  title: string;
  source?: string;
  body: string;
  key: string;
  id?: string;
  topics?: string[];
};

export default function Dashboard() {
  const router = useRouter();
  const [recentOutputs, setRecentOutputs] = useState<OutputHistoryItem[]>([]);
  const [signalRuns, setSignalRuns] = useState(0);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [latestSignals, setLatestSignals] = useState<DashboardSignal[]>([]);
  const [latestSignalUpdatedAt, setLatestSignalUpdatedAt] = useState<string | undefined>(undefined);
  const [latestSignalSourceLabel, setLatestSignalSourceLabel] = useState<string | undefined>(undefined);
  const [latestSignalFreshnessLabel, setLatestSignalFreshnessLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    setRecentOutputs(getHistory().slice(0, 5));
    setSignalRuns(getSignalHistory().length);
    setBookmarkedCount(getBookmarkedSignalItems().length);

    const loadLatestSignal = async () => {
      try {
        const res = await fetch("/api/signal", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data?.sections)) {
          setLatestSignals(data.sections.slice(0, 5));
          setLatestSignalUpdatedAt(data.updatedAt || undefined);
          setLatestSignalSourceLabel(data?.source === "filesystem" ? "Filesystem" : data?.source === "memory" ? "Latest in-memory run" : undefined);
          setLatestSignalFreshnessLabel(
            typeof data?.freshness?.ageMinutes === "number"
              ? `${data.freshness.ageMinutes} min old`
              : data?.freshness?.label || undefined,
          );
        }
      } catch {
        // Non-blocking on dashboard
      }
    };

    void loadLatestSignal();
  }, []);

  const nextAction = useMemo(() => {
    if (bookmarkedCount > 0) {
      return {
        title: `You have ${bookmarkedCount} bookmarked signal${bookmarkedCount === 1 ? "" : "s"} ready for analysis`,
        description: "Move high-signal items into a research workflow and synthesize product implications.",
        cta: "Open Research",
        toolId: "research",
      };
    }

    if (signalRuns > 0) {
      return {
        title: "Review the latest signal run and shortlist what matters",
        description: "Bookmark the most decision-relevant signals, then carry them into research or drafting.",
        cta: "Open Signals",
        toolId: "signal",
      };
    }

    return {
      title: "Start with today’s signal refresh",
      description: "Monitoring signals is the primary workflow. Refresh the feed, review what changed, and triage the strongest items.",
      cta: "Refresh Signals",
      toolId: "signal",
    };
  }, [bookmarkedCount, signalRuns]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {getCurrentGreeting()}, Joy
        </h1>
        <p className="text-sm text-zinc-500">{getCurrentDate()}</p>
        <p className="max-w-3xl text-sm text-zinc-600">
          Your PM Knowledge OS for monitoring signal shifts, turning them into research, and shipping decision-ready artifacts with clear automation status.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Today’s Signal Brief
          </h2>
          <span className="text-xs text-zinc-500">
            {latestSignalUpdatedAt
              ? `Updated ${new Date(latestSignalUpdatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
              : "Latest available snapshot"}
          </span>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          {latestSignals.length > 0 ? (
            <SignalTopicView
              signals={latestSignals}
              updatedAt={latestSignalUpdatedAt}
              sourceLabel={latestSignalSourceLabel}
              freshnessLabel={latestSignalFreshnessLabel}
            />
          ) : (
            <EmptyState icon={Sparkles} message="No signal brief available yet. Open Signals to generate the first run." />
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Recommended Next Step
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-sm font-semibold text-zinc-900">{nextAction.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{nextAction.description}</p>
            </div>
            <button
              onClick={() => router.push(`/?tool=${nextAction.toolId}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              {nextAction.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Automation Status
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-transparent">
          <AutomationStatusPanel compact />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Resume Work
        </h2>
        {recentOutputs.length > 0 ? (
          <div className="space-y-2">
            {recentOutputs.map((output) => (
              <RecentOutputCard key={output.id} output={output} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            message="No recent work yet. Start by reviewing signals, then move into research or drafting."
          />
        )}
      </section>
    </div>
  );
}

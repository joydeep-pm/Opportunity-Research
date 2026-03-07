"use client";

import { useRouter } from "next/navigation";
import {
  Sparkles,
  WandSparkles,
  Search,
  GitBranch,
  FileText,
  Brain,
  Target,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getHistory, getStats } from "@/lib/outputHistory";
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
    label: "Signal Engine",
    icon: Sparkles,
    description: "Refresh your knowledge feed",
    toolId: "signal",
  },
  {
    id: "linkedin",
    label: "LinkedIn Post",
    icon: WandSparkles,
    description: "Create viral content",
    toolId: "linkedin",
  },
  {
    id: "market",
    label: "Market Scan",
    icon: Search,
    description: "Research Play Store opportunity",
    toolId: "play-store",
  },
  {
    id: "workflow",
    label: "Agent Workflow",
    icon: GitBranch,
    description: "Design automation blueprint",
    toolId: "workflow",
  },
  {
    id: "prd",
    label: "PRD Generator",
    icon: FileText,
    description: "Create product spec",
    toolId: "prd",
  },
  {
    id: "validator",
    label: "Idea Validator",
    icon: Target,
    description: "Score product ideas",
    toolId: "validator",
  },
];

function QuickActionCard({ action }: { action: QuickActionConfig }) {
  const router = useRouter();
  const Icon = action.icon;

  return (
    <button
      onClick={() => router.push(`/?tool=${action.toolId}`)}
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

export default function Dashboard() {
  const [recentOutputs, setRecentOutputs] = useState<OutputHistoryItem[]>([]);
  const [stats, setStats] = useState({ totalOutputs: 0, savedOutputs: 0, pinnedOutputs: 0 });

  useEffect(() => {
    setRecentOutputs(getHistory().slice(0, 10));
    setStats(getStats());
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {getCurrentGreeting()}, Joy
        </h1>
        <p className="text-sm text-zinc-500">{getCurrentDate()}</p>
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Quick Launch
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Recent Activity
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
            message="No recent outputs yet. Run a skill to get started!"
          />
        )}
      </section>

      {/* Scheduled Jobs - Coming Soon */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Scheduled Automation
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Coming Soon
          </span>
        </div>
        <EmptyState
          icon={Brain}
          message="Automation and scheduling features are on the roadmap. You'll be able to schedule Signal refreshes, market scans, and more."
        />
      </section>

      {/* System Health - Future */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          System Status
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-2 w-2 items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <span className="text-sm font-medium text-zinc-700">All systems operational</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-zinc-500">Total Outputs</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900">{stats.totalOutputs}</div>
            </div>
            <div>
              <div className="text-zinc-500">Saved & Pinned</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900">
                {stats.savedOutputs} ({stats.pinnedOutputs} pinned)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

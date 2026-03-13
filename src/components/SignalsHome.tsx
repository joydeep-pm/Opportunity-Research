"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bookmark, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SignalTopicView from "@/components/SignalTopicView";
import SignalNewsletter from "@/components/SignalNewsletter";
import { getBookmarkedSignalItems } from "@/lib/signalHistory";

type DashboardSignal = {
  title: string;
  source?: string;
  body: string;
  key: string;
  id?: string;
  topics?: string[];
};

export default function SignalsHome() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"topic" | "brief">("topic");
  const [latestSignals, setLatestSignals] = useState<DashboardSignal[]>([]);
  const [latestSignalUpdatedAt, setLatestSignalUpdatedAt] = useState<string | undefined>(undefined);
  const [latestSignalSourceLabel, setLatestSignalSourceLabel] = useState<string | undefined>(undefined);
  const [latestSignalFreshnessLabel, setLatestSignalFreshnessLabel] = useState<string | undefined>(undefined);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);

  useEffect(() => {
    setBookmarkedCount(getBookmarkedSignalItems().length);

    const loadLatestSignal = async () => {
      try {
        const res = await fetch("/api/signal", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data?.sections)) {
          setLatestSignals(data.sections);
          setLatestSignalUpdatedAt(data.updatedAt || undefined);
          setLatestSignalSourceLabel(data?.source === "filesystem" ? "Filesystem" : data?.source === "memory" ? "Latest in-memory run" : undefined);
          setLatestSignalFreshnessLabel(
            typeof data?.freshness?.ageMinutes === "number"
              ? `${data.freshness.ageMinutes} min old`
              : data?.freshness?.label || undefined,
          );
        }
      } catch {
        // non-blocking
      }
    };

    void loadLatestSignal();
  }, []);

  const nextAction = useMemo(() => {
    if (bookmarkedCount > 0) {
      return {
        title: `${bookmarkedCount} bookmarked signal${bookmarkedCount === 1 ? " is" : "s are"} ready for research`,
        description: "Carry the strongest signals into a research workflow and synthesize product implications.",
        cta: "Open Research",
        toolId: "research",
      };
    }

    return {
      title: "Review signals and bookmark the strongest items",
      description: "Use Signals as your primary monitoring loop, then move the highest-value items into research or drafting.",
      cta: "Open Vault",
      toolId: "vault",
    };
  }, [bookmarkedCount]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Signals</h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Monitor what changed, bookmark what matters, and move the strongest signals into PM research and writing.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Latest Feed</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {latestSignalUpdatedAt
                ? `Updated ${new Date(latestSignalUpdatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                : "Latest available snapshot"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/?tool=signal")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh / Run Feed
            </button>
            <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
              <button
                onClick={() => setViewMode("topic")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${viewMode === "topic" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                Topics
              </button>
              <button
                onClick={() => setViewMode("brief")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${viewMode === "brief" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                Brief
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          {latestSignals.length > 0 ? (
            viewMode === "topic" ? (
              <SignalTopicView
                signals={latestSignals}
                updatedAt={latestSignalUpdatedAt}
                sourceLabel={latestSignalSourceLabel}
                freshnessLabel={latestSignalFreshnessLabel}
              />
            ) : (
              <SignalNewsletter
                signals={latestSignals}
                updatedAt={latestSignalUpdatedAt}
                sourceLabel={latestSignalSourceLabel}
                freshnessLabel={latestSignalFreshnessLabel}
              />
            )
          ) : (
            <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No signal feed available yet</p>
              <p className="mt-1 text-xs text-zinc-500">Run the feed to generate the first monitored signal set.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommended Next Step</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
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
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Signal Workflow</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">1. Monitor</div>
            <p className="mt-2 text-sm text-zinc-700">Review today’s feed and scan for product-relevant shifts.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">2. Bookmark</div>
            <p className="mt-2 text-sm text-zinc-700">Save the strongest items so they can inform research and writing.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">3. Analyze</div>
            <p className="mt-2 text-sm text-zinc-700">Carry key signals into Research or turn them into an artifact in Write.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 text-amber-900">
            <Bookmark className="h-4 w-4" />
            <span className="text-sm font-semibold">Bookmarked signals</span>
          </div>
          <p className="mt-1 text-sm text-amber-800">
            {bookmarkedCount > 0
              ? `${bookmarkedCount} bookmarked signal${bookmarkedCount === 1 ? " is" : "s are"} available to seed downstream workflows.`
              : "No bookmarked signals yet. Bookmark items directly from the feed to build your research queue."}
          </p>
        </div>
      </section>
    </div>
  );
}

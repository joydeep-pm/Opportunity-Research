"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bookmark, Search, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getBookmarkedSignalItems } from "@/lib/signalHistory";
import type { BookmarkedSignal } from "@/lib/signalHistory";

type ResearchAction = {
  id: string;
  title: string;
  description: string;
  toolId: string;
  icon: React.ComponentType<{ className?: string }>;
};

const RESEARCH_ACTIONS: ResearchAction[] = [
  {
    id: "market",
    title: "Opportunity Analysis",
    description: "Turn a signal into an India-first market opportunity snapshot.",
    toolId: "play-store",
    icon: Search,
  },
  {
    id: "competitor",
    title: "Competitor Read",
    description: "Compare emerging moves and implications for product strategy.",
    toolId: "competitor",
    icon: Users,
  },
  {
    id: "validator",
    title: "Idea Validation",
    description: "Test a product direction against problem quality and execution risk.",
    toolId: "validator",
    icon: Target,
  },
];

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Bookmark className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-zinc-600">No bookmarked signals yet</p>
      <p className="mt-1 text-xs text-zinc-500">
        Start in Signals, bookmark what matters, then return here to analyze it.
      </p>
    </div>
  );
}

export default function ResearchHome() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedSignal[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarkedSignalItems());
  }, []);

  const topBookmarks = useMemo(() => bookmarks.slice(0, 4), [bookmarks]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Research</h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Convert shortlisted signals into decision-ready PM analysis, opportunity framing, and competitive reads.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Queued Inputs</h2>
          <span className="text-xs text-zinc-500">{bookmarks.length} bookmarked signals</span>
        </div>
        {topBookmarks.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {topBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">{bookmark.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{bookmark.source || "Signal source"}</p>
                  </div>
                  <Bookmark className="h-4 w-4 shrink-0 text-amber-500" fill="currentColor" />
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-zinc-600">{bookmark.body}</p>
                {bookmark.topics && bookmark.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bookmark.topics.slice(0, 4).map((topic) => (
                      <span key={topic} className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Choose Analysis Mode</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {RESEARCH_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => router.push(`/?tool=${action.toolId}`)}
                className="group rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-violet-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900">{action.title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{action.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommended Flow</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Signals → Research → Write</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Bookmark the strongest signals, analyze them here, then move into Write to draft a PRD, brief, or memo.
              </p>
            </div>
            <button
              onClick={() => router.push("/?tool=write")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Continue to Write
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

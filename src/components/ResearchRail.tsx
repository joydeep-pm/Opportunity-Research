"use client";

import { Bookmark, Search, Target, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBookmarkedSignalItems, type BookmarkedSignal } from "@/lib/signalHistory";

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

export default function ResearchRail() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedSignal[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarkedSignalItems().slice(0, 8));
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Bookmark className="h-3.5 w-3.5 text-amber-500" />
            Bookmarked Signals
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{bookmarks.length}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">
            Signals saved from monitoring and ready to inform deeper analysis.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Research Modes</div>
          <div className="mt-3 space-y-2">
            <button onClick={() => router.push('/?tool=play-store')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <Search className="h-3.5 w-3.5 text-violet-600" /> Opportunity Analysis
            </button>
            <button onClick={() => router.push('/?tool=competitor')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <Users className="h-3.5 w-3.5 text-violet-600" /> Competitor Read
            </button>
            <button onClick={() => router.push('/?tool=validator')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <Target className="h-3.5 w-3.5 text-violet-600" /> Idea Validation
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Queue</h3>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-800">{bookmark.title}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {bookmark.source || 'Signal source'} • {formatTimeAgo(bookmark.bookmarkedAt)}
                  </p>
                </div>
                <Bookmark size={12} className="text-amber-500" fill="currentColor" />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
            <p className="text-xs font-medium text-zinc-500">No research queue yet</p>
            <p className="mt-1 text-[11px] text-zinc-400">Bookmark signals in the feed to build your queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { FileText, PenSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBookmarkedSignalItems, type BookmarkedSignal } from "@/lib/signalHistory";
import { getSavedOutputs, type SavedOutput } from "@/lib/outputHistory";

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

export default function WriteRail() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedSignal[]>([]);
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarkedSignalItems().slice(0, 5));
    setSavedOutputs(getSavedOutputs().slice(0, 5));
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <FileText className="h-3.5 w-3.5 text-violet-600" />
            Draft Sources
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-md bg-zinc-50 p-3">
              <div className="text-lg font-semibold text-zinc-900">{bookmarks.length}</div>
              <div className="mt-1 text-[11px] text-zinc-500">Bookmarks</div>
            </div>
            <div className="rounded-md bg-zinc-50 p-3">
              <div className="text-lg font-semibold text-zinc-900">{savedOutputs.length}</div>
              <div className="mt-1 text-[11px] text-zinc-500">Saved drafts</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Draft Types</div>
          <div className="mt-3 space-y-2">
            <button onClick={() => router.push('/?tool=prd')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <FileText className="h-3.5 w-3.5 text-violet-600" /> Draft PRD
            </button>
            <button onClick={() => router.push('/?tool=product')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <PenSquare className="h-3.5 w-3.5 text-violet-600" /> Product Brief
            </button>
            <button onClick={() => router.push('/?tool=linkedin')} className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" /> External Narrative
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Latest Inputs</h3>
      </div>
      <div className="space-y-3 px-3 pb-4">
        {bookmarks.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Bookmarked signals</div>
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                  <p className="truncate text-xs font-semibold text-zinc-800">{bookmark.title}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">{formatTimeAgo(bookmark.bookmarkedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {savedOutputs.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Saved drafts</div>
            <div className="space-y-2">
              {savedOutputs.map((output) => (
                <div key={output.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                  <p className="truncate text-xs font-semibold text-zinc-800">{output.title}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">{output.skillLabel} • {formatTimeAgo(output.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookmarks.length === 0 && savedOutputs.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
            <p className="text-xs font-medium text-zinc-500">No draft inputs yet</p>
            <p className="mt-1 text-[11px] text-zinc-400">Use Signals and Vault to collect source material.</p>
          </div>
        )}
      </div>
    </div>
  );
}

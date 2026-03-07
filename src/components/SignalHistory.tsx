"use client";

import { Clock, Bookmark, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSignalHistory, getBookmarkedSignals, clearHistory, type SavedSignal } from "@/lib/signalHistory";

export default function SignalHistory() {
  const [history, setHistory] = useState<SavedSignal[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SavedSignal | null>(null);

  useEffect(() => {
    loadHistory();

    // Listen for storage changes
    const handleStorage = () => loadHistory();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loadHistory = () => {
    setHistory(getSignalHistory());
    setBookmarkedIds(getBookmarkedSignals());
  };

  const handleClearHistory = () => {
    if (confirm("Clear all signal history? Bookmarks will be preserved.")) {
      clearHistory();
      loadHistory();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Unknown";
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-4 text-center">
        <Clock size={32} className="mx-auto mb-2 text-zinc-300" />
        <p className="text-xs text-zinc-500">No signal history yet</p>
        <p className="mt-1 text-[10px] text-zinc-400">Start tracking from the signal feed</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          History ({history.length})
        </h3>
        <button
          onClick={handleClearHistory}
          className="rounded p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
          title="Clear history"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {history.map((signal) => {
          const hasBookmarkedSignals = signal.sections?.some((s) => bookmarkedIds.includes(s.id || ""));

          return (
            <button
              key={signal.id}
              onClick={() => setSelectedSignal(signal)}
              className="group w-full rounded-lg border border-zinc-200 bg-white p-3 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-800">{signal.title}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {signal.sectionsCount} signal{signal.sectionsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-zinc-400">{formatTimestamp(signal.timestamp)}</span>
                  {hasBookmarkedSignals && (
                    <Bookmark size={12} className="text-amber-500" fill="currentColor" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview modal */}
      {selectedSignal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedSignal(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{selectedSignal.title}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(selectedSignal.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedSignal(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-zinc-700">{selectedSignal.markdown}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

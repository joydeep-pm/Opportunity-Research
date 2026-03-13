"use client";

import { useRouter } from "next/navigation";
import { Bookmark, Clock, Eye, Pin, Trash2, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getHistory,
  getSavedOutputs,
  togglePin,
  deleteSavedOutput,
  saveArbitraryOutput,
  type OutputHistoryItem,
  type SavedOutput,
} from "@/lib/outputHistory";
import { saveArtifactSeed } from "@/lib/artifactSeed";
import {
  getSignalHistory,
  getBookmarkedSignals,
  getBookmarkedSignalItems,
  clearHistory as clearSignalHistory,
  type SavedSignal,
  type BookmarkedSignal,
} from "@/lib/signalHistory";

type Tab = "signals" | "bookmarks" | "outputs" | "activity";

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

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Waves className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
    </div>
  );
}

function SignalsTab() {
  const [history, setHistory] = useState<SavedSignal[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SavedSignal | null>(null);

  const load = () => {
    setHistory(getSignalHistory());
    setBookmarkedIds(getBookmarkedSignals());
  };

  useEffect(() => {
    load();
    const handleStorage = () => load();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (history.length === 0) {
    return <EmptyState title="No saved signal runs" subtitle="Run Signals to build your signal archive." />;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Signal archive ({history.length})</h3>
        <button
          onClick={() => {
            if (confirm("Clear all saved signal runs? Bookmarks will be preserved.")) {
              clearSignalHistory();
              load();
            }
          }}
          className="rounded p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
          title="Clear signal archive"
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
                  <p className="mt-1 text-[10px] text-zinc-500">{signal.sectionsCount} signal{signal.sectionsCount !== 1 ? "s" : ""}</p>
                  {(signal.sourceLabel || signal.freshnessLabel) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {signal.sourceLabel && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">{signal.sourceLabel}</span>}
                      {signal.freshnessLabel && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">{signal.freshnessLabel}</span>}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-zinc-400">{formatTimeAgo(signal.timestamp)}</span>
                  {hasBookmarkedSignals && <Bookmark size={12} className="text-amber-500" fill="currentColor" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedSignal(null)}>
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
                {(selectedSignal.sourceLabel || selectedSignal.freshnessLabel) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSignal.sourceLabel && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">Source: {selectedSignal.sourceLabel}</span>}
                    {selectedSignal.freshnessLabel && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">{selectedSignal.freshnessLabel}</span>}
                  </div>
                )}
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
    </>
  );
}

function BookmarksTab() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedSignal[]>([]);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkedSignal | null>(null);

  const load = () => {
    setBookmarks(getBookmarkedSignalItems());
  };

  useEffect(() => {
    load();
    const handleStorage = () => load();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (bookmarks.length === 0) {
    return <EmptyState title="No bookmarked signals" subtitle="Bookmark individual feed items to keep a decision-ready shortlist here." />;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bookmarked signals ({bookmarks.length})</h3>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {bookmarks.map((bookmark) => (
          <button
            key={bookmark.id}
            onClick={() => setSelectedBookmark(bookmark)}
            className="group w-full rounded-lg border border-zinc-200 bg-white p-3 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-800">{bookmark.title}</p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  {bookmark.source || "Signal source"} • {formatTimeAgo(bookmark.bookmarkedAt)}
                </p>
              </div>
              <Bookmark size={12} className="text-amber-500" fill="currentColor" />
            </div>
          </button>
        ))}
      </div>

      {selectedBookmark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedBookmark(null)}>
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{selectedBookmark.title}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedBookmark.source || "Signal source"} • {new Date(selectedBookmark.bookmarkedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveArtifactSeed({
                      title: selectedBookmark.title,
                      body: selectedBookmark.body,
                      sourceLabel: selectedBookmark.source || "Bookmarked Signal",
                    });
                    setSelectedBookmark(null);
                    router.push('/?tool=product');
                  }}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Use as Seed
                </button>
                <button
                  onClick={() => {
                    saveArbitraryOutput({
                      id: `bookmark-artifact-${selectedBookmark.id}`,
                      title: `Signal Artifact: ${selectedBookmark.title}`,
                      skillLabel: "Bookmarked Signal",
                      timestamp: new Date().toISOString(),
                      isPinned: true,
                      fullOutput: [
                        `# ${selectedBookmark.title}`,
                        `Source: ${selectedBookmark.source || "Signal source"}`,
                        selectedBookmark.topics?.length ? `Topics: ${selectedBookmark.topics.map((topic) => `#${topic}`).join(" ")}` : "",
                        "",
                        selectedBookmark.body,
                      ].filter(Boolean).join("\n"),
                    });
                  }}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Save as Artifact
                </button>
                <button
                  onClick={() => setSelectedBookmark(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedBookmark.topics && selectedBookmark.topics.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedBookmark.topics.map((topic) => (
                  <span key={topic} className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
                    #{topic}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-zinc-700">{selectedBookmark.body}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SavedOutputsTab() {
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<SavedOutput | null>(null);

  useEffect(() => {
    setSavedOutputs(getSavedOutputs());
  }, []);

  const refresh = () => setSavedOutputs(getSavedOutputs());

  if (savedOutputs.length === 0) {
    return <EmptyState title="No saved outputs" subtitle="Pin outputs from any workflow to keep them in your vault." />;
  }

  const pinned = savedOutputs.filter((o) => o.isPinned);
  const unpinned = savedOutputs.filter((o) => !o.isPinned);

  return (
    <>
    <div className="divide-y divide-zinc-100">
      {pinned.length > 0 && (
        <div className="p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Pin className="h-3 w-3 text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pinned</span>
          </div>
          <div className="space-y-1">
            {pinned.map((output) => (
              <div key={output.id} className="group flex items-start gap-2 rounded-md p-2 hover:bg-zinc-50">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
                  <p className="text-xs text-zinc-500">{output.skillLabel} • {formatTimeAgo(output.timestamp)}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setSelectedOutput(output)} className="rounded p-1 hover:bg-zinc-200" aria-label={`Preview ${output.title}`}>
                    <Eye className="h-3 w-3 text-zinc-600" />
                  </button>
                  <button onClick={() => { togglePin(output.id); refresh(); }} className="rounded p-1 hover:bg-zinc-200">
                    <Pin className="h-3 w-3 fill-current text-zinc-600" />
                  </button>
                  <button onClick={() => { deleteSavedOutput(output.id); refresh(); }} className="rounded p-1 hover:bg-red-100">
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unpinned.length > 0 && (
        <div className="p-3">
          {pinned.length > 0 && <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Saved</div>}
          <div className="space-y-1">
            {unpinned.map((output) => (
              <div key={output.id} className="group flex items-start gap-2 rounded-md p-2 hover:bg-zinc-50">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
                  <p className="text-xs text-zinc-500">{output.skillLabel} • {formatTimeAgo(output.timestamp)}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setSelectedOutput(output)} className="rounded p-1 hover:bg-zinc-200" aria-label={`Preview ${output.title}`}>
                    <Eye className="h-3 w-3 text-zinc-600" />
                  </button>
                  <button onClick={() => { togglePin(output.id); refresh(); }} className="rounded p-1 hover:bg-zinc-200">
                    <Pin className="h-3 w-3 text-zinc-600" />
                  </button>
                  <button onClick={() => { deleteSavedOutput(output.id); refresh(); }} className="rounded p-1 hover:bg-red-100">
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {selectedOutput && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOutput(null)}>
        <div
          className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">{selectedOutput.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {selectedOutput.skillLabel} • {new Date(selectedOutput.timestamp).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedOutput(null)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>

          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-zinc-700">{selectedOutput.fullOutput}</pre>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function ActivityTab() {
  const [recentOutputs, setRecentOutputs] = useState<OutputHistoryItem[]>([]);

  useEffect(() => {
    setRecentOutputs(getHistory().slice(0, 12));
  }, []);

  if (recentOutputs.length === 0) {
    return <EmptyState title="No recent activity" subtitle="Run a workflow to create output and activity history." />;
  }

  return (
    <div className="divide-y divide-zinc-100">
      {recentOutputs.map((output) => (
        <button key={output.id} className="w-full p-3 text-left transition-colors hover:bg-zinc-50">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
              <p className="mt-0.5 text-xs text-zinc-500">{output.skillLabel} • {formatTimeAgo(output.timestamp)}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function VaultPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("signals");

  const tabs = [
    { id: "signals" as Tab, label: "Signals", icon: Bookmark },
    { id: "bookmarks" as Tab, label: "Bookmarks", icon: Eye },
    { id: "outputs" as Tab, label: "Saved", icon: Pin },
    { id: "activity" as Tab, label: "Activity", icon: Clock },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-zinc-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "border-b-2 border-violet-600 text-violet-600" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "signals" && <SignalsTab />}
        {activeTab === "bookmarks" && <BookmarksTab />}
        {activeTab === "outputs" && <SavedOutputsTab />}
        {activeTab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
}

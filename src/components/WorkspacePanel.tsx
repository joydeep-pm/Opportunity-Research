"use client";

import { useState, useEffect } from "react";
import { Activity, Bookmark, Clock, CheckCircle2, Pin, Trash2 } from "lucide-react";
import { getHistory, getSavedOutputs, togglePin, deleteSavedOutput } from "@/lib/outputHistory";
import AutomationStatusPanel from "@/components/AutomationStatusPanel";
import type { OutputHistoryItem, SavedOutput } from "@/lib/outputHistory";

type Tab = "activity" | "saved" | "queue";

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

function ActivityTab() {
  const [recentOutputs, setRecentOutputs] = useState<OutputHistoryItem[]>([]);

  useEffect(() => {
    const history = getHistory();
    setRecentOutputs(history.slice(0, 10));
  }, []);

  if (recentOutputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <Activity className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-zinc-500">No recent activity</p>
        <p className="mt-1 text-xs text-zinc-400">Run a workflow to see outputs here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-100">
      {recentOutputs.map((output) => (
        <button
          key={output.id}
          className="w-full p-3 text-left transition-colors hover:bg-zinc-50"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
              <p className="mt-0.5 text-xs text-zinc-500">
                {output.skillLabel} • {formatTimeAgo(output.timestamp)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SavedTab() {
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);

  useEffect(() => {
    setSavedOutputs(getSavedOutputs());
  }, []);

  const handleTogglePin = (id: string) => {
    togglePin(id);
    setSavedOutputs(getSavedOutputs());
  };

  const handleDelete = (id: string) => {
    deleteSavedOutput(id);
    setSavedOutputs(getSavedOutputs());
  };

  if (savedOutputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <Bookmark className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-zinc-500">No saved outputs</p>
        <p className="mt-1 text-xs text-zinc-400">Pin outputs to save them here</p>
      </div>
    );
  }

  const pinned = savedOutputs.filter((o) => o.isPinned);
  const unpinned = savedOutputs.filter((o) => !o.isPinned);

  return (
    <div className="divide-y divide-zinc-100">
      {pinned.length > 0 && (
        <div className="p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Pin className="h-3 w-3 text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pinned
            </span>
          </div>
          <div className="space-y-1">
            {pinned.map((output) => (
              <div
                key={output.id}
                className="group flex items-start gap-2 rounded-md p-2 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
                  <p className="text-xs text-zinc-500">{output.skillLabel}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleTogglePin(output.id)}
                    className="rounded p-1 hover:bg-zinc-200"
                  >
                    <Pin className="h-3 w-3 fill-current text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(output.id)}
                    className="rounded p-1 hover:bg-red-100"
                  >
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
          {pinned.length > 0 && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Saved
            </div>
          )}
          <div className="space-y-1">
            {unpinned.map((output) => (
              <div
                key={output.id}
                className="group flex items-start gap-2 rounded-md p-2 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-medium text-zinc-900">{output.title}</h4>
                  <p className="text-xs text-zinc-500">{output.skillLabel}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleTogglePin(output.id)}
                    className="rounded p-1 hover:bg-zinc-200"
                  >
                    <Pin className="h-3 w-3 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(output.id)}
                    className="rounded p-1 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueueTab() {
  return <AutomationStatusPanel />;
}

export default function WorkspacePanel() {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  const tabs = [
    { id: "activity" as Tab, label: "Activity", icon: Activity },
    { id: "saved" as Tab, label: "Saved", icon: Bookmark },
    { id: "queue" as Tab, label: "Automation", icon: Clock },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-zinc-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "saved" && <SavedTab />}
        {activeTab === "queue" && <QueueTab />}
      </div>
    </div>
  );
}

"use client";

import { Bookmark, FileText, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { getBookmarkedSignalItems, getSignalHistory } from "@/lib/signalHistory";
import { getSavedOutputs } from "@/lib/outputHistory";

export default function VaultRail() {
  const [signalRuns, setSignalRuns] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);
  const [savedOutputs, setSavedOutputs] = useState(0);

  useEffect(() => {
    setSignalRuns(getSignalHistory().length);
    setBookmarks(getBookmarkedSignalItems().length);
    setSavedOutputs(getSavedOutputs().length);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vault Summary</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <Waves className="h-4 w-4 text-blue-600" />
                <span>Signal runs</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">{signalRuns}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <span>Bookmarks</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">{bookmarks}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <FileText className="h-4 w-4 text-violet-600" />
                <span>Saved outputs</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">{savedOutputs}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">How to use Vault</div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
            <li>• Review saved signals and bookmarks in the center pane.</li>
            <li>• Keep durable knowledge here instead of spreading it across multiple views.</li>
            <li>• Move promising items into Research or Write when you are ready to act.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

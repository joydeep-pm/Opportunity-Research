"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bookmark, Clock, FileText, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { getBookmarkedSignalItems, getSignalHistory } from "@/lib/signalHistory";
import { getSavedOutputs } from "@/lib/outputHistory";
import VaultPanel from "@/components/VaultPanel";

export default function VaultHome() {
  const router = useRouter();
  const [signalRuns, setSignalRuns] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);
  const [savedOutputs, setSavedOutputs] = useState(0);

  useEffect(() => {
    setSignalRuns(getSignalHistory().length);
    setBookmarks(getBookmarkedSignalItems().length);
    setSavedOutputs(getSavedOutputs().length);
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Vault</h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Your durable store of saved signals, bookmarks, outputs, and reusable PM knowledge.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Vault Overview</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-zinc-700">
              <Waves className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Signal runs</span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{signalRuns}</p>
            <p className="mt-1 text-xs text-zinc-500">Saved snapshots of your monitored feed.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-zinc-700">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">Bookmarks</span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{bookmarks}</p>
            <p className="mt-1 text-xs text-zinc-500">Signals shortlisted for analysis or drafting.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-zinc-700">
              <FileText className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold">Saved outputs</span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{savedOutputs}</p>
            <p className="mt-1 text-xs text-zinc-500">Drafts and artifacts pinned for reuse.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Saved Knowledge</h2>
        <div className="rounded-xl border border-zinc-200 bg-white">
          <VaultPanel />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recommended Next Step</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Turn stored knowledge into action</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Review saved items here, then move into Research to synthesize or Write to produce a PM artifact.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/?tool=research")}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Open Research
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/?tool=write")}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Open Write
                <Clock className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

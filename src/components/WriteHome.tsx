"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileText, PenSquare, Sparkles, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { getBookmarkedSignalItems } from "@/lib/signalHistory";
import { getSavedOutputs } from "@/lib/outputHistory";

type WriteAction = {
  id: string;
  title: string;
  description: string;
  toolId: string;
  icon: React.ComponentType<{ className?: string }>;
};

const WRITE_ACTIONS: WriteAction[] = [
  {
    id: "prd",
    title: "Draft PRD",
    description: "Turn product insight into a structured PM specification.",
    toolId: "prd",
    icon: FileText,
  },
  {
    id: "product",
    title: "Product Brief",
    description: "Create a high-level strategy brief from your latest research.",
    toolId: "product",
    icon: PenSquare,
  },
  {
    id: "linkedin",
    title: "External Narrative",
    description: "Convert what you learned into a post or thought piece.",
    toolId: "linkedin",
    icon: Sparkles,
  },
];

export default function WriteHome() {
  const router = useRouter();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setBookmarkCount(getBookmarkedSignalItems().length);
    setSavedCount(getSavedOutputs().length);
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Write</h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Turn monitored signals and research into PM artifacts you can share, review, and reuse.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Available Inputs</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-zinc-700">
              <Bookmark className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">Bookmarked signals</span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{bookmarkCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Signals saved from monitoring that can seed a brief or PRD.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-zinc-700">
              <FileText className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold">Saved outputs</span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{savedCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Existing drafts and saved artifacts available in the vault.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Choose Artifact</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {WRITE_ACTIONS.map((action) => {
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
              <h3 className="text-sm font-semibold text-zinc-900">Write from evidence, not from scratch</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Use bookmarked signals and research outputs as inputs, then save the best artifacts to Vault for reuse.
              </p>
            </div>
            <button
              onClick={() => router.push("/?tool=vault")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Open Vault
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

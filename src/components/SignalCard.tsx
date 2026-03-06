import React from "react";
import { Pin, Share, Play } from "lucide-react";

export interface SignalCardProps {
  id: string;
  author: {
    name: string;
    avatarInitials: string;
  };
  domain: string;
  timestamp: string;
  title: string;
  content: React.ReactNode;
  isPinned?: boolean;
  onShare?: (id: string) => void;
  onRunWorkflow?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export function SignalCard({
  id,
  author,
  domain,
  timestamp,
  title,
  content,
  isPinned = false,
  onShare,
  onRunWorkflow,
  onTogglePin,
}: SignalCardProps) {
  const getDomainColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "ai":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "fintech":
      case "rbi":
        return "bg-green-50 text-green-700 border-green-200";
      case "growth":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <article className="mb-6 flex w-full flex-col rounded border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <header className="flex items-center justify-between border-b border-zinc-100 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full border border-zinc-200 bg-zinc-100 text-center text-xs font-semibold leading-8 text-zinc-600">
            {author.avatarInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold leading-none text-zinc-900">{author.name}</span>
            <span className="mt-1 text-[11px] font-medium text-zinc-400">{timestamp}</span>
          </div>
        </div>
        <div className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${getDomainColor(domain)}`}>
          {domain}
        </div>
      </header>

      <div className="px-5 py-5">
        <h2 className="mb-2.5 text-lg font-bold leading-snug tracking-tight text-zinc-900">{title}</h2>
        <div className="text-[14px] font-medium leading-relaxed text-zinc-700">{content}</div>
      </div>

      <footer className="flex items-center justify-end gap-1.5 border-t border-zinc-100 bg-zinc-50/50 px-5 py-2.5">
        <button
          type="button"
          onClick={() => onShare?.(id)}
          className="group flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label={`Share ${title}`}
        >
          <Share className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-600" />
          Share
        </button>
        <button
          type="button"
          onClick={() => onRunWorkflow?.(id)}
          className="group flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label={`Run workflow for ${title}`}
        >
          <Play className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-600" />
          Run Workflow
        </button>
        <div className="mx-2 h-3.5 w-[1px] bg-zinc-200" />
        <button
          type="button"
          onClick={() => onTogglePin?.(id)}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
            isPinned
              ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              : "border border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
          aria-label={`${isPinned ? "Unpin" : "Pin"} ${title}`}
        >
          <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-blue-700" : "text-zinc-400"}`} />
          {isPinned ? "Pinned" : "Pin"}
        </button>
      </footer>
    </article>
  );
}

"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  body: string;
  key: string;
};

type SignalNewsletterProps = {
  signals: SignalItem[];
  updatedAt?: string;
};

function useBookmarks() {
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kwc-bookmarked-signals");
      if (saved) {
        setBookmarked(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  }, []);

  const toggleBookmark = (signalId: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) {
        next.delete(signalId);
      } else {
        next.add(signalId);
      }
      try {
        localStorage.setItem("kwc-bookmarked-signals", JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error("Failed to save bookmark:", error);
      }
      return next;
    });
  };

  return { bookmarked, toggleBookmark };
}

function NarrativeText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <p key={`${index}-${block.slice(0, 18)}`} className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-700">
          {block}
        </p>
      ))}
    </div>
  );
}

export default function SignalNewsletter({ signals, updatedAt }: SignalNewsletterProps) {
  const { bookmarked, toggleBookmark } = useBookmarks();

  if (!signals || signals.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="text-sm text-zinc-600">No signals available. Run Signal Engine to generate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updatedAt && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2">
          <span className="text-xs font-medium text-blue-900">
            Last Updated: {new Date(updatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {signals.map((signal, index) => {
          const signalId = signal.id || `${signal.title}-${index}`;
          const isBookmarked = bookmarked.has(signalId);

          return (
            <article
              key={signalId}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Bookmark button */}
              <button
                onClick={() => toggleBookmark(signalId)}
                className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-zinc-100"
                title={isBookmarked ? "Remove bookmark" : "Bookmark this signal"}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={18} className="text-amber-600" />
                ) : (
                  <Bookmark size={18} className="text-zinc-400 group-hover:text-zinc-600" />
                )}
              </button>

              {/* Source badge */}
              {signal.source && (
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    {signal.source}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="mb-4 pr-8 text-lg font-bold leading-tight text-zinc-900">
                {signal.title.replace(/^##\s*/, "").replace(/🎯\s*/, "")}
              </h3>

              {/* Body (2 paragraphs) */}
              <div className="prose prose-sm max-w-none">
                <NarrativeText text={signal.body} />
              </div>

              {/* Visual indicator for bookmarked items */}
              {isBookmarked && (
                <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
              )}
            </article>
          );
        })}
      </div>

      {/* Bookmarks count */}
      {bookmarked.size > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2 text-center">
          <span className="text-xs font-medium text-amber-900">
            {bookmarked.size} signal{bookmarked.size !== 1 ? "s" : ""} bookmarked
          </span>
        </div>
      )}
    </div>
  );
}

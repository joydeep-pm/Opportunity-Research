"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { getAuthorInfo } from "@/lib/authorAvatars";
import { Bookmark, BookmarkCheck, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  topics?: string[];
  body: string;
  key: string;
};

type ProductLeaderDigestProps = {
  signals: SignalItem[];
  updatedAt?: string;
};

// Product management thought leaders
const PRODUCT_LEADERS = [
  "lenny rachitsky",
  "john cutler",
  "elena verna",
  "shreyas",
  "shreyas doshi",
  "aakash gupta",
];

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

export default function ProductLeaderDigest({ signals, updatedAt }: ProductLeaderDigestProps) {
  const { bookmarked, toggleBookmark } = useBookmarks();

  // Filter signals from product leaders
  const productSignals = signals.filter((signal) => {
    if (!signal.source) return false;
    const authorName = signal.source.split("|")[0].trim().toLowerCase();
    return PRODUCT_LEADERS.includes(authorName);
  });

  // Group by author
  const signalsByAuthor: Record<string, SignalItem[]> = {};
  productSignals.forEach((signal) => {
    const authorName = signal.source!.split("|")[0].trim();
    if (!signalsByAuthor[authorName]) {
      signalsByAuthor[authorName] = [];
    }
    signalsByAuthor[authorName].push(signal);
  });

  const authors = Object.keys(signalsByAuthor).sort();

  if (productSignals.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="text-sm text-zinc-600">
          No product leader insights available. Run Signal Engine to generate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updatedAt && (
        <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-purple-700" />
            <span className="text-xs font-medium text-purple-900">
              Product Leader Insights · {productSignals.length} signals from {authors.length} leaders
            </span>
          </div>
          <span className="text-xs text-purple-700">
            {new Date(updatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}

      <div className="space-y-5">
        {authors.map((authorName) => {
          const authorSignals = signalsByAuthor[authorName];
          const firstSignal = authorSignals[0];
          const author = getAuthorInfo(firstSignal.source);

          return (
            <div key={authorName} className="rounded-xl border border-zinc-200 bg-white p-4">
              {/* Author header */}
              <div className="mb-4 flex items-center gap-3 border-b border-zinc-100 pb-3">
                <AuthorAvatar source={firstSignal.source} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{author.name}</h3>
                  <p className="text-xs text-zinc-500">{author.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    {authorSignals.length} {authorSignals.length === 1 ? "signal" : "signals"}
                  </span>
                </div>
              </div>

              {/* Signals from this author */}
              <div className="space-y-3">
                {authorSignals.map((signal, index) => {
                  const signalId = signal.id || `${signal.title}-${index}`;
                  const isBookmarked = bookmarked.has(signalId);

                  return (
                    <article
                      key={signalId}
                      className="group relative rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"
                    >
                      {/* Bookmark button */}
                      <button
                        onClick={() => toggleBookmark(signalId)}
                        className="absolute right-2 top-2 rounded-lg p-1.5 transition-colors hover:bg-white"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark this signal"}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck size={14} className="text-amber-600" />
                        ) : (
                          <Bookmark size={14} className="text-zinc-400 group-hover:text-zinc-600" />
                        )}
                      </button>

                      {/* Title */}
                      <h4 className="mb-2 pr-6 text-sm font-bold leading-snug text-zinc-900">
                        {signal.title.replace(/^##\s*/, "").replace(/🎯\s*/, "")}
                      </h4>

                      {/* Topics */}
                      {signal.topics && signal.topics.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {signal.topics.map((topic) => (
                            <span
                              key={topic}
                              className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Body */}
                      <div className="prose prose-sm max-w-none text-[14px]">
                        <NarrativeText text={signal.body} />
                      </div>

                      {/* Bookmark indicator */}
                      {isBookmarked && (
                        <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-amber-500" />
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
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

"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { AlertTriangle, Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  topics?: string[];
  body: string;
  key: string;
};

type RBIPulseProps = {
  signals: SignalItem[];
  updatedAt?: string;
};

// RBI and regulatory related topics
const REGULATORY_TOPICS = ["RBI", "Compliance", "Regulatory", "NBFC", "NPCI"];

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

export default function RBIPulse({ signals, updatedAt }: RBIPulseProps) {
  const { bookmarked, toggleBookmark } = useBookmarks();

  // Filter signals related to RBI/regulatory
  const regulatorySignals = signals.filter((signal) => {
    // Check if any regulatory topic is present
    const hasRegulatoryTopic = signal.topics?.some((topic) => REGULATORY_TOPICS.includes(topic));

    // Check if source is RBI
    const isRBISource = signal.source?.toLowerCase().includes("rbi");

    // Check if title or body mentions regulatory keywords
    const text = `${signal.title} ${signal.body}`.toLowerCase();
    const hasRegulatoryContent =
      text.includes("rbi") ||
      text.includes("regulatory") ||
      text.includes("compliance") ||
      text.includes("nbfc") ||
      text.includes("reserve bank");

    return hasRegulatoryTopic || isRBISource || hasRegulatoryContent;
  });

  if (regulatorySignals.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="text-sm text-zinc-600">
          No regulatory signals available. Run Signal Engine to generate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updatedAt && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-700" />
            <span className="text-xs font-medium text-red-900">
              RBI & Regulatory Pulse · {regulatorySignals.length} regulatory signals
            </span>
          </div>
          <span className="text-xs text-red-700">
            {new Date(updatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}

      {/* Regulatory signals */}
      <div className="space-y-3">
        {regulatorySignals.map((signal, index) => {
          const signalId = signal.id || `${signal.title}-${index}`;
          const isBookmarked = bookmarked.has(signalId);

          // Determine signal priority (high if from RBI directly)
          const isHighPriority = signal.source?.toLowerCase().includes("rbi");

          return (
            <article
              key={signalId}
              className={`group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
                isHighPriority
                  ? "border-red-300 bg-red-50/50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {/* Priority indicator */}
              {isHighPriority && (
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-red-700">
                    High Priority · Official RBI
                  </span>
                </div>
              )}

              {/* Bookmark button */}
              <button
                onClick={() => toggleBookmark(signalId)}
                className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-white"
                title={isBookmarked ? "Remove bookmark" : "Bookmark this signal"}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={18} className="text-amber-600" />
                ) : (
                  <Bookmark size={18} className="text-zinc-400 group-hover:text-zinc-600" />
                )}
              </button>

              {/* Author avatar and source */}
              {signal.source && (
                <div className="mb-3 flex items-center gap-2">
                  <AuthorAvatar source={signal.source} size="md" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-900">
                      {signal.source.split("|")[0].trim()}
                    </span>
                    {signal.source.includes("|") && (
                      <span className="text-[11px] text-zinc-500">
                        {signal.source.split("|")[1].trim()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <h3 className="mb-3 pr-8 text-lg font-bold leading-tight text-zinc-900">
                {signal.title.replace(/^##\s*/, "").replace(/🎯\s*/, "")}
              </h3>

              {/* Topic badges */}
              {signal.topics && signal.topics.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {signal.topics.map((topic) => {
                    const isRegulatoryTopic = REGULATORY_TOPICS.includes(topic);
                    return (
                      <span
                        key={topic}
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          isRegulatoryTopic
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        #{topic}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Body */}
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

"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import SignalSearch, { filterSignalsByQuery } from "@/components/SignalSearch";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { removeBookmarkedSignalItem, saveBookmarkedSignalItem } from "@/lib/signalHistory";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  topics?: string[];
  body: string;
  key: string;
};

type SignalNewsletterProps = {
  signals: SignalItem[];
  updatedAt?: string;
  sourceLabel?: string;
  freshnessLabel?: string;
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

  const toggleBookmark = (signal: SignalItem, signalId: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(signalId)) {
        next.delete(signalId);
        removeBookmarkedSignalItem(signalId);
      } else {
        next.add(signalId);
        saveBookmarkedSignalItem({
          id: signalId,
          title: signal.title,
          source: signal.source,
          body: signal.body,
          key: signal.key,
          topics: signal.topics,
        });
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

export default function SignalNewsletter({ signals, updatedAt, sourceLabel, freshnessLabel }: SignalNewsletterProps) {
  const { bookmarked, toggleBookmark } = useBookmarks();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Extract all unique topics from signals
  const allTopics = Array.from(
    new Set(signals.flatMap((s) => s.topics || []))
  ).sort();

  // Filter signals by selected topics first
  let filteredSignals = selectedTopics.size === 0
    ? signals
    : signals.filter((signal) =>
        signal.topics?.some((topic) => selectedTopics.has(topic))
      );

  // Then filter by search query
  filteredSignals = filterSignalsByQuery(filteredSignals, searchQuery);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  if (!signals || signals.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="text-sm text-zinc-600">No signals available. Run Signal Engine to generate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(updatedAt || sourceLabel || freshnessLabel) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2">
          <span className="text-xs font-medium text-blue-900">
            {updatedAt
              ? `Last Updated: ${new Date(updatedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              : "Latest knowledge feed snapshot"}
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {sourceLabel && <span className="rounded-full bg-white px-2 py-1 font-medium text-blue-800">Source: {sourceLabel}</span>}
            {freshnessLabel && <span className="rounded-full bg-white px-2 py-1 font-medium text-blue-800">{freshnessLabel}</span>}
          </div>
        </div>
      )}

      {/* Search */}
      <SignalSearch onSearch={setSearchQuery} placeholder="Search signals by title, content, topic, or author..." />

      {/* Topic Filters */}
      {allTopics.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Filter by Topic
            </span>
            {selectedTopics.size > 0 && (
              <button
                onClick={() => setSelectedTopics(new Set())}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTopics.map((topic) => {
              const isSelected = selectedTopics.has(topic);
              const count = signals.filter((s) => s.topics?.includes(topic)).length;
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {topic} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Signal count */}
      <div className="text-xs text-zinc-500">
        Showing {filteredSignals.length} of {signals.length} signals
        {searchQuery && ` · Search: "${searchQuery}"`}
        {selectedTopics.size > 0 && ` · Filtered by ${selectedTopics.size} topic${selectedTopics.size !== 1 ? 's' : ''}`}
      </div>

      <div className="space-y-4">
        {filteredSignals.map((signal, index) => {
          const signalId = signal.id || `${signal.title}-${index}`;
          const isBookmarked = bookmarked.has(signalId);

          return (
            <article
              key={signalId}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Bookmark button */}
              <button
                onClick={() => toggleBookmark(signal, signalId)}
                className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-zinc-100"
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
                  {signal.topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}

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

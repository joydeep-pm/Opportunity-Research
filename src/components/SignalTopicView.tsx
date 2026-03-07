"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import SignalSearch, { filterSignalsByQuery } from "@/components/SignalSearch";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  topics?: string[];
  body: string;
  key: string;
};

type SignalTopicViewProps = {
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

// Topic configuration with colors and priorities
const TOPIC_CONFIG: Record<string, { label: string; color: string; priority: number }> = {
  RBI: { label: "RBI & Regulatory", color: "red", priority: 1 },
  Compliance: { label: "Compliance", color: "red", priority: 2 },
  Regulatory: { label: "Regulatory", color: "red", priority: 3 },
  Fintech: { label: "Fintech & Lending", color: "green", priority: 4 },
  Lending: { label: "Lending", color: "green", priority: 5 },
  Payments: { label: "Payments & UPI", color: "green", priority: 6 },
  NBFC: { label: "NBFC", color: "green", priority: 7 },
  UPI: { label: "UPI", color: "green", priority: 8 },
  ProductManagement: { label: "Product Management", color: "blue", priority: 9 },
  Strategy: { label: "Strategy", color: "blue", priority: 10 },
  Execution: { label: "Execution", color: "blue", priority: 11 },
  Teams: { label: "Teams", color: "blue", priority: 12 },
  Growth: { label: "Growth & GTM", color: "purple", priority: 13 },
  GTM: { label: "Go-to-Market", color: "purple", priority: 14 },
  AI: { label: "AI & Machine Learning", color: "orange", priority: 15 },
  MachineLearning: { label: "Machine Learning", color: "orange", priority: 16 },
  LLM: { label: "LLM", color: "orange", priority: 17 },
  Automation: { label: "Automation", color: "orange", priority: 18 },
  Enterprise: { label: "Enterprise", color: "orange", priority: 19 },
  Engineering: { label: "Engineering & Tech", color: "gray", priority: 20 },
  Architecture: { label: "Architecture", color: "gray", priority: 21 },
  DevOps: { label: "DevOps", color: "gray", priority: 22 },
  Technology: { label: "Technology", color: "gray", priority: 23 },
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    badge: "bg-red-100 text-red-700",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    badge: "bg-blue-100 text-blue-700",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
    badge: "bg-purple-100 text-purple-700",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    badge: "bg-orange-100 text-orange-700",
  },
  gray: {
    bg: "bg-zinc-50",
    border: "border-zinc-200",
    text: "text-zinc-900",
    badge: "bg-zinc-100 text-zinc-700",
  },
};

export default function SignalTopicView({ signals, updatedAt }: SignalTopicViewProps) {
  const { bookmarked, toggleBookmark } = useBookmarks();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Filter signals by search query first
  const filteredSignals = filterSignalsByQuery(signals, searchQuery);

  // Group filtered signals by primary topic (first topic in array)
  const signalsByTopic: Record<string, SignalItem[]> = {};

  filteredSignals.forEach((signal) => {
    const primaryTopic = signal.topics?.[0] || "Other";
    if (!signalsByTopic[primaryTopic]) {
      signalsByTopic[primaryTopic] = [];
    }
    signalsByTopic[primaryTopic].push(signal);
  });

  // Sort topics by priority
  const sortedTopics = Object.keys(signalsByTopic).sort((a, b) => {
    const aPriority = TOPIC_CONFIG[a]?.priority || 999;
    const bPriority = TOPIC_CONFIG[b]?.priority || 999;
    return aPriority - bPriority;
  });

  // Expand first 3 topics by default
  useEffect(() => {
    setExpandedTopics(new Set(sortedTopics.slice(0, 3)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTopics(new Set(sortedTopics));
  };

  const collapseAll = () => {
    setExpandedTopics(new Set());
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

      {/* Search */}
      <SignalSearch onSearch={setSearchQuery} placeholder="Search signals..." />

      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          Showing {filteredSignals.length} of {signals.length} signals grouped by {sortedTopics.length} topics
          {searchQuery && ` · Search: "${searchQuery}"`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Maximize2 size={12} />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Minimize2 size={12} />
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTopics.map((topic) => {
          const topicSignals = signalsByTopic[topic];
          const config = TOPIC_CONFIG[topic] || { label: topic, color: "gray", priority: 999 };
          const colors = COLOR_CLASSES[config.color];
          const isExpanded = expandedTopics.has(topic);

          return (
            <div key={topic} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(topic)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors hover:opacity-80`}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={18} className={colors.text} />
                  ) : (
                    <ChevronRight size={18} className={colors.text} />
                  )}
                  <h2 className={`text-base font-bold ${colors.text}`}>
                    {config.label}
                  </h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.badge}`}>
                    {topicSignals.length}
                  </span>
                </div>
              </button>

              {/* Topic Signals */}
              {isExpanded && (
                <div className="space-y-3 px-4 pb-4">
                  {topicSignals.map((signal, index) => {
                    const signalId = signal.id || `${signal.title}-${index}`;
                    const isBookmarked = bookmarked.has(signalId);

                    return (
                      <article
                        key={signalId}
                        className="group relative overflow-hidden rounded-lg border border-white bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        {/* Bookmark button */}
                        <button
                          onClick={() => toggleBookmark(signalId)}
                          className="absolute right-3 top-3 rounded-lg p-1.5 transition-colors hover:bg-zinc-100"
                          title={isBookmarked ? "Remove bookmark" : "Bookmark this signal"}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck size={16} className="text-amber-600" />
                          ) : (
                            <Bookmark size={16} className="text-zinc-400 group-hover:text-zinc-600" />
                          )}
                        </button>

                        {/* Author avatar and source */}
                        {signal.source && (
                          <div className="mb-3 flex items-center gap-2">
                            <AuthorAvatar source={signal.source} size="sm" />
                            <span className="text-[11px] font-medium text-zinc-600">
                              {signal.source}
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h3 className="mb-2 pr-6 text-[15px] font-bold leading-snug text-zinc-900">
                          {signal.title.replace(/^##\s*/, "").replace(/🎯\s*/, "")}
                        </h3>

                        {/* All topic badges */}
                        {signal.topics && signal.topics.length > 1 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {signal.topics.slice(1).map((t) => (
                              <span
                                key={t}
                                className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Body */}
                        <div className="prose prose-sm max-w-none text-[14px]">
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
              )}
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

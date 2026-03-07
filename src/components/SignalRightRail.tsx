"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { BarChart3, Star, User } from "lucide-react";
import { useEffect, useState } from "react";

type SignalItem = {
  id?: string;
  title: string;
  source?: string;
  topics?: string[];
  body: string;
  key: string;
};

type SignalRightRailProps = {
  signals: SignalItem[];
  selectedTopics?: Set<string>;
  onTopicClick?: (topic: string) => void;
  bookmarkedCount?: number;
};

type TopicStat = {
  topic: string;
  count: number;
  selected: boolean;
};

type AuthorStat = {
  source: string;
  name: string;
  count: number;
};

export default function SignalRightRail({
  signals,
  selectedTopics = new Set(),
  onTopicClick,
  bookmarkedCount = 0,
}: SignalRightRailProps) {
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [authorStats, setAuthorStats] = useState<AuthorStat[]>([]);

  useEffect(() => {
    // Calculate topic statistics
    const topicCounts = new Map<string, number>();
    signals.forEach((signal) => {
      signal.topics?.forEach((topic) => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    const stats = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({
        topic,
        count,
        selected: selectedTopics.has(topic),
      }))
      .sort((a, b) => b.count - a.count);

    setTopicStats(stats);

    // Calculate author statistics
    const authorCounts = new Map<string, number>();
    signals.forEach((signal) => {
      if (signal.source) {
        authorCounts.set(signal.source, (authorCounts.get(signal.source) || 0) + 1);
      }
    });

    const authors = Array.from(authorCounts.entries())
      .map(([source, count]) => {
        const name = source.split("|")[0].trim();
        return {
          source,
          name,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 authors

    setAuthorStats(authors);
  }, [signals, selectedTopics]);

  return (
    <div className="space-y-4">
      {/* Bookmarks summary */}
      {bookmarkedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Star size={14} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-900">Bookmarks</span>
          </div>
          <p className="text-[11px] text-amber-700">{bookmarkedCount} signals saved</p>
        </div>
      )}

      {/* Topic breakdown */}
      {topicStats.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 size={14} className="text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900">Topics This Week</span>
          </div>
          <div className="space-y-1.5">
            {topicStats.map(({ topic, count, selected }) => (
              <button
                key={topic}
                onClick={() => onTopicClick?.(topic)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                  selected
                    ? "bg-blue-100 text-blue-900"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className="truncate text-[11px] font-medium">#{topic}</span>
                <span className={`text-[11px] font-semibold ${
                  selected ? "text-blue-700" : "text-zinc-500"
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top authors */}
      {authorStats.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <User size={14} className="text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900">Top Contributors</span>
          </div>
          <div className="space-y-2">
            {authorStats.map(({ source, name, count }) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AuthorAvatar source={source} size="sm" />
                  <span className="truncate text-[11px] font-medium text-zinc-700">{name}</span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="space-y-1.5 text-[11px] text-zinc-600">
          <div className="flex justify-between">
            <span>Total Signals:</span>
            <span className="font-semibold text-zinc-900">{signals.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Topics:</span>
            <span className="font-semibold text-zinc-900">{topicStats.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Contributors:</span>
            <span className="font-semibold text-zinc-900">{authorStats.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

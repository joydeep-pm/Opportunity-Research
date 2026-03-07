"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

type SignalSearchProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SignalSearch({ onSearch, placeholder = "Search signals..." }: SignalSearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search size={14} className="text-zinc-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Filter signals by search query
 */
export function filterSignalsByQuery<T extends { title: string; body: string; source?: string; topics?: string[] }>(
  signals: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return signals;
  }

  const lowerQuery = query.toLowerCase();

  return signals.filter((signal) => {
    // Search in title
    if (signal.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in body
    if (signal.body.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in source
    if (signal.source?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in topics
    if (signal.topics?.some((topic) => topic.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    return false;
  });
}

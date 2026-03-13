export type SavedSignal = {
  id: string;
  timestamp: string;
  title: string;
  sectionsCount: number;
  markdown: string;
  sourceLabel?: string;
  freshnessLabel?: string;
  sections?: Array<{
    id?: string;
    title: string;
    source?: string;
    body: string;
    key: string;
    topics?: string[];
  }>;
};

const HISTORY_KEY = "kwc-signal-history";
const MAX_HISTORY = 20;

export function saveSignalToHistory(signal: {
  title: string;
  markdown: string;
  sections?: Array<{
    id?: string;
    title: string;
    source?: string;
    body: string;
    key: string;
    topics?: string[];
  }>;
  updatedAt?: string;
  sourceLabel?: string;
  freshnessLabel?: string;
}) {
  try {
    const history = getSignalHistory();

    const newSignal: SavedSignal = {
      id: `signal-${Date.now()}`,
      timestamp: signal.updatedAt || new Date().toISOString(),
      title: signal.title,
      sectionsCount: signal.sections?.length || 0,
      markdown: signal.markdown,
      sourceLabel: signal.sourceLabel,
      freshnessLabel: signal.freshnessLabel,
      sections: signal.sections,
    };

    // Add to beginning and limit to MAX_HISTORY
    const updated = [newSignal, ...history].slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    return newSignal;
  } catch (error) {
    console.error("Failed to save signal to history:", error);
    return null;
  }
}

export function getSignalHistory(): SavedSignal[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return [];

    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load signal history:", error);
    return [];
  }
}

export type BookmarkedSignal = {
  id: string;
  title: string;
  source?: string;
  body: string;
  key: string;
  topics?: string[];
  bookmarkedAt: string;
};

const BOOKMARK_IDS_KEY = "kwc-bookmarked-signals";
const BOOKMARK_ITEMS_KEY = "kwc-bookmarked-signal-items";

export function getBookmarkedSignals(): string[] {
  try {
    const saved = localStorage.getItem(BOOKMARK_IDS_KEY);
    if (!saved) return [];

    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load bookmarked signals:", error);
    return [];
  }
}

export function getBookmarkedSignalItems(): BookmarkedSignal[] {
  try {
    const saved = localStorage.getItem(BOOKMARK_ITEMS_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load bookmarked signal items:", error);
    return [];
  }
}

export function saveBookmarkedSignalItem(signal: {
  id: string;
  title: string;
  source?: string;
  body: string;
  key: string;
  topics?: string[];
}) {
  try {
    const existing = getBookmarkedSignalItems();
    const filtered = existing.filter((item) => item.id !== signal.id);
    const next: BookmarkedSignal[] = [
      {
        ...signal,
        bookmarkedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, 50);
    localStorage.setItem(BOOKMARK_ITEMS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Failed to save bookmarked signal item:", error);
  }
}

export function removeBookmarkedSignalItem(signalId: string) {
  try {
    const existing = getBookmarkedSignalItems();
    const next = existing.filter((item) => item.id !== signalId);
    localStorage.setItem(BOOKMARK_ITEMS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Failed to remove bookmarked signal item:", error);
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

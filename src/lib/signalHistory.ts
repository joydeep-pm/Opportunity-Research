export type SavedSignal = {
  id: string;
  timestamp: string;
  title: string;
  sectionsCount: number;
  markdown: string;
  sections?: Array<{
    id?: string;
    title: string;
    source?: string;
    body: string;
    key: string;
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
  }>;
  updatedAt?: string;
}) {
  try {
    const history = getSignalHistory();

    const newSignal: SavedSignal = {
      id: `signal-${Date.now()}`,
      timestamp: signal.updatedAt || new Date().toISOString(),
      title: signal.title,
      sectionsCount: signal.sections?.length || 0,
      markdown: signal.markdown,
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

export function getBookmarkedSignals(): string[] {
  try {
    const saved = localStorage.getItem("kwc-bookmarked-signals");
    if (!saved) return [];

    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load bookmarked signals:", error);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

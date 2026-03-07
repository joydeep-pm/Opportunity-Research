/**
 * Output History Management
 * Handles persistence and retrieval of skill outputs
 */

export type OutputHistoryItem = {
  id: string;
  title: string;
  skillId: string;
  skillLabel: string;
  timestamp: string;
  excerpt: string;
  fullOutput: string;
};

export type SavedOutput = {
  id: string;
  title: string;
  skillLabel: string;
  timestamp: string;
  isPinned: boolean;
  fullOutput: string;
};

const HISTORY_KEY = "kwc-output-history";
const SAVED_KEY = "kwc-saved-outputs";
const MAX_HISTORY = 20;

/**
 * Save output to history
 */
export function saveToHistory(output: {
  title: string;
  skillId: string;
  skillLabel: string;
  body: string;
}): string {
  const history = getHistory();

  // Create excerpt (first 150 chars)
  const excerpt = output.body
    .replace(/[#*_\-\[\]]/g, "") // Remove markdown
    .trim()
    .slice(0, 150);

  const newItem: OutputHistoryItem = {
    id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: output.title,
    skillId: output.skillId,
    skillLabel: output.skillLabel,
    timestamp: new Date().toISOString(),
    excerpt,
    fullOutput: output.body,
  };

  // Add to front, limit to MAX_HISTORY
  const updated = [newItem, ...history].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save to history:", e);
  }

  return newItem.id;
}

/**
 * Get all history items
 */
export function getHistory(): OutputHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
}

/**
 * Get single output by ID
 */
export function getOutputById(id: string): OutputHistoryItem | SavedOutput | null {
  // Check history first
  const history = getHistory();
  const historyItem = history.find((item) => item.id === id);
  if (historyItem) return historyItem;

  // Check saved
  const saved = getSavedOutputs();
  const savedItem = saved.find((item) => item.id === id);
  if (savedItem) return savedItem;

  return null;
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Save output to saved/pinned collection
 */
export function saveOutput(outputId: string, isPinned = false): void {
  const output = getOutputById(outputId);
  if (!output) return;

  const saved = getSavedOutputs();

  // Check if already saved
  const existingIndex = saved.findIndex((item) => item.id === outputId);
  if (existingIndex >= 0) {
    // Update pin status
    saved[existingIndex].isPinned = isPinned;
  } else {
    // Add new
    const newSaved: SavedOutput = {
      id: output.id,
      title: output.title,
      skillLabel: output.skillLabel,
      timestamp: output.timestamp,
      isPinned,
      fullOutput: output.fullOutput,
    };
    saved.unshift(newSaved);
  }

  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  } catch (e) {
    console.error("Failed to save output:", e);
  }
}

/**
 * Get all saved outputs
 */
export function getSavedOutputs(): SavedOutput[] {
  try {
    const stored = localStorage.getItem(SAVED_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load saved outputs:", e);
    return [];
  }
}

/**
 * Toggle pin status
 */
export function togglePin(outputId: string): void {
  const saved = getSavedOutputs();
  const item = saved.find((s) => s.id === outputId);
  if (item) {
    item.isPinned = !item.isPinned;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch (e) {
      console.error("Failed to toggle pin:", e);
    }
  }
}

/**
 * Delete saved output
 */
export function deleteSavedOutput(outputId: string): void {
  const saved = getSavedOutputs();
  const updated = saved.filter((item) => item.id !== outputId);
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete output:", e);
  }
}

/**
 * Get output statistics
 */
export function getStats(): {
  totalOutputs: number;
  savedOutputs: number;
  pinnedOutputs: number;
} {
  const history = getHistory();
  const saved = getSavedOutputs();
  const pinned = saved.filter((s) => s.isPinned);

  return {
    totalOutputs: history.length,
    savedOutputs: saved.length,
    pinnedOutputs: pinned.length,
  };
}

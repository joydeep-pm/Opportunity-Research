"use client";

import { X } from "lucide-react";

type Shortcut = {
  key: string;
  description: string;
  category: string;
};

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: "⌘K", description: "Open command palette", category: "Navigation" },
  { key: "⌘H", description: "Go to Dashboard", category: "Navigation" },
  { key: "⌘1", description: "Go to Daily Signal", category: "Navigation" },
  { key: "⌘2", description: "Go to Saved Vault", category: "Navigation" },
  { key: "⌘3", description: "Go to Play Store Research", category: "Navigation" },
  { key: "⌘4", description: "Go to Competitor Tracking", category: "Navigation" },
  { key: "⌘5", description: "Go to Idea Validator", category: "Navigation" },
  { key: "⌘6", description: "Go to LinkedIn Writer", category: "Navigation" },
  { key: "⌘7", description: "Go to Prompt Engineering", category: "Navigation" },
  { key: "⌘8", description: "Go to Product Intelligence", category: "Navigation" },
  { key: "⌘9", description: "Go to PRD Generator", category: "Navigation" },

  // Actions
  { key: "Escape", description: "Close modals and dialogs", category: "Actions" },
  { key: "?", description: "Show this help dialog", category: "Actions" },
];

type KeyboardShortcutsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  if (!open) return null;

  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Keyboard Shortcuts</h2>
            <p className="mt-1 text-sm text-zinc-500">Quick reference for all shortcuts</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto p-6">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter((s) => s.category === category).map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-700">{shortcut.description}</span>
                    <kbd className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
          <p className="text-xs text-zinc-500">
            Press <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs">?</kbd> anytime to view this help
          </p>
        </div>
      </div>
    </>
  );
}

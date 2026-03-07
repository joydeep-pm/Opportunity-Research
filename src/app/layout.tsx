"use client";

import localFont from "next/font/local";
import "./globals.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SignalHistory from "@/components/SignalHistory";
import WorkspacePanel from "@/components/WorkspacePanel";
import Tooltip from "@/components/Tooltip";
import CommandPalette from "@/components/CommandPalette";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import WelcomeTour from "@/components/WelcomeTour";
import { Search as SearchIcon, SearchX } from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const NAV_GROUPS = [
  {
    title: "",
    items: [
      { id: "", label: "Dashboard", icon: "🏠" },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { id: "signal", label: "Daily Signal", icon: "⏰", meta: "AI" },
      { id: "vault", label: "Saved Vault", icon: "💾" },
    ],
  },
  {
    title: "Market",
    items: [
      { id: "play-store", label: "Play Store Research", icon: "🤖", meta: "AI" },
      { id: "competitor", label: "Competitor Tracking", icon: "🤖", meta: "AI" },
      { id: "validator", label: "Idea Validator", icon: "⚡", meta: "AI" },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "linkedin", label: "LinkedIn Writer", icon: "🤖", meta: "AI" },
      { id: "prompt", label: "Prompt Engineering", icon: "⚡", meta: "AI" },
    ],
  },
  {
    title: "Management",
    items: [
      { id: "product", label: "Product Intelligence", icon: "🤖", meta: "AI" },
      { id: "prd", label: "PRD Generator", icon: "🤖", meta: "AI" },
      { id: "idp", label: "1:1 IDP Builder", icon: "🤖", meta: "AI" },
      { id: "workflow", label: "Agent Workflow", icon: "⚡", meta: "AI" },
      { id: "pulse", label: "Pulse Timesheets", icon: "📊" },
    ],
  },
];

function getTooltipContent(itemId: string): string {
  const tooltips: Record<string, string> = {
    "": "Overview of all activity",
    "signal": "AI-powered • Runs daily • ~90s",
    "vault": "Storage • Saved signals",
    "play-store": "AI-powered • ~30-60s • India market",
    "competitor": "AI-powered • ~30-60s • Competitive analysis",
    "validator": "AI-powered • Fast <5s • Score ideas",
    "linkedin": "AI-powered • Fast <5s • Viral posts",
    "prompt": "AI-powered • Fast <5s • Optimize prompts",
    "product": "AI-powered • ~10-15s • Product strategy",
    "prd": "AI-powered • ~10-15s • PRD specs",
    "idp": "AI-powered • ~10s • Leadership plans",
    "workflow": "AI-powered • ~10s • Agent blueprints",
    "pulse": "Manual entry • Timesheets",
  };
  return tooltips[itemId] || "Run this skill";
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentTool = searchParams.get("tool") || "signal";
  const isReadingExperience = currentTool === "signal" || currentTool === "vault";
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandValue, setCommandValue] = useState("");
  const router = useRouter();

  const commandTargets = [
    { id: "", label: "dashboard", queryHints: ["dashboard", "home"] },
    { id: "signal", label: "signal", queryHints: ["signal", "daily signal"] },
    { id: "vault", label: "vault", queryHints: ["vault"] },
    { id: "play-store", label: "play store", queryHints: ["play", "play store", "play-store", "market"] },
    { id: "competitor", label: "competitor", queryHints: ["competitor", "tracking"] },
    { id: "validator", label: "validator", queryHints: ["validator", "idea validator"] },
    { id: "linkedin", label: "linkedin", queryHints: ["linkedin", "content", "post"] },
    { id: "prompt", label: "prompt", queryHints: ["prompt", "prompt engineering"] },
    { id: "product", label: "product", queryHints: ["product", "prd writer", "product intelligence"] },
    { id: "prd", label: "prd", queryHints: ["prd", "prd generator"] },
    { id: "idp", label: "idp", queryHints: ["idp", "1:1", "leadership"] },
    { id: "workflow", label: "workflow", queryHints: ["workflow", "agent workflow"] },
    { id: "pulse", label: "pulse", queryHints: ["pulse", "timesheet"] },
  ] as const;

  const resolveCommandTarget = (raw: string): string | null => {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) return null;

    const exactIdMatch = commandTargets.find((target) => target.id === normalized);
    if (exactIdMatch) return exactIdMatch.id;

    const exactLabelMatch = commandTargets.find((target) =>
      target.queryHints.some((hint) => hint.toLowerCase() === normalized),
    );
    if (exactLabelMatch) return exactLabelMatch.id;

    const startsWithMatch = commandTargets.find((target) =>
      target.queryHints.some((hint) => normalized.startsWith(hint.toLowerCase())),
    );
    if (startsWithMatch) return startsWithMatch.id;

    return null;
  };

  const executeCommand = (event?: React.FormEvent) => {
    event?.preventDefault();
    const target = resolveCommandTarget(commandValue);
    if (!target) {
      setCommandPaletteOpen(true);
      return;
    }
    router.push(target ? `/?tool=${target}` : "/");
    setCommandValue("");
    setCommandPaletteOpen(false);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape: Close modals
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setShortcutsOpen(false);
        return;
      }

      // Cmd+K: Open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Don't handle other shortcuts if typing in input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // ?: Show keyboard shortcuts help
      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Cmd+H: Dashboard
      if ((event.metaKey || event.ctrlKey) && event.key === "h") {
        event.preventDefault();
        window.location.href = "/";
        return;
      }

      // Cmd+1-9: Navigate to skills
      if ((event.metaKey || event.ctrlKey) && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const skillMap: Record<string, string> = {
          "1": "signal",
          "2": "vault",
          "3": "play-store",
          "4": "competitor",
          "5": "validator",
          "6": "linkedin",
          "7": "prompt",
          "8": "product",
          "9": "prd",
        };
        const skillId = skillMap[event.key];
        if (skillId) {
          window.location.href = `/?tool=${skillId}`;
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full">
      <aside className="z-20 flex w-[240px] shrink-0 flex-col items-stretch border-r border-zinc-200 bg-white shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4">
          <span className="text-sm font-bold tracking-tight text-zinc-900">KWC OS</span>
        </div>
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title || "home"} className="flex flex-col gap-1">
              {group.title && (
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = currentTool === item.id;
                return (
                  <Link
                    key={item.id || "dashboard"}
                    href={item.id ? `/?tool=${item.id}` : "/"}
                    className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "border-zinc-200/50 bg-zinc-100 text-zinc-900 shadow-sm"
                        : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {item.icon && (
                      <Tooltip content={getTooltipContent(item.id)}>
                        <span className="text-base leading-none">{item.icon}</span>
                      </Tooltip>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.meta && (
                      <span className="text-[10px] text-zinc-400">{item.meta}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="relative z-0 flex min-w-0 flex-1 flex-col bg-zinc-50">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white/95 px-6 shadow-sm backdrop-blur">
          <form
            onSubmit={executeCommand}
            className="relative mr-3 flex flex-1 items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:bg-white"
          >
            <SearchIcon size={14} className="shrink-0 text-zinc-400" />
            <input
              aria-label="Command search"
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
              onFocus={() => setCommandPaletteOpen(true)}
              onBlur={() => setCommandPaletteOpen(false)}
              placeholder="Type a module (e.g., signal, play-store, linkedin)"
              className="w-full bg-transparent text-[13px] font-medium text-zinc-700 outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              onMouseDown={(event) => event.preventDefault()}
              className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
              name="Go"
              aria-label="Go"
            >
              Go
            </button>
            <button
              type="button"
              aria-label="Clear command input"
              onClick={() => setCommandValue("")}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <SearchX size={13} />
            </button>
          </form>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex max-w-xl flex-1 items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:bg-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-zinc-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="w-full text-left text-[13px] font-medium text-zinc-400">
              Open launcher...
            </span>
            <kbd className="ml-auto rounded border border-zinc-300 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-500">
              ⌘K
            </kbd>
          </button>
        </header>

        <div className="relative w-full flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
        </div>
      </main>

      <aside className="z-20 flex w-[280px] shrink-0 flex-col border-l border-zinc-200 bg-white shadow-[-1px_0_2px_rgba(0,0,0,0.02)]">
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900">
            {isReadingExperience ? "Signal History" : "Workspace"}
          </h2>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {isReadingExperience ? <SignalHistory /> : <WorkspacePanel />}
        </div>
      </aside>

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Welcome Tour */}
      <WelcomeTour />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-200 selection:text-zinc-900`}
      >
        <Suspense
          fallback={<div className="flex h-screen w-screen items-center justify-center bg-zinc-50 text-zinc-500">Loading KWC...</div>}
        >
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

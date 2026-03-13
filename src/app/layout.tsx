"use client";

import localFont from "next/font/local";
import "./globals.css";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SignalHistory from "@/components/SignalHistory";
import WorkspacePanel from "@/components/WorkspacePanel";
import VaultRail from "@/components/VaultRail";
import ResearchRail from "@/components/ResearchRail";
import WriteRail from "@/components/WriteRail";
import Tooltip from "@/components/Tooltip";
import CommandPalette from "@/components/CommandPalette";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import WelcomeTour from "@/components/WelcomeTour";
import { Search as SearchIcon } from "lucide-react";

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

const PRIMARY_NAV = [
  { id: "", label: "Home", icon: "🏠" },
  { id: "signal", label: "Signals", icon: "📡" },
  { id: "research", label: "Research", icon: "🔎" },
  { id: "write", label: "Write", icon: "✍️" },
  { id: "vault", label: "Vault", icon: "🗂️" },
] as const;

function getTooltipContent(itemId: string): string {
  const tooltips: Record<string, string> = {
    "": "Today’s brief, priorities, and resume points",
    signal: "Monitor daily signals and triage what matters",
    research: "Turn signals into product insight and analysis",
    write: "Draft PRDs, briefs, and product artifacts",
    vault: "Review saved signals, bookmarks, and outputs",
  };
  return tooltips[itemId] || "Open section";
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const currentTool = searchParams.get("tool") || "";
  const isSignalExperience = currentTool === "signal";
  const isVaultExperience = currentTool === "vault";
  const isResearchExperience = currentTool === "research";
  const isWriteExperience = currentTool === "write";
  const isPrimarySurface = ["", "signal", "research", "write", "vault"].includes(currentTool);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setShortcutsOpen(false);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "h") {
        event.preventDefault();
        window.location.href = "/";
        return;
      }

      if ((event.metaKey || event.ctrlKey) && /^[1-5]$/.test(event.key)) {
        event.preventDefault();
        const sectionMap: Record<string, string> = {
          "1": "signal",
          "2": "research",
          "3": "write",
          "4": "vault",
          "5": "",
        };
        const sectionId = sectionMap[event.key];
        window.location.href = sectionId ? `/?tool=${sectionId}` : "/";
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full">
      <aside className="z-20 flex w-[240px] shrink-0 flex-col items-stretch border-r border-zinc-200 bg-white shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4">
          <span className="text-sm font-bold tracking-tight text-zinc-900">Opportunity Research</span>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
          {PRIMARY_NAV.map((item) => {
            const isActive = currentTool === item.id || (!currentTool && item.id === "");
            return (
              <Link
                key={item.id || "home"}
                href={item.id ? `/?tool=${item.id}` : "/"}
                className={`flex items-center gap-2 rounded border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "border-zinc-200/50 bg-zinc-100 text-zinc-900 shadow-sm"
                    : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Tooltip content={getTooltipContent(item.id)}>
                  <span className="text-base leading-none">{item.icon}</span>
                </Tooltip>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="relative z-0 flex min-w-0 flex-1 flex-col bg-zinc-50">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white/95 px-6 shadow-sm backdrop-blur">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:bg-white"
          >
            <SearchIcon size={14} className="shrink-0 text-zinc-400" />
            <span className="w-full text-left text-[13px] font-medium text-zinc-400">
              Search signals, research, drafts, or saved work
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
            {isSignalExperience
              ? "Signal History"
              : isVaultExperience
                ? "Vault"
                : isResearchExperience
                  ? "Research Queue"
                  : isWriteExperience
                    ? "Draft Inputs"
                    : isPrimarySurface
                      ? "Recent Work"
                      : "Recent Work"}
          </h2>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {isSignalExperience ? (
            <SignalHistory />
          ) : isVaultExperience ? (
            <VaultRail />
          ) : isResearchExperience ? (
            <ResearchRail />
          ) : isWriteExperience ? (
            <WriteRail />
          ) : (
            <WorkspacePanel />
          )}
        </div>
      </aside>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
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
          fallback={<div className="flex h-screen w-screen items-center justify-center bg-zinc-50 text-zinc-500">Loading Opportunity Research...</div>}
        >
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

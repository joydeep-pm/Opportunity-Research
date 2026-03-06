"use client";

import localFont from "next/font/local";
import "./globals.css";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
    title: "Knowledge",
    items: [
      { id: "signal", label: "Daily Signal" },
      { id: "vault", label: "Saved Vault" },
    ],
  },
  {
    title: "Market",
    items: [
      { id: "play-store", label: "Play Store Research" },
      { id: "competitor", label: "Competitor Tracking" },
      { id: "validator", label: "Idea Validator" },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "linkedin", label: "LinkedIn Writer" },
      { id: "prompt", label: "Prompt Engineering" },
    ],
  },
  {
    title: "Management",
    items: [
      { id: "product", label: "Product Intelligence" },
      { id: "prd", label: "PRD Generator" },
      { id: "idp", label: "1:1 IDP Builder" },
      { id: "workflow", label: "Agent Workflow" },
      { id: "pulse", label: "Pulse Timesheets" },
    ],
  },
];

const TOOL_LABELS: Record<string, string> = NAV_GROUPS.flatMap((group) => group.items).reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  {} as Record<string, string>,
);

function resolveToolIntent(query: string, fallback: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return fallback;

  if (q.includes("signal") || q.includes("daily") || q.includes("feed")) return "signal";
  if (q.includes("vault") || q.includes("saved")) return "vault";
  if (q.includes("play") || q.includes("market")) return "play-store";
  if (q.includes("competitor") || q.includes("track")) return "competitor";
  if (q.includes("validator") || q.includes("idea")) return "validator";
  if (q.includes("linkedin") || q.includes("post") || q.includes("content")) return "linkedin";
  if (q.includes("prompt")) return "prompt";
  if (q.includes("prd")) return "prd";
  if (q.includes("idp") || q.includes("1:1")) return "idp";
  if (q.includes("workflow") || q.includes("agent")) return "workflow";
  if (q.includes("pulse") || q.includes("timesheet")) return "pulse";
  if (q.includes("product")) return "product";

  return fallback;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTool = searchParams.get("tool") || "signal";
  const isReadingExperience = currentTool === "signal" || currentTool === "vault";
  const [commandQuery, setCommandQuery] = useState("");

  const commandHint = useMemo(() => {
    if (!commandQuery.trim()) return "Type and press Enter";
    return `Open: ${TOOL_LABELS[resolveToolIntent(commandQuery, currentTool)] || "Current Tool"}`;
  }, [commandQuery, currentTool]);

  const runCommand = (event: FormEvent) => {
    event.preventDefault();
    const nextTool = resolveToolIntent(commandQuery, currentTool);
    router.push(`/?tool=${nextTool}`);
    setCommandQuery("");
  };

  return (
    <div className="flex h-full w-full">
      <aside className="z-20 flex w-[240px] shrink-0 flex-col items-stretch border-r border-zinc-200 bg-white shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4">
          <span className="text-sm font-bold tracking-tight text-zinc-900">KWC OS</span>
        </div>
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{group.title}</div>
              {group.items.map((item) => {
                const isActive = currentTool === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`/?tool=${item.id}`}
                    className={`rounded border px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "border-zinc-200/50 bg-zinc-100 text-zinc-900 shadow-sm"
                        : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {item.label}
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
            onSubmit={runCommand}
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
            <input
              value={commandQuery}
              onChange={(event) => setCommandQuery(event.target.value)}
              className="w-full bg-transparent text-[13px] font-medium text-zinc-700 outline-none placeholder:text-zinc-400"
              placeholder="Search signals or execute command (Cmd + K)"
              aria-label="Command search"
            />
            <button
              type="submit"
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100"
            >
              Go
            </button>
          </form>
          <div className="ml-3 text-[11px] font-medium text-zinc-500">{commandHint}</div>
        </header>

        <div className="relative w-full flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
        </div>
      </main>

      {isReadingExperience ? (
        <aside className="z-20 flex w-[280px] shrink-0 flex-col border-l border-zinc-200 bg-white shadow-[-1px_0_2px_rgba(0,0,0,0.02)]">
          <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 px-4">
            <h2 className="text-sm font-bold tracking-tight text-zinc-900">The Vault</h2>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-zinc-50/50 p-4">
            <div className="cursor-pointer overflow-hidden rounded border border-zinc-200 border-l-[3px] border-l-blue-500 bg-white shadow-sm transition-shadow hover:shadow">
              <div className="p-3">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">AI</div>
                <h3 className="break-words text-xs font-semibold leading-snug text-zinc-800">
                  New Transformer Architecture for Edge Devices
                </h3>
              </div>
            </div>
            <div className="cursor-pointer overflow-hidden rounded border border-zinc-200 border-l-[3px] border-l-green-500 bg-white shadow-sm transition-shadow hover:shadow">
              <div className="p-3">
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Fintech</div>
                <h3 className="break-words text-xs font-semibold leading-snug text-zinc-800">
                  RBI Guidelines on Digital Lending App Audits
                </h3>
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <aside className="z-20 flex w-[280px] shrink-0 flex-col items-center justify-center border-l border-zinc-200 bg-zinc-50 p-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-400"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-bold text-zinc-800">Contextual Tools</h3>
          <p className="text-xs font-medium text-zinc-500">Filters and metadata for &quot;{currentTool}&quot; will appear here.</p>
        </aside>
      )}
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

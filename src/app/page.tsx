"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  BarChart3,
  BrainCircuit,
  Command,
  FileText,
  Layers,
  Loader2,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SkillId = "market" | "content" | "product" | "settings";

const sidebarItems = [
  { id: "market" as SkillId, label: "Market Research", icon: BarChart3 },
  { id: "content" as SkillId, label: "Content Engine", icon: FileText },
  { id: "product" as SkillId, label: "Product Intelligence", icon: BrainCircuit },
  { id: "settings" as SkillId, label: "Settings", icon: Settings },
];

const categories = ["Finance", "Productivity", "Health", "Lifestyle", "Business", "Education"];

const marketMap = [
  { app: "Taskito", installs: "1M+", rating: "4.6", complaints: "Reminder fatigue" },
  { app: "TickTick", installs: "5M+", rating: "4.7", complaints: "Feature overload" },
  { app: "Loop Habit Tracker", installs: "5M+", rating: "4.7", complaints: "Weak AI insights" },
  { app: "HabitNow", installs: "1M+", rating: "4.8", complaints: "No smart adaptation" },
  { app: "Microsoft To Do", installs: "10M+", rating: "4.6", complaints: "Generic workflow" },
];

const gapRadar = [
  { cluster: "Generic recommendations", count: 312, signal: "high" },
  { cluster: "Onboarding friction", count: 254, signal: "high" },
  { cluster: "Weak sync reliability", count: 181, signal: "medium" },
  { cluster: "Reminder noise", count: 166, signal: "medium" },
];

const opportunities = [
  { title: "AI Habit Copilot for Indian Shift Workers", confidence: 91, difficulty: "Medium" },
  { title: "Offline-first Micro Habits for Tier-2/3", confidence: 84, difficulty: "Low" },
  { title: "Localized Behavioral Reward Loop", confidence: 78, difficulty: "High" },
];

function generateLinkedInDraft(idea: string) {
  const cleaned = idea.trim() || "Most teams don't fail from lack of effort. They fail from unclear system design.";
  return [
    `${cleaned.split(".")[0] || cleaned}`,
    "The gap isn't talent. It's execution consistency.",
    "",
    "In the last 30 days, we tested a tighter writing loop:",
    "→ one core insight per post",
    "→ one audience pain point per draft",
    "→ one CTA that invites conversation",
    "",
    "The result:",
    "Higher saves, better comments, and clearer positioning.",
    "",
    "P.S. What's one process change that improved your output recently?",
  ].join("\n");
}

function SkillMarketResearch({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [category, setCategory] = useState("Finance");
  const [niche, setNiche] = useState("AI habit tracker for Indian users");
  const [analyzing, setAnalyzing] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPrd, setShowPrd] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setReady(false);
    setShowPrd(false);
    onLog(`[Market Engine] Starting India analysis for ${category}`);
    window.setTimeout(() => {
      setAnalyzing(false);
      setReady(true);
      onLog("[Market Engine] Gap analysis complete. 3 opportunities drafted.");
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">Play Store Research</p>
        <h2 className="text-xl font-semibold">Market Engine (India Scope)</h2>
        <p className="mt-1 text-sm text-white/70">
          Select category, run a gap scan, then expand into a PRD draft.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                setNiche(`${item} opportunity in India with underserved demand`);
                onLog(`[Market Engine] Category switched to ${item}`);
              }}
              className={clsx(
                "rounded-xl border px-3 py-2 text-left text-sm transition",
                category === item
                  ? "border-violet-300/60 bg-violet-500/20"
                  : "border-white/10 bg-black/30 hover:border-white/25",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-violet-300/60"
          />
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30 disabled:opacity-50"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Analyze
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-3 font-semibold">Gap Analysis</h3>
          <div className="space-y-2">
            {gapRadar.map((item) => (
              <div key={item.cluster} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                <span>{item.cluster}</span>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.signal === "high" ? "bg-rose-500/20 text-rose-200" : "bg-amber-500/20 text-amber-200",
                  )}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-3 font-semibold">Opportunity Stack</h3>
          <div className="space-y-2">
            {opportunities.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-white/70">
                  Confidence {item.confidence}% · Difficulty {item.difficulty}
                </p>
              </div>
            ))}
          </div>
          <button
            disabled={!ready}
            onClick={() => {
              setShowPrd(true);
              onLog("[Market Engine] PRD panel opened.");
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm disabled:opacity-45"
          >
            <WandSparkles size={15} />
            Generate PRD
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <h3 className="mb-3 font-semibold">Market Map</h3>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.05] text-white/80">
              <tr>
                <th className="px-3 py-2 font-medium">App</th>
                <th className="px-3 py-2 font-medium">Installs</th>
                <th className="px-3 py-2 font-medium">Rating</th>
                <th className="px-3 py-2 font-medium">Primary Complaint</th>
              </tr>
            </thead>
            <tbody>
              {marketMap.map((row) => (
                <tr key={row.app} className="border-t border-white/10 bg-black/20">
                  <td className="px-3 py-2">{row.app}</td>
                  <td className="px-3 py-2 text-white/80">{row.installs}</td>
                  <td className="px-3 py-2 text-white/80">{row.rating}</td>
                  <td className="px-3 py-2 text-white/75">{row.complaints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPrd && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-300/30 bg-violet-500/10 p-5"
        >
          <h3 className="text-lg font-semibold">PRD Snapshot</h3>
          <p className="mt-2 text-sm text-violet-100">
            Strategy: Build an India-first adaptive routine planner for users with irregular schedules.
          </p>
          <p className="mt-2 text-sm text-violet-100">
            MVP Features: adaptive plans, offline capture, reliability sync, weekly insight cards.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function SkillContentEngine({
  onLog,
}: {
  onLog: (line: string) => void;
}) {
  const [idea, setIdea] = useState(
    "Most product teams underperform because they optimize output, not learning loops."
  );
  const [draft, setDraft] = useState(generateLinkedInDraft(""));
  const [polish, setPolish] = useState(10);

  const polishHint = useMemo(() => {
    if (polish >= 8) return "Polish needed: tighten hook and make CTA more specific.";
    if (polish >= 4) return "Polish needed: reduce one paragraph and add one concrete metric.";
    return "Almost publish-ready. Final tone alignment only.";
  }, [polish]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-violet-200">LinkedIn Post Writer</p>
        <h2 className="text-xl font-semibold">Drafting Studio</h2>
        <p className="mt-1 text-sm text-white/70">
          Uses local skill context from <code>/Users/joy/pm-claude-skills/skills/linkedin-post-writer/SKILL.md</code>.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <h3 className="mb-2 font-semibold">Rough Idea</h3>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="h-52 w-full rounded-xl border border-white/10 bg-black/70 px-3 py-3 text-sm text-zinc-100 caret-violet-300 outline-none placeholder:text-zinc-400 focus:border-violet-300/60"
            placeholder="Write your rough idea here..."
          />
          <button
            onClick={() => {
              setDraft(generateLinkedInDraft(idea));
              onLog("[Content Engine] Draft refined from rough idea.");
            }}
            className="mt-3 rounded-xl border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-sm font-medium transition hover:bg-violet-500/30"
          >
            Refine Draft
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h3 className="mb-2 font-semibold">Refinement Pane</h3>
          <pre className="h-52 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-6 text-white/90">
            {draft}
          </pre>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>10% Polish Slider</span>
              <span className="text-violet-200">{polish}% manual polish remaining</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={polish}
              onChange={(e) => setPolish(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
            <p className="mt-2 text-xs text-white/70">{polishHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillPlaceholder({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{summary}</p>
      <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-white/55">
        Workspace module stub. Ready to connect to local skill runtime.
      </div>
    </div>
  );
}

export default function Home() {
  const [activeSkill, setActiveSkill] = useState<SkillId>("market");
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "[System] Knowledge Work Center booted.",
    "[Status] LinkedIn Post Writer: Online (/Users/joy/pm-claude-skills/skills/linkedin-post-writer/SKILL.md)",
    "[Status] Play Store Research Skill: Online (/Users/joy/Opportunity Research/skills/play-store-opportunity-research)",
  ]);

  const pushLog = (line: string) => {
    setLogs((prev) => [line, ...prev].slice(0, 8));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return sidebarItems;
    const q = query.toLowerCase();
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const switchSkill = (id: SkillId) => {
    setActiveSkill(id);
    setCommandOpen(false);
    setQuery("");
    pushLog(`[System] Switched workspace to ${sidebarItems.find((x) => x.id === id)?.label}.`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0C] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(93,58,196,0.33),transparent_70%)]" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(73,85,190,0.27),transparent_70%)]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(113,78,220,0.2),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 p-4">
        <aside className="hidden w-64 flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:flex">
          <div className="mb-5 flex items-center gap-2">
            <Layers size={18} className="text-violet-200" />
            <span className="font-semibold">Command Center</span>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => switchSkill(item.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                    activeSkill === item.id
                      ? "border-violet-300/50 bg-violet-500/20"
                      : "border-white/10 bg-black/20 hover:border-white/25"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => setCommandOpen(true)}
            className="mt-auto flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80"
          >
            Quick Switch
            <span className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2 py-0.5">
              <Command size={12} /> K
            </span>
          </button>
        </aside>

        <section className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Knowledge Work Center OS</p>
              <h1 className="text-xl font-semibold">Unified Skill Runtime</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                <ShieldCheck size={13} /> LinkedIn Post Writer: Online
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200">
                <Sparkles size={13} /> Play Store Market Engine: Online
              </span>
              <button
                onClick={() => setCommandOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
              >
                <Command size={13} /> Command Menu
              </button>
            </div>
          </header>

          <motion.main layout className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill}
                initial={{ opacity: 0, x: 24, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                {activeSkill === "market" && <SkillMarketResearch onLog={pushLog} />}
                {activeSkill === "content" && <SkillContentEngine onLog={pushLog} />}
                {activeSkill === "product" && (
                  <SkillPlaceholder
                    title="Product Intelligence"
                    summary="Roadmap and product signal analysis workspace."
                  />
                )}
                {activeSkill === "settings" && (
                  <SkillPlaceholder
                    title="Settings"
                    summary="Runtime preferences, model routing, and integration keys."
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.main>

          <footer className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Terminal size={16} className="text-violet-200" />
              <p className="text-sm font-medium">Terminal · Local Skill Logs</p>
            </div>
            <div className="space-y-1 font-mono text-xs text-white/75">
              {logs.map((line, idx) => (
                <p key={`${line}-${idx}`}>{line}</p>
              ))}
              <p className="text-violet-200">[Paths] /Users/joy/Portfolio Tracker · /Users/joy/pm-claude-skills</p>
            </div>
          </footer>
        </section>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="fixed left-1/2 top-[12%] z-50 w-[92vw] max-w-xl -translate-x-1/2 rounded-2xl border border-white/15 bg-[#121217] p-3 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                <Search size={16} className="text-white/55" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
                  placeholder="Jump to skill..."
                />
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchSkill(item.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-sm transition hover:border-white/10 hover:bg-white/8"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {!filteredItems.length && (
                  <p className="px-3 py-2 text-sm text-white/55">No skill found for that query.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

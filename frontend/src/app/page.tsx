"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronLeft, Command, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Skill = {
  id: string;
  name: string;
  description: string;
};

type SignalResponse = {
  markdown: string;
  exists: boolean;
  updatedAt: string | null;
};

const skills: Skill[] = [
  {
    id: "signal",
    name: "Signal Engine",
    description: "Executive synthesis from PM leaders across Substack and X.",
  },
  {
    id: "market",
    name: "Play Store Market Engine",
    description: "Opportunity scans and gap mapping for Indian Android markets.",
  },
  {
    id: "content",
    name: "LinkedIn Content Engine",
    description: "Narrative drafting and distribution-grade post packaging.",
  },
];

function formatDate(iso: string | null) {
  if (!iso) return "Not generated yet";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function SignalWorkspace() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSignal = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/signal", { cache: "no-store" });
      const json = (await res.json()) as SignalResponse;
      setData(json);
    } catch {
      setError("Unable to load daily signal file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignal();
  }, []);

  const refreshSignal = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/signal/refresh", {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.details || json?.error || "Refresh failed.");
        return;
      }

      setData({
        markdown: json.markdown,
        exists: true,
        updatedAt: json.updatedAt,
      });
    } catch {
      setError("Unable to refresh signal. Verify Python dependencies and env keys.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className="glass w-full max-w-5xl rounded-3xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Signal Engine Workspace</p>
          <h2 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Daily Signal Brief</h2>
          <p className="mt-2 text-sm text-zinc-300">Updated: {formatDate(data?.updatedAt ?? null)}</p>
        </div>
        <button
          onClick={refreshSignal}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/30 bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Refresh Signal
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-zinc-300">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading signal...
        </div>
      ) : (
        <article className="editorial rounded-2xl border border-white/10 bg-black/20 p-5 md:p-7">
          <ReactMarkdown>{data?.markdown ?? "- No content"}</ReactMarkdown>
        </article>
      )}
    </motion.div>
  );
}

function PlaceholderWorkspace({ skill }: { skill: Skill }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="glass w-full max-w-4xl rounded-3xl p-8"
    >
      <h2 className="text-2xl font-semibold text-white">{skill.name}</h2>
      <p className="mt-3 text-zinc-300">{skill.description}</p>
      <p className="mt-5 text-sm text-zinc-400">This workspace is reserved and can be expanded in subsequent steps.</p>
    </motion.div>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((skill) => `${skill.name} ${skill.description}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (activeSkill) return;
    const normalized = query.trim().toLowerCase();
    if (normalized === "signal" || normalized === "signal engine") {
      const signalSkill = skills.find((skill) => skill.id === "signal");
      if (signalSkill) {
        setActiveSkill(signalSkill);
      }
    }
  }, [query, activeSkill]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveSkill(null);
        setTimeout(() => inputRef.current?.focus(), 0);
      }

      if (event.key === "Escape" && activeSkill) {
        setActiveSkill(null);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSkill]);

  const activateTopResult = () => {
    if (filtered.length > 0) {
      setActiveSkill(filtered[0]);
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="shell-bg" />

      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100 md:text-xl">Signal Command Center</h1>
          <p className="text-xs text-zinc-400 md:text-sm">Intent-driven workspace for synthesis operations</p>
        </div>
        <div className="glass rounded-full px-3 py-1 text-xs text-zinc-300">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
          Cmd + K
        </div>
      </div>

      <div className="mx-auto flex min-h-[75vh] w-full max-w-6xl items-start justify-center">
        <AnimatePresence mode="wait">
          {!activeSkill ? (
            <motion.section
              key="omnibar"
              layoutId="omnibar-shell"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 130, damping: 20 }}
              className="glass w-full max-w-3xl rounded-3xl p-5 md:p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-300">
                <Command className="h-4 w-4" /> Intent Router
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      activateTopResult();
                    }
                  }}
                  placeholder="Type Signal to open the Signal Engine workspace..."
                  className="w-full bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-500"
                />
              </div>

              <div className="mt-4 space-y-2">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400">No matching skills found.</div>
                ) : (
                  filtered.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setActiveSkill(skill)}
                      className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-violet-300/40 hover:bg-violet-500/10"
                    >
                      <Bot className="mt-0.5 h-4 w-4 text-violet-300" />
                      <span>
                        <span className="block text-sm font-medium text-zinc-100">{skill.name}</span>
                        <span className="block text-xs text-zinc-400">{skill.description}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key={activeSkill.id}
              layoutId="omnibar-shell"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 130, damping: 20 }}
              className="w-full"
            >
              <button
                onClick={() => setActiveSkill(null)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Omnibar
              </button>
              {activeSkill.id === "signal" ? <SignalWorkspace /> : <PlaceholderWorkspace skill={activeSkill} />}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

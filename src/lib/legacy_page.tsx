"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductLeaderDigest from "@/components/ProductLeaderDigest";
import RBIPulse from "@/components/RBIPulse";
import SignalNewsletter from "@/components/SignalNewsletter";
import SignalTopicView from "@/components/SignalTopicView";
import OutputActionBar from "@/components/OutputActionBar";
import SkillWorkspace from "@/components/SkillWorkspace";
import { saveToHistory } from "./outputHistory";
import { resolveChainTargets, buildSeedInputs } from "./skillContextHelpers";
import { SKILLS } from "./skills";
import type { SkillOutput } from "./skillTypes";
import {
  clearContext,
  canChain,
  getCompatibleSkills,
  getContext,
  getContextHint,
  setContext,
  type SkillContext,
} from "./skillContext";

type LegacyHomeProps = {
  initialSkillId?: string | null;
  embedded?: boolean;
  surfaceLabel?: string | null;
};

function NarrativeText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <p key={`${index}-${block.slice(0, 18)}`} className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-800">
          {block}
        </p>
      ))}
    </div>
  );
}

export default function Home({ initialSkillId = null, embedded = false, surfaceLabel = null }: LegacyHomeProps) {
  const normalizedInitialSkillId = useMemo(
    () => (initialSkillId && SKILLS.some((skill) => skill.id === initialSkillId) ? initialSkillId : null),
    [initialSkillId],
  );

  const [query, setQuery] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(normalizedInitialSkillId);
  const [output, setOutput] = useState<SkillOutput | null>(null);
  const [outputId, setOutputId] = useState<string | null>(null);
  const [skillContext, setSkillContext] = useState<SkillContext | null>(() => getContext());
  const [seedValues, setSeedValues] = useState<Record<string, string> | null>(null);
  const [activeContextHint, setActiveContextHint] = useState<string | null>(null);
  const [omnibarFocused, setOmnibarFocused] = useState(true);
  const [signalViewMode, setSignalViewMode] = useState<"topic" | "newsletter" | "product-leaders" | "rbi-pulse">("topic");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSkill = useMemo(
    () => SKILLS.find((skill) => skill.id === activeSkillId) || null,
    [activeSkillId],
  );

  const handleOutputGenerated = (payload: SkillOutput) => {
    setOutput(payload);

    // Save to history
    if (activeSkill) {
      const outputContext: SkillContext = {
        sourceSkillId: activeSkill.id,
        sourceSkillLabel: activeSkill.name,
        outputTitle: payload.title,
        outputBody: payload.body.slice(0, 1400),
        timestamp: new Date().toISOString(),
      };

      setContext(outputContext);
      setSkillContext(outputContext);

      const id = saveToHistory({
        title: payload.title,
        skillId: activeSkill.id,
        skillLabel: activeSkill.name,
        body: payload.body,
      });
      setOutputId(id);
    }
  };

  const chainTargets = useMemo(
    () => resolveChainTargets(activeSkill?.id),
    [activeSkill?.id],
  );

  const compatibleSeedTargets = useMemo(() => {
    const source = skillContext?.sourceSkillId;
    if (!source) return new Set<string>();
    return new Set(getCompatibleSkills(source).map((id) => (id === "prd" ? "product" : id)));
  }, [skillContext]);

  const handleChain = (targetSkillId: string) => {
    const normalizedTarget = targetSkillId === "prd" ? "product" : targetSkillId;
    setActiveSkillId(normalizedTarget);
    setOutput(null);
    setOutputId(null);
    setOmnibarFocused(true);
    setQuery("");
    setActiveContextHint(
      skillContext ? getContextHint(skillContext.sourceSkillId, targetSkillId) : null,
    );
    setSeedValues(buildSeedInputs(normalizedTarget, skillContext));
    window.setTimeout(() => inputRef.current?.blur(), 10);
  };

  const clearSkillContext = () => {
    clearContext();
    setSkillContext(null);
    setSeedValues(null);
    setActiveContextHint(null);
  };

  useEffect(() => {
    if (normalizedInitialSkillId) {
      setOutput(null);
      setActiveSkillId(normalizedInitialSkillId);
      return;
    }
    setOutput(null);
    setActiveSkillId(null);
  }, [normalizedInitialSkillId]);

  useEffect(() => {
    const context = getContext();
    setSkillContext(context);
    const sourceSkillId = context?.sourceSkillId;

    if (!activeSkill || !context || !sourceSkillId) {
      setSeedValues(null);
      setActiveContextHint(null);
      return;
    }

    if (canChain(sourceSkillId, activeSkill.id)) {
      setSeedValues(buildSeedInputs(activeSkill.id, context));
      setActiveContextHint(getContextHint(sourceSkillId, activeSkill.id));
    } else {
      setSeedValues(null);
      setActiveContextHint(null);
    }
  }, [activeSkill]);


  const filteredSkills = useMemo(() => {
    if (!query.trim()) return SKILLS;
    const q = query.toLowerCase();
    return SKILLS.filter(
      (skill) =>
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveSkillId(null);
        setOmnibarFocused(true);
        window.setTimeout(() => inputRef.current?.focus(), 40);
      }

      if (event.key === "Escape") {
        if (output) {
          setOutput(null);
          return;
        }
        if (activeSkillId) {
          setActiveSkillId(null);
          setOmnibarFocused(true);
          window.setTimeout(() => inputRef.current?.focus(), 40);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSkillId, output]);

  if (embedded) {
    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {!activeSkill && (
            <motion.div
              key="embedded-omnibar"
              layoutId="omnibar-shell"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
              className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur"
            >
              <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  omnibarFocused ? "border-zinc-400" : "border-zinc-300"
                }`}
              >
                <Search size={18} className="text-zinc-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onFocus={() => setOmnibarFocused(true)}
                  onBlur={() => setOmnibarFocused(false)}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredSkills.length) {
                      setActiveSkillId(filteredSkills[0].id);
                    }
                  }}
                  className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-500"
                  placeholder="Find a workflow... (e.g., signal, market research, linkedin, prompt)"
                />
              </div>
              {skillContext && (
                <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  Context from <span className="font-semibold">{skillContext.sourceSkillLabel}</span>: continue with a recommended next workflow when supported.
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Recommended Workflows</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      const isSuggested = compatibleSeedTargets.has(skill.id);
                      return (
                        <button
                          key={`quick-${skill.id}`}
                          onClick={() => setActiveSkillId(skill.id)}
                          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
                        >
                        <span className="flex items-center gap-2">
                          <Icon size={16} className="text-zinc-600" />
                          <span>{skill.name}</span>
                        </span>
                        {isSuggested && (
                          <span className="text-[10px] uppercase tracking-wide text-violet-600">Chain</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {filteredSkills.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setActiveSkillId(skill.id)}
                      className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-400 hover:shadow-sm"
                    >
                      <Icon size={18} className="mt-0.5 text-zinc-600" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{skill.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-600">{skill.description}</p>
                      </div>
                    </button>
                  );
                })}
                {!filteredSkills.length && (
                  <p className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600">
                    No matching skill. Try another intent phrase.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {activeSkill && (
            <motion.div
              key={`embedded-${activeSkill.id}`}
              layoutId="omnibar-shell"
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
              className="rounded-3xl border border-zinc-200 bg-[#FCFCFC] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)]"
            >
              <SkillWorkspace
                skill={activeSkill}
                onClose={() => setActiveSkillId(null)}
                onRun={handleOutputGenerated}
                seedValues={seedValues}
                contextHint={activeContextHint}
                onClearContext={skillContext ? clearSkillContext : undefined}
                surfaceLabel={surfaceLabel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {output && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOutput(null)}
                className="fixed inset-y-0 left-[240px] right-[280px] z-30 bg-zinc-900/10"
              />
              <motion.div
                initial={{ y: "100%", opacity: 0.7 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0.7 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="fixed bottom-0 left-[240px] right-[280px] z-40 mx-auto w-auto rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-[0_-20px_60px_rgba(2,6,23,0.12)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-zinc-900">{output.title}</h3>
                  <div className="flex items-center gap-2">
                    {/* View mode toggle for knowledge feed */}
                    {Array.isArray(output.sections) && output.sections.length > 0 && (
                      <div className="flex rounded-lg border border-zinc-300 bg-white">
                        <button
                          onClick={() => setSignalViewMode("topic")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            signalViewMode === "topic"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          } rounded-l-lg`}
                        >
                          Topics
                        </button>
                        <button
                          onClick={() => setSignalViewMode("newsletter")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "newsletter"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          Brief
                        </button>
                        <button
                          onClick={() => setSignalViewMode("product-leaders")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "product-leaders"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          Leaders
                        </button>
                        <button
                          onClick={() => setSignalViewMode("rbi-pulse")}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-200 ${
                            signalViewMode === "rbi-pulse"
                              ? "bg-blue-600 text-white"
                              : "text-zinc-700 hover:bg-zinc-50"
                          } rounded-r-lg`}
                        >
                          RBI
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setOutput(null)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
                {Array.isArray(output.sections) && output.sections.length > 0 ? (
                  <div className="max-h-[70vh] overflow-auto">
                    {signalViewMode === "topic" ? (
                      <SignalTopicView signals={output.sections} updatedAt={output.updatedAt} />
                    ) : (
                      <SignalNewsletter signals={output.sections} updatedAt={output.updatedAt} />
                    )}
                  </div>
                ) : (
                  <div className="max-h-[56vh] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <NarrativeText text={output.body} />
                  </div>
                )}

                <OutputActionBar
                  outputId={outputId}
                  title={output.title}
                  body={output.body}
                  sourceSkillId={activeSkill?.id}
                  compatibleSkills={chainTargets}
                  onChain={handleChain}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAFA] text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="absolute right-16 top-24 h-48 w-48 rotate-12 rounded-3xl border border-zinc-200/70" />
        <div className="absolute bottom-20 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.07),transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Knowledge Work Center</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">Intent-Driven Omnibar</h1>
            </div>
            <button
              onClick={() => {
                setActiveSkillId(null);
                setOmnibarFocused(true);
                window.setTimeout(() => inputRef.current?.focus(), 40);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm"
            >
              <Command size={14} /> Cmd + K
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!activeSkill && (
              <motion.div
                key="omnibar"
                layoutId="omnibar-shell"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
                className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)] backdrop-blur"
              >
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    omnibarFocused ? "border-zinc-400" : "border-zinc-300"
                  }`}
                >
                  <Search size={18} className="text-zinc-500" />
                  <input
                    ref={inputRef}
                    value={query}
                    onFocus={() => setOmnibarFocused(true)}
                    onBlur={() => setOmnibarFocused(false)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredSkills.length) {
                        setActiveSkillId(filteredSkills[0].id);
                      }
                    }}
                    className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-500"
                    placeholder="Route intent to skill... (e.g., signal, play store, linkedin, idp, prompt)"
                />
              </div>
              {skillContext && (
                <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  Context from <span className="font-semibold">{skillContext.sourceSkillLabel}</span>: resume from available chain when supported.
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">Quick Launch</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      const isSuggested = compatibleSeedTargets.has(skill.id);
                      return (
                        <button
                          key={`quick-${skill.id}`}
                          onClick={() => setActiveSkillId(skill.id)}
                          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
                        >
                        <span className="flex items-center gap-2">
                          <Icon size={16} className="text-zinc-600" />
                          <span>{skill.name}</span>
                        </span>
                        {isSuggested && (
                          <span className="text-[10px] uppercase tracking-wide text-violet-600">Chain</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                </div>

                <div className="mt-4 space-y-2">
                  {filteredSkills.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.id}
                        onClick={() => setActiveSkillId(skill.id)}
                        className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-400 hover:shadow-sm"
                      >
                        <Icon size={18} className="mt-0.5 text-zinc-600" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{skill.name}</p>
                          <p className="mt-0.5 text-xs text-zinc-600">{skill.description}</p>
                        </div>
                      </button>
                    );
                  })}
                  {!filteredSkills.length && (
                    <p className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600">
                      No matching workflow. Try another intent phrase.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {activeSkill && (
              <motion.div
                key={activeSkill.id}
                layoutId="omnibar-shell"
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
                className="rounded-3xl border border-zinc-200 bg-[#FCFCFC] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.08)]"
              >
                <SkillWorkspace
                  skill={activeSkill}
                  onClose={() => setActiveSkillId(null)}
                  onRun={handleOutputGenerated}
                  seedValues={seedValues}
                  contextHint={activeContextHint}
                  onClearContext={skillContext ? clearSkillContext : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {output && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOutput(null)}
              className="fixed inset-0 z-30 bg-zinc-900/10"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.7 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-5xl rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-[0_-20px_60px_rgba(2,6,23,0.12)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-zinc-900">{output.title}</h3>
                <div className="flex items-center gap-2">
                  {/* View mode toggle for knowledge feed */}
                  {Array.isArray(output.sections) && output.sections.length > 0 && (
                    <div className="flex rounded-lg border border-zinc-300 bg-white">
                      <button
                        onClick={() => setSignalViewMode("topic")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          signalViewMode === "topic"
                            ? "bg-blue-600 text-white rounded-l-lg"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        Topics
                      </button>
                      <button
                        onClick={() => setSignalViewMode("newsletter")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          signalViewMode === "newsletter"
                            ? "bg-blue-600 text-white rounded-r-lg"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        Brief
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setOutput(null)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              {Array.isArray(output.sections) && output.sections.length > 0 ? (
                <div className="max-h-[70vh] overflow-auto">
                  {signalViewMode === "topic" && (
                    <SignalTopicView signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "newsletter" && (
                    <SignalNewsletter signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "product-leaders" && (
                    <ProductLeaderDigest signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                  {signalViewMode === "rbi-pulse" && (
                    <RBIPulse signals={output.sections} updatedAt={output.updatedAt} />
                  )}
                </div>
              ) : (
                <div className="max-h-[56vh] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <NarrativeText text={output.body} />
                </div>
              )}

              <OutputActionBar
                outputId={outputId}
                title={output.title}
                body={output.body}
                sourceSkillId={activeSkill?.id}
                compatibleSkills={chainTargets}
                onChain={handleChain}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
